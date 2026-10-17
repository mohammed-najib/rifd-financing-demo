import assert from 'node:assert/strict';
import {createHash,createPrivateKey,createPublicKey,generateKeyPairSync,sign,verify} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync,existsSync,realpathSync,statSync,renameSync,readlinkSync} from 'node:fs';
import {dirname,resolve,join,relative,isAbsolute,sep} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

const folder=dirname(fileURLToPath(import.meta.url));
const root=resolve(folder,'../../../..');
const worktree=join(root,'.scratch/worktrees/jev-selection-execution');
const evidence=join(worktree,'native-evidence');
const preview=join(folder,'preview');
const runtime=resolve(folder,'../runtime');
const names=['authorization.json','human-review.json','account.json','freeze-initial.json'];
const expectedManifest='7e5670c39b6ce877df05bd6c3641a1a6b6f30630754bda554fe21f31c909758e';
const expectedAuthorization='a5a398ca8b870444c4aa2cd2326f244750341c3b9a86c2169c422b552f7708cb';
const expectedSeal='3eae130135ca36c0cf7d8b429400ba2a694234c8fa13a6f8740e9bc113ff1827';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=path=>JSON.parse(readFileSync(path,'utf8'));
const fail=message=>{throw Error(message);};
const save=(path,value)=>writeFileSync(path,JSON.stringify(value,null,2)+'\n',{mode:0o600});
const publicPem=key=>createPublicKey(key).export({type:'spki',format:'pem'});
const fingerprint=pem=>hash(createPublicKey(pem).export({type:'spki',format:'der'}));

// This helper has no provider transport and never loads the TypeSafe credential.
globalThis.fetch=async()=>{throw Error('Signing helper has no network transport');};

export function usdToNano(value){
 if(!/^\d+(?:\.\d{1,9})?$/.test(value))fail('Enter USD as digits with up to nine decimal places, such as 5.00');
 const [whole,fraction='']=value.split('.');
 const nano=BigInt(whole)*1000000000n+BigInt(fraction.padEnd(9,'0'));
 if(nano>BigInt(Number.MAX_SAFE_INTEGER))fail('USD amount exceeds exact integer range');
 return Number(nano);
}

export function checkBudget(creditNano,previousChargeNano=0){
 if(!Number.isSafeInteger(creditNano)||creditNano<0||!Number.isSafeInteger(previousChargeNano)||previousChargeNano<0)fail('Unknown account values');
 if(previousChargeNano+814743552>1000000000)fail('Full proposal exceeds the cumulative US$1 ceiling');
 if(creditNano-814743552<4000000000)fail('Full proposal would use the protected US$4 credit');
}

export function encryptedKey(passphrase){
 if(passphrase.length<12)fail('Use a signing passphrase of at least 12 characters');
 return generateKeyPairSync('ed25519',{
  publicKeyEncoding:{type:'spki',format:'pem'},
  privateKeyEncoding:{type:'pkcs8',format:'pem',cipher:'aes-256-cbc',passphrase},
 });
}

export function unlockKey(pem,passphrase){
 if(!pem.includes('-----BEGIN ENCRYPTED PRIVATE KEY-----'))fail('An encrypted PKCS#8 private key is required');
 let key;
 try{key=createPrivateKey({key:pem,format:'pem',passphrase});}catch{fail('Unable to unlock this signing key');}
 if(key.asymmetricKeyType!=='ed25519')fail('An Ed25519 key is required');
 return key;
}

export function signBodies(bodies,key){
 return Object.fromEntries(Object.entries(bodies).map(([name,body])=>[name,{body,signature:sign(null,Buffer.from(JSON.stringify(body)),key).toString('base64')} ]));
}

export function verifyEnvelopes(envelopes,pem,now=Date.now()){
 const key=createPublicKey(pem);
 if(key.asymmetricKeyType!=='ed25519')fail('An Ed25519 public key is required');
 for(const envelope of Object.values(envelopes)){
  if(!envelope?.body||typeof envelope.signature!=='string'||!verify(null,Buffer.from(JSON.stringify(envelope.body)),key,Buffer.from(envelope.signature,'base64')))fail('Receipt signature does not verify');
  if(!Number.isFinite(Date.parse(envelope.body.validUntil))||Date.parse(envelope.body.validUntil)<=now)fail('Receipt has expired');
 }
}

export function buildBodies(drafts,{creditNano,validUntil,balanceSha256,chargesSha256,observedAt}){
 checkBudget(creditNano,drafts['account.json'].body.previousChargeNano);
 if(!Number.isFinite(Date.parse(validUntil))||Date.parse(validUntil)<=Date.now())fail('Choose a future UTC expiry');
 if(![balanceSha256,chargesSha256].every(v=>/^[a-f0-9]{64}$/.test(v??'')))fail('Actual balance and charge-history evidence is required');
 if(!Number.isFinite(Date.parse(observedAt)))fail('Account observation time is missing');
 const bodies=Object.fromEntries(names.map(name=>[name,{...structuredClone(drafts[name].body),validUntil}]));
 Object.assign(bodies['account.json'],{availableCreditNano:creditNano,balanceEvidenceSha256:balanceSha256,chargeEvidenceSha256:chargesSha256,noUnexplainedCharges:true,observedAt});
 return bodies;
}

function context(){
 const drafts=json(join(evidence,'receipt-drafts.json'));
 if(hash(JSON.stringify(json(join(evidence,'activation-manifest.json'))))!==expectedManifest)fail('Activation manifest changed');
 if(hash(readFileSync(join(root,'.scratch/jev-evidence-assistance/selection-bound-review/bootstrap-corrected/paid-authorization-2026-10-17.json')))!==expectedAuthorization)fail('Accepted authorization changed');
 for(const name of names){
  const b=drafts[name].body;
  if(b.manifestDigest!==expectedManifest||b.acceptedAuthorizationSha256!==expectedAuthorization||b.ledgerIdentity!==drafts.ledgerIdentity||b.actor!=='Authorized reviewer'||drafts[name].signature!==null)fail('Sealed unsigned receipt draft changed');
 }
 if(resolve(drafts.ledgerPath)!==join(runtime,'attempt-ledger.json'))fail('Immutable ledger path changed');
 return drafts;
}

async function verifySource(){
 context();
 // Hash the already verified package as opaque bytes. No candidate code or SDK
 // is executed while deciding whether to let the human sign its exact identity.
 const manifest=json(join(evidence,'activation-manifest.json'));
 const sealBytes=readFileSync(join(evidence,'source-seal.json'));
 assert.equal(hash(sealBytes),expectedSeal,'Source/artifact seal changed');
 for(const [path,sha]of Object.entries(manifest.files))assert.equal(hash(readFileSync(resolve(root,path))),sha,path);
 for(const [path,target]of Object.entries(manifest.links))assert.equal(readlinkSync(resolve(root,path)),target,path);
 for(const [path,sha]of Object.entries(JSON.parse(sealBytes).files))assert.equal(hash(readFileSync(join(worktree,path))),sha,path);
 console.log('Sealed activation code, evidence and all 149 reviewed bindings verified.');
}

function noRuntime(){
 if(existsSync(runtime))fail('A runtime packet already exists. Preserve it; do not replace it or restart an existing ledger.');
}

export function outsideWorkspace(workspace,path){
 const rel=relative(workspace,path);
 return rel==='..'||rel.startsWith('..'+sep)||isAbsolute(rel);
}

function keyPathOutsideWorkspace(path){
 const full=resolve(path);
 mkdirSync(dirname(full),{recursive:true,mode:0o700});
 const actual=join(realpathSync(dirname(full)),full.slice(dirname(full).length+1));
 if(!outsideWorkspace(realpathSync(root),actual))fail('Keep the encrypted private key outside this repository');
 if(existsSync(full)&&realpathSync(full)!==actual)fail('Choose a regular private key file, not a symlink');
 return full;
}

function readPassphrase(){
 const bytes=readFileSync(0);
 try{if(bytes.length>4096)fail('Signing passphrase input is too long');return bytes.toString('utf8');}
 finally{bytes.fill(0);}
}

function checkPrepared(packet,drafts){
 const account=packet.bodies['account.json'];
 const expected=buildBodies(drafts,{creditNano:account.availableCreditNano,validUntil:account.validUntil,balanceSha256:account.balanceEvidenceSha256,chargesSha256:account.chargeEvidenceSha256,observedAt:account.observedAt});
 assert.deepEqual(packet.bodies,expected,'Unsigned preview no longer matches the sealed receipt contract');
 assert.equal(packet.manifestDigest,expectedManifest);
 for(const [name,sha]of [['balance',account.balanceEvidenceSha256],['charges',account.chargeEvidenceSha256]])assert.equal(hash(readFileSync(join(preview,name+'.evidence'))),sha,'Account capture changed');
}

async function command(command,args){
 if(command==='inspect'){
  noRuntime();await verifySource();
  console.log('Exact initial-development packet verified. No provider call, reservation or runtime freeze was made.');
 }else if(command==='key'){
  noRuntime();context();const path=keyPathOutsideWorkspace(args[0]);const passphrase=readPassphrase();
  let key;
  if(existsSync(path)){
   if(!statSync(path).isFile()||(statSync(path).mode&0o077))fail('Existing encrypted key must be a regular file readable only by its owner');
   key=unlockKey(readFileSync(path,'utf8'),passphrase);
  }else{
   const pair=encryptedKey(passphrase);writeFileSync(path,pair.privateKey,{flag:'wx',mode:0o600});key=unlockKey(pair.privateKey,passphrase);
  }
  const pem=publicPem(key),pub=path+'.public.pem';
  if(existsSync(pub))assert.equal(readFileSync(pub,'utf8'),pem,'Existing public key differs');
  else writeFileSync(pub,pem,{flag:'wx',mode:0o600});
  console.log('Your public-key SHA-256 fingerprint: '+fingerprint(pem));
 }else if(command==='prepare'){
  noRuntime();const drafts=context();const [path,credit,balancePath,chargesPath,expiry]=args;
  const pem=readFileSync(keyPathOutsideWorkspace(path)+'.public.pem','utf8');
  const captures=[balancePath,chargesPath].map(path=>{const stat=statSync(path);if(!stat.isFile()||stat.size===0||stat.size>33554432)fail('Use a nonempty local account capture no larger than 32 MiB');return readFileSync(path);});
  const validUntil=expiry||new Date(Date.now()+86400000).toISOString();
  const bodies=buildBodies(drafts,{creditNano:usdToNano(credit),validUntil,balanceSha256:hash(captures[0]),chargesSha256:hash(captures[1]),observedAt:new Date().toISOString()});
  mkdirSync(preview,{recursive:true,mode:0o700});
  writeFileSync(join(preview,'balance.evidence'),captures[0],{mode:0o600});writeFileSync(join(preview,'charges.evidence'),captures[1],{mode:0o600});
  const packet={status:'UNSIGNED PREVIEW; ENABLES NOTHING',manifestDigest:expectedManifest,publicKey:pem,publicKeySha256:fingerprint(pem),bodies};
  save(join(preview,'packet.json'),packet);
  console.log('Review '+join(preview,'packet.json'));
  console.log('Signer: the operator. Public-key fingerprint: '+packet.publicKeySha256);
  console.log('Expiry: '+validUntil+'. Current credit: US$'+credit+'. Maximum proposed reservation: US$0.814743552.');
  console.log('Four receipts cover existing authorization, carried source review, current account facts and the initial development freeze. Native outcomes remain unreviewed.');
 }else if(command==='sign'){
  noRuntime();await verifySource();const drafts=context(),packet=json(join(preview,'packet.json'));checkPrepared(packet,drafts);
  const path=keyPathOutsideWorkspace(args[0]);const key=unlockKey(readFileSync(path,'utf8'),readPassphrase());
  assert.equal(publicPem(key),packet.publicKey,'Signing key differs from the key you reviewed');
  const envelopes=signBodies(packet.bodies,key);verifyEnvelopes(envelopes,packet.publicKey);
  const staged=join(folder,'staged-runtime');mkdirSync(staged,{mode:0o700});mkdirSync(join(staged,'account-evidence'),{mode:0o700});
  for(const name of names)save(join(staged,name),envelopes[name]);
  for(const name of ['balance','charges'])writeFileSync(join(staged,'account-evidence',name+'.evidence'),readFileSync(join(preview,name+'.evidence')),{flag:'wx',mode:0o600});
  save(join(staged,'trusted-actors.json'),{actorAuthorized:true,establishedBy:'the operator personally ran the local signing wizard, confirmed control of this encrypted key and approved these exact receipt bodies.',establishedAt:new Date().toISOString(),publicKeySha256:packet.publicKeySha256,manifestDigest:expectedManifest,ledgerIdentity:drafts.ledgerIdentity,keys:{'Authorized reviewer':packet.publicKey},signingHelperSha256:hash(readFileSync(fileURLToPath(import.meta.url))),wizardSha256:hash(readFileSync(join(folder,'sign-runtime.sh')))});
  noRuntime();renameSync(staged,runtime);
  console.log('Signed runtime packet written. No private key or passphrase was copied into it.');
 }else if(command==='verify'){
  await verifySource();const drafts=context(),trust=json(join(runtime,'trusted-actors.json'));
  const envelopes=Object.fromEntries(names.map(name=>[name,json(join(runtime,name))]));
  verifyEnvelopes(envelopes,trust.keys['Authorized reviewer']);
  const account=envelopes['account.json'].body;
  const expected=buildBodies(drafts,{creditNano:account.availableCreditNano,validUntil:account.validUntil,balanceSha256:account.balanceEvidenceSha256,chargesSha256:account.chargeEvidenceSha256,observedAt:account.observedAt});
  for(const name of names)assert.deepEqual(envelopes[name].body,expected[name]);
  assert.equal(trust.actorAuthorized,true);assert.ok(trust.establishedBy);assert.equal(trust.publicKeySha256,fingerprint(trust.keys['Authorized reviewer']));
  assert.equal(trust.manifestDigest,expectedManifest);assert.equal(trust.ledgerIdentity,drafts.ledgerIdentity);
  for(const [name,sha]of [['balance',account.balanceEvidenceSha256],['charges',account.chargeEvidenceSha256]])assert.equal(hash(readFileSync(join(runtime,'account-evidence',name+'.evidence'))),sha);
  console.log('Four local signatures and their exact bindings verify against your public key. Account captures match their signed hashes.');
  console.log('No operational ledger or reservation was created by this wizard. Keep the private key/passphrase private and tell Codex the wizard completed.');
 }else fail('Unknown signing-helper command');
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 try{await command(process.argv[2],process.argv.slice(3));}
 catch(error){console.error('Signing step stopped: '+(error.code??error.name)+'. '+error.message);process.exitCode=1;}
}
