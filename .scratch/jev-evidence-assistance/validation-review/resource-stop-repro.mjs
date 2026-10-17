import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const base='file:///home/mdnb/Dev/Projects/project_impress_bank/.scratch/worktrees/jev-validation-repair/experiment/validation-repair/';
const {encode}=await import(base+'png.mjs');
const {hash,money}=await import(base+'contracts.mjs');
const ledger=await import(base+'ledger.mjs');
const {runCandidate}=await import(base+'supervised.mjs');
const {fakeResponse,decodeRequest,preparedPage,allCoverage}=await import(base+'fixtures.mjs');
const {pendingPolicy}=await import(base+'policy.mjs');
globalThis.fetch=async()=>{throw Error('Network forbidden by audit');};
const dir=await mkdtemp(join(tmpdir(),'jev-resource-audit-'));
try {
 const path=join(dir,'ledger.json'),b=encode({width:1568,height:1568,rgba:Buffer.alloc(1568*1568*4,255)}),source={bytes:b,sha256:hash(b),kind:'png',renderComplete:true},p=preparedPage(b,source.sha256),context={slot:'financial',language:'en',comparisons:{period:'2026-07/09',averageRevenue:'1',averageExpenses:'2'}},scope=allCoverage();
 await ledger.initializeFakeLedger(path,{previousChargeNano:0,availableCreditNano:5000000000});
 await ledger.reservePhase(path,{phase:'development',rosterDigest:'FICTIONAL-AUDIT',runs:[{id:'resource-failure',planned:2},{id:'later-run',planned:2}]});
 const transport=async(url,init)=>{const request=(await decodeRequest(url,init)).request,n=fakeResponse(request);for(const a of Object.values(n.answers))if(a.type==='box')a.box={left:0,top:0,right:1,bottom:1};return Response.json(n);};
 const result=await runCandidate({source,pages:[p],context,scope,transport,ledgerPath:path,runId:'resource-failure',freezeDigest:'FICTIONAL-FREEZE',policy:pendingPolicy,collectDevelopmentEvidence:true});
 const state=JSON.parse(await readFile(path));
 await ledger.reconcileFake(path,'resource-failure',{chargeNano:0,availableCreditNano:5000000000,evidence:'FICTIONAL ZERO CHARGE'});
 await ledger.startRun(path,'later-run','FICTIONAL-FREEZE');
 console.log(JSON.stringify({haltReason:result.haltReason,fakeAttempts:result.fakeAttempts,halted:state.halted,failedRunStatus:state.runs[0].status,laterRunAllowed:true}));
} finally {await rm(dir,{recursive:true,force:true});}
