import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {tmpdir} from 'node:os';
import {generateKeyPairSync,sign} from 'node:crypto';
const repo='/home/mdnb/Dev/Projects/project_impress_bank';
const wt=join(repo,'.scratch/worktrees/jev-validation-repair');
const load=name=>import('file://'+join(wt,'experiment/validation-repair',name+'.mjs'));
const {digest,versions,money}=await load('contracts');
const {select,extractObservations,requiredAlternatives,metrics}=await load('selector');
const {pendingPolicy,syntheticPolicy}=await load('policy');
const {ReviewedOfflineRunner}=await load('reviewed-runner');
const {preparedPage,decodeRequest,fakeResponse}=await load('fixtures');
globalThis.fetch=async()=>{throw Error('Network forbidden in audit');};
const {publicKey,privateKey}=generateKeyPairSync('ed25519'),keys={FAKE_REVIEWER:publicKey};
function receipt(purpose,extra){
 const body={purpose,actor:'FAKE_REVIEWER',validUntil:new Date(Date.now()+3600000).toISOString(),fabricated:true,...extra};
 return {body,signature:sign(null,Buffer.from(JSON.stringify(body)),privateKey).toString('base64')};
}
function sample(i,language='ar',truth='identity',confidence=.95){
 return {id:'FAKE-'+i,kind:'full-chain',family:'FAKE-'+i,language,phase:'development',meaningDigest:'FAKE-MEANING',humanChecked:true,familyEligibilityChecked:true,fabricated:false,
 snapshot:{pages:[{page:1,sha256:'fake',width:280,height:280,contentBoundary:{left:0,right:280,top:0,bottom:280}}],source:{sha256:'fake'},context:{slot:'identity',language,comparisons:{}},scope:{originalPageCount:1,pageCountEstablished:true,selectedPages:[1]},fingerprint:'fake',pageResults:[[1,{ok:true,native:{answers:{category:{choice:'identity',confidence},readability:{probabilities:{0:.005,1:.005,2:.99}}}},locations:{}}]],comparison:null,verificationByPage:[]},
 labels:{pages:[{page:1,category:truth,readability:2}],support:{},locations:{'1/name':{safe:false,useful:false}},opportunities:['1/category','1/readability','1/name/highlight'],cellTruth:{}}};
}
const key='ar/identity/page/category/identity',cases=[];
for(let i=0;i<12;i++){
 const truth=i<5?'identity':requiredAlternatives(key)[i-5],positive=truth==='identity',c=sample(i,'ar',truth,positive?.95:.6);
 c.labels.cellTruth['1/'+key]={positive,alternative:positive?null:truth};
 c.reviewReceipt=receipt('development-outcome-review',{actorType:'human',independent:true,caseDigest:digest({snapshot:c.snapshot,labels:c.labels,family:c.family,meaningDigest:c.meaningDigest})});
 c.humanEvidenceDigest=digest(c.reviewReceipt);cases.push(c);
}
const options=cs=>({cases:cs,observations:cs.flatMap(extractObservations),meaningDigest:'FAKE-MEANING',reviewerKeys:keys});
const baseline=select(options(cases)),changed=structuredClone(cases);
for(const c of changed)if(!c.labels.cellTruth['1/'+key].positive)c.kind='standalone-probe';
const altered=select(options(changed));
console.log(JSON.stringify({check:'signed kind binding',fakeOnly:true,signedReceiptsUnchanged:changed.every((c,i)=>digest(c.reviewReceipt)===digest(cases[i].reviewReceipt)),baselineOpportunities:baseline.trace[baseline.selectedIndex].metrics.ar.finding.rawOpportunities,alteredOpportunities:altered.trace[altered.selectedIndex].metrics.ar.finding.rawOpportunities,accepted:altered.status}));
const falseReassurance=Array.from({length:20},(_,i)=>{const c=sample(i,'en','identity',.99);c.labels.pages[0].readability=i<17?2:0;c.labels.pages[0].harmfulReadabilityOutcomes=i<17?[]:[2];return c;});
const m=metrics(syntheticPolicy(),falseReassurance).en.readability;
console.log(JSON.stringify({check:'readability harm',fakeOnly:true,falseReassuranceCases:3,accuracy:m.accuracy,rawErrors:m.rawErrors,harmful:m.harmful,qualifies:m.harmful===0&&m.accuracy>=.85}));
const roster=JSON.parse(await readFile(join(wt,'repair-artifacts/roster-proposal.json'))),manifest=JSON.parse(await readFile(join(wt,'repair-review/artifact-manifest-draft.json'))),tmp=await mkdtemp(join(tmpdir(),'jev-readonly-audit-'));
const account=receipt('account',{model:versions.model,modelAccess:true,imageAccess:true,refillDisabled:true,noUnexplainedCharges:true,billingTermsAccepted:true,retentionTermsAccepted:true,billingEvidenceSha256:'FAKE',retentionEvidenceSha256:'FAKE',pricingEvidenceSha256:'FAKE',chargeEvidenceSha256:'FAKE',balanceEvidenceSha256:'FAKE',maximumInputTokens:65536,maximumOutputChargeNano:0,inputTokenNano:42,maximumPerAttemptNano:money.perAttemptNano,previousChargeNano:123456,availableCreditNano:5000000000-123456});
const authorization=receipt('authorization',{rosterDigest:roster.digest,manifestDigest:digest(manifest),paidDispatchAuthorized:true,executionTask:'FAKE AUDIT',developmentCap:200,evaluationCap:100,ceilingNano:money.ceilingNano,protectedNano:money.protectedNano});
const humanReview=receipt('independent-human-review',{manifestDigest:digest(manifest),rosterDigest:roster.digest,actorType:'human',independent:true,labelsAuthor:'FICTIONAL AGENT',expectedAnswers:true,completeRegions:true,negativeAlternatives:true,familyEligibility:true,heldoutEligibility:true,heldoutModelAnswersUnopened:true});
try{
 const runner=await ReviewedOfflineRunner.create({roster,root:repo,manifest,authorization,humanReview,account,keys,transport:async(url,init)=>Response.json(fakeResponse((await decodeRequest(url,init)).request)),transportMode:'injected-fake',ledgerPath:join(tmp,'ledger')});
 await runner.freeze(receipt('freeze',{rosterDigest:roster.digest,manifestDigest:digest(manifest),versionsDigest:digest(versions),previousStage:runner.stage,stage:'development-initial',rawCollection:true,requireNumericCutoffs:false,provisionalPolicyDigest:digest(pendingPolicy)}));
 const row=roster.development.find(r=>r.pass===1),base=join(repo,'.scratch/jev-evidence-assistance/evaluation');
 if(row.origin!=='original'||row.phase!=='development')throw Error('Audit only permits original development source');
 const source={bytes:await readFile(join(base,row.source.path)),sha256:row.source.sha256,kind:'png',renderComplete:true},pages=[];
 for(const r of row.rasters)pages.push(preparedPage(await readFile(join(base,r.path)),source.sha256,r.page));
 for(const p of pages){p.preparation.sourceToRaster=[1,0,0,1,999,999];p.preparation.auditMarker='UNREVIEWED-METADATA';p.contentBoundary.left=1;}
 const result=await runner.run(row.id,{source,pages,context:row.context,scope:row.scope,policy:pendingPolicy,revision:'UNREVIEWED-REVISION'});
 console.log(JSON.stringify({check:'exact input metadata binding',fakeOnly:true,accepted:true,fakeAttempts:result.fakeAttempts,preparation:result.replaySnapshot.pages[0].preparation,contentBoundaryLeft:result.replaySnapshot.pages[0].contentBoundary.left}));
}finally{await rm(tmp,{recursive:true,force:true});}
