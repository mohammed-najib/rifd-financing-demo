import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {usdToNano,checkBudget,encryptedKey,unlockKey,signBodies,verifyEnvelopes,buildBodies,outsideWorkspace} from './packet.mjs';

// Every key, passphrase, signature and account value below is a fictional test
// fixture. No test creates an operational runtime file or signs a human identity.
test('USD parsing preserves exact nanodollars and refuses unknown/rounded inputs',()=>{
 assert.equal(usdToNano('5.00'),5000000000);
 assert.equal(usdToNano('0.000000001'),1);
 for(const value of ['','-1','1e3','5.0000000001','US$5','9007199.254740992'])assert.throws(()=>usdToNano(value));
});
test('complete proposal preserves both accepted monetary boundaries',()=>{
 assert.doesNotThrow(()=>checkBudget(4814743552));
 assert.throws(()=>checkBudget(4814743551),/protected/);
 assert.throws(()=>checkBudget(5000000000,185256449),/cumulative/);
 assert.throws(()=>checkBudget(Number.NaN),/Unknown/);
});
test('private-key boundary rejects the workspace and misleading dot-prefixed children',()=>{
 assert.equal(outsideWorkspace('/example/repo','/example/repo'),false);
 assert.equal(outsideWorkspace('/example/repo','/example/repo/..looks-outside/private.pem'),false);
 assert.equal(outsideWorkspace('/example/repo','/example/private.pem'),true);
 assert.equal(outsideWorkspace('/example/repo','/example/repository/private.pem'),true);
});
test('encrypted Ed25519 key requires its passphrase; tampering or expiry invalidates signatures',()=>{
 const passphrase='FICTIONAL-TEST-PASSPHRASE';
 const pair=encryptedKey(passphrase);
 assert.match(pair.privateKey,/BEGIN ENCRYPTED PRIVATE KEY/);
 assert.throws(()=>unlockKey(pair.privateKey,'WRONG-FICTIONAL-PASSWORD'),/Unable to unlock/);
 const key=unlockKey(pair.privateKey,passphrase);
 const bodies={test:{actor:'FICTIONAL TEST ACTOR',fabricated:true,purpose:'TEST ONLY',validUntil:new Date(Date.now()+60000).toISOString()}};
 const envelopes=signBodies(bodies,key);
 verifyEnvelopes(envelopes,pair.publicKey);
 assert.throws(()=>verifyEnvelopes(envelopes,pair.publicKey,Date.now()+120000),/expired/);
 const changed=structuredClone(envelopes);changed.test.body.purpose='TAMPERED';
 assert.throws(()=>verifyEnvelopes(changed,pair.publicKey),/signature/);
});
test('materialization fills only current account evidence and expiry; existing source review is preserved',()=>{
 const drafts=JSON.parse(readFileSync(new URL('../../../worktrees/jev-selection-execution/native-evidence/receipt-drafts.json',import.meta.url),'utf8'));
 const before=JSON.stringify(drafts),validUntil=new Date(Date.now()+60000).toISOString();
 const bodies=buildBodies(drafts,{creditNano:5000000000,validUntil,balanceSha256:'a'.repeat(64),chargesSha256:'b'.repeat(64),observedAt:new Date().toISOString()});
 assert.equal(JSON.stringify(drafts),before);
 assert.equal(bodies['human-review.json'].nativeOutcomesReviewed,false);
 assert.equal(bodies['human-review.json'].carriedSourceReviewSha256,drafts['human-review.json'].body.carriedSourceReviewSha256);
 assert.equal(bodies['account.json'].previousChargeNano,0);
 assert.equal(bodies['account.json'].balanceEvidenceSha256,'a'.repeat(64));
 for(const body of Object.values(bodies))assert.equal(body.validUntil,validUntil);
});
