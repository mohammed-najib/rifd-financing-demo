import {readFile,mkdtemp} from 'node:fs/promises';
import {join} from 'node:path';
import {generateKeyPairSync,sign} from 'node:crypto';
const base='/home/mdnb/Dev/Projects/project_impress_bank/.scratch/worktrees/jev-validation-controls';
const root='/home/mdnb/Dev/Projects/project_impress_bank';
const {ReviewedOfflineRunner}=await import(base+'/experiment/validation-controls/reviewed-runner.mjs');
const {digest,money,versions}=await import(base+'/experiment/validation-controls/contracts.mjs');
const {pendingPolicy}=await import(base+'/experiment/validation-controls/policy.mjs');
const {decodeRequest,fakeResponse}=await import(base+'/experiment/validation-controls/fixtures.mjs');
const roster=JSON.parse(await readFile(base+'/controls-artifacts/roster-proposal.json'));
const manifest=JSON.parse(await readFile(base+'/controls-review/artifact-manifest-draft.json'));
const dir=await mkdtemp('/tmp/jev-preflight-'),ledgerPath=join(dir,'ledger.json');
const {publicKey,privateKey}=generateKeyPairSync('ed25519'),keys={FICTIONAL_REVIEWER:publicKey};
const receipt=(purpose,extra={})=>{const body={purpose,actor:'FICTIONAL_REVIEWER',actorType:'human',independent:true,labelsAuthor:'FICTIONAL_OTHER_AUTHOR',validUntil:new Date(Date.now()+3600000).toISOString(),fabricated:true,...extra};return {body,signature:sign(null,Buffer.from(JSON.stringify(body)),privateKey).toString('base64')};};
let calls=0;
const authorization=receipt('authorization',{manifestDigest:digest(manifest),rosterDigest:roster.digest,paidDispatchAuthorized:true,executionTask:'FICTIONAL OFFLINE TEST',developmentCap:200,evaluationCap:100,ceilingNano:money.ceilingNano,protectedNano:money.protectedNano});
const humanReview=receipt('independent-human-review',{manifestDigest:digest(manifest),rosterDigest:roster.digest,expectedAnswers:true,completeRegions:true,negativeAlternatives:true,familyEligibility:true,heldoutEligibility:true,heldoutModelAnswersUnopened:true});
const account=receipt('account',{model:versions.model,modelAccess:true,imageAccess:true,refillDisabled:true,noUnexplainedCharges:true,billingTermsAccepted:true,retentionTermsAccepted:true,billingEvidenceSha256:'FICTIONAL',retentionEvidenceSha256:'FICTIONAL',pricingEvidenceSha256:'FICTIONAL',chargeEvidenceSha256:'FICTIONAL',balanceEvidenceSha256:'FICTIONAL',maximumInputTokens:65536,maximumOutputChargeNano:0,inputTokenNano:42,maximumPerAttemptNano:money.perAttemptNano,previousChargeNano:0,availableCreditNano:5000000000});
const r=await ReviewedOfflineRunner.create({roster,root,manifest,ledgerPath,authorization,humanReview,account,keys,transportMode:'injected-fake',transport:async(url,init)=>{calls++;return Response.json(fakeResponse((await decodeRequest(url,init)).request));}});
await r.freeze(receipt('freeze',{rosterDigest:roster.digest,manifestDigest:digest(manifest),versionsDigest:digest(versions),previousStage:'created',stage:'development-initial',rawCollection:true,requireNumericCutoffs:false,provisionalPolicyDigest:digest(pendingPolicy)}));

const ledger=await import(base+'/experiment/validation-controls/ledger.mjs');
const freeze=extra=>receipt('freeze',{rosterDigest:roster.digest,manifestDigest:digest(r.manifest),versionsDigest:digest(versions),previousStage:r.stage,...extra});
async function skip(rows){for(const row of rows){const b=r.manifest.runBindings[row.id];await ledger.startRun(ledgerPath,row.id,'FICTIONAL SKIPPED',b.inputDigest);for(let i=0;i<row.planned;i++)await ledger.cancelSlot(ledgerPath,row.id,i);await ledger.closeRun(ledgerPath,row.id);await ledger.reconcileFake(ledgerPath,row.id,{chargeNano:0,availableCreditNano:5000000000,evidence:'FICTIONAL SKIPPED RUN'});}}
const ordered=roster.executionOrder.map(id=>[...roster.development,...roster.probes].find(row=>row.id===id)).filter(Boolean);
await skip(ordered.filter(row=>row.pass===1||roster.probes.some(p=>p.id===row.id)));
await r.freeze(freeze({stage:'development-second-pass',meaningCompatibility:{invalidatedEvidenceIds:[]},provisionalPolicyDigest:digest(pendingPolicy)}));
await skip(ordered.filter(row=>row.pass===2));
const policy=structuredClone(pendingPolicy);for(const cell of Object.values(policy.cells))Object.assign(cell,{floor:0,eligible:true,developmentEvidence:'FICTIONAL NO SELECTOR OR NATIVE EVIDENCE'});
const next=structuredClone(r.manifest);for(const row of roster.evaluation){const b=next.runBindings[row.id];b.execution.policy=structuredClone(policy);b.inputDigest=digest(b.execution);}
const humanNext=receipt('independent-human-review',{manifestDigest:digest(next),rosterDigest:roster.digest,expectedAnswers:true,completeRegions:true,negativeAlternatives:true,familyEligibility:true,heldoutEligibility:true,heldoutModelAnswersUnopened:true});
await r.adoptManifest({manifest:next,humanReview:humanNext,revisionReceipt:receipt('artifact-revision',{stage:r.stage,previousManifestDigest:digest(r.manifest),manifestDigest:digest(next),rosterDigest:roster.digest,changeKind:'numeric-cutoffs-only',selectorEvidenceDigest:'NONEXISTENT SELECTION A',usedEvaluationEvidence:false})});
await r.freeze(freeze({stage:'evaluation-final',numericCutoffsFrozen:true,selectorEvidenceDigest:'DIFFERENT NONEXISTENT SELECTION B',usedEvaluationEvidence:false,finalPolicyDigest:digest(policy)}));
const state=JSON.parse(await readFile(ledgerPath));console.log(JSON.stringify({warning:'FICTIONAL SIGNED INPUTS AND INJECTED FAKE ONLY',stage:r.stage,all568CellsFloorZero:Object.values(policy.cells).every(c=>c.floor===0&&c.eligible),selectorCalled:false,nativeDevelopmentCalls:calls,evaluationRunsReserved:state.runs.filter(x=>x.phase==='evaluation').length,adoptionDigest:r.revisionReceipt.body.selectorEvidenceDigest,finalDigest:r.freezeRecord.selectorEvidenceDigest,ledgerPath,providerAttempts:0}));
