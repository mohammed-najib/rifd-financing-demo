// Read-only synthetic selector review. Run with Node; no provider or credential use.
// Usage: node /tmp/jev-selection-bound-review/review-selector.mjs [package-root] [output-json]
import assert from 'node:assert/strict';
import {readFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const packageRoot=resolve(process.argv[2]??'/home/mdnb/Dev/Projects/project_impress_bank/.scratch/worktrees/jev-validation-final');
const outputPath=resolve(process.argv[3]??'/tmp/jev-selection-bound-review/review-selector-output.json');
assert.ok(outputPath.startsWith('/tmp/'),'Review output must stay outside the sealed package');
const commit='8211d6fcc50054520f68bad9fcbac9196606ebf7';
const read=relative=>readFile(resolve(packageRoot,relative));
const json=async relative=>JSON.parse(await read(relative));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const imported=relative=>import(pathToFileURL(resolve(packageRoot,relative)).href);
const expectedHashes={
 'selector.mjs':'c60db73b42fc3faf89345f709285ea512ab4f0d7887eba800ba237f316007175',
 'policy.mjs':'41af75e3f2ed638ddba0388573de362437f81be03a8bbd9b993eedff045eb01e',
 'run.mjs':'ba6f6bb47b47264f2799ed6458579e17e5dc4b302d67a728eb628aa882790406',
 'capacity-targeted.mjs':'0f65cd6dd5bcf883e79454b403d69b17ef8c33b6c9abbc5ceb5abda278878022',
 'synthetic.mjs':'9d66e40118487e5867561896a0a3bd5f78ea22c03856bf9e4fbbac4db625d50f',
 'capacity-heterogeneous.mjs':'48e643cea371ee221cc65d335720cbf1338cb1ac5e9cc89a514ac9572b269536'
};
const sourceHashes={};
for(const [name,expected] of Object.entries(expectedHashes)){
 const relative='experiment/validation-controls/'+name;
 const bytes=await read(relative);
 assert.equal(hash(bytes),expected,'Reviewed source differs from previously verified source/artifact commit: '+relative);
 sourceHashes[relative]=hash(bytes);
}
const {select,extractObservations,freezeCaseInventory}=await imported('experiment/validation-controls/selector.mjs');
const {manyCases,options}=await imported('experiment/validation-controls/synthetic.mjs');
const deterministic=result=>{const {elapsedMs,...rest}=result;return rest;};
const enabled=result=>Object.entries(result.policy.cells).filter(([,cell])=>cell.eligible&&cell.floor!==null).map(([key,cell])=>[key,cell.floor]);
const gcd=(a,b)=>b?gcd(b,a%b):a;
const coverage=(m,language,task)=>{
 const metric=m[language][task];
 let [n,d]=metric.exact.useful.map(BigInt);d*=BigInt(metric.denominator);
 if(!d)return ['0','1'];const g=gcd(n,d);return [String(n/g),String(d/g)];
};
const fixtureResults=[];
for(const name of ['broad-varied','broad-uniform','roster-shaped']){
 const inputPath='final-evidence/'+name+'-cases.json';
 const savedPath='final-evidence/'+name+(name==='roster-shaped'?'-result':'-trace')+'.json';
 const input=await json(inputPath),saved=await json(savedPath);
 const observations=input.cases.flatMap(extractObservations);
 const result=select({cases:input.cases,observations,frozenInventory:freezeCaseInventory(input.cases),meaningDigest:input.meaningDigest??input.cases[0].meaningDigest,fabricated:true,...(input.frozenRoster?{frozenRoster:input.frozenRoster}:{})});
 assert.deepEqual(deterministic(result),deterministic(saved));
 fixtureResults.push({name,inputPath,inputSha256:hash(await read(inputPath)),savedPath,savedSha256:hash(await read(savedPath)),deterministicMatch:true,cases:input.cases.length,fullRuns:result.fullRunDenominator,probes:result.standaloneProbeDenominator,observations:observations.length,eligibleCells:Object.keys(result.eligible).length,enabledCells:enabled(result).length,...(name==='roster-shaped'?{selectedEnabledCells:enabled(result)}:{}),status:result.status,globalOptimalityEstablished:result.globalOptimalityEstablished,fullCoverageSupportReduction:result.trace.some(row=>row.fullCoverageSupportReduction),coverage:Object.fromEntries(['ar','en'].map(language=>[language,{finding:coverage(result.metrics,language,'finding'),highlight:coverage(result.metrics,language,'highlight')}])),releaseCoveragePassed:result.releaseCoveragePassed,work:result.work,elapsedMs:result.elapsedMs});
}

const stressInputPath='binding-evidence/roster-broad-probe-cases.json',stressSavedPath='binding-evidence/roster-broad-probe-result.json';
const stressInput=await json(stressInputPath),stressSaved=await json(stressSavedPath);
const stressObservations=stressInput.cases.flatMap(extractObservations);
const stress=select({cases:stressInput.cases,observations:stressObservations,frozenInventory:freezeCaseInventory(stressInput.cases),meaningDigest:stressInput.meaningDigest??stressInput.cases[0].meaningDigest,fabricated:true,...(stressInput.frozenRoster?{frozenRoster:stressInput.frozenRoster}:{})});
assert.deepEqual(deterministic(stress),deterministic(stressSaved));
assert.equal(stress.globalOptimalityEstablished,false);
assert.ok(Object.values(stress.policy.cells).every(cell=>cell.floor===null&&!cell.eligible));

// This preserved targeted script only prints results. It never writes artifacts.
// Its four-cell exhaustive oracle shares production metrics and policy replay.
const targetedLines=[],originalLog=console.log;
try{console.log=(...args)=>targetedLines.push(args.join(' '));await imported('experiment/validation-controls/capacity-targeted.mjs');}
finally{console.log=originalLog;}
assert.equal(targetedLines.length,1);
const targeted=JSON.parse(targetedLines[0]);
assert.equal(targeted.oracle.enumerated,2401);
const rationalBoundary=[];
for(const count of [20,19]){
 const cases=manyCases(count).filter(c=>c.language==='en');let n=0;
 for(const c of cases){
  for(const key of Object.keys(c.labels.cellTruth))if(!key.includes('/page/category/'))delete c.labels.cellTruth[key];
  if(c.kind==='full-chain'){
   c.family='EXACT-FAMILY-'+n;c.snapshot.pageResults[0][1].native.answers.category.confidence=.9;
   if(n++===0)c.labels.pages[0].category='other';
  }
 }
 const result=select(options(cases)),floor=result.policy.cells['en/identity/page/category/identity'].floor;
 assert.equal(floor,count===20?.9:null);
 rationalBoundary.push({displayedPopulation:count,correctPopulation:count-1,requiredAccuracy:['19','20'],selectedFloor:floor,resultExact:result.metrics.en.category.exact});
}
const output={version:'read-only-selector-review-v1',reviewedSourceArtifactCommit:commit,packageRoot,sourceHashes,providerCalls:0,credentialsUsed:false,sealedPackageModified:false,evidenceKind:'synthetic capacity and search mechanics only; no native calibration, paid authority or release acceptance',fixtures:fixtureResults,broaderStress:{inputPath:stressInputPath,inputSha256:hash(await read(stressInputPath)),savedPath:stressSavedPath,savedSha256:hash(await read(stressSavedPath)),deterministicMatch:true,cases:stressInput.cases.length,observations:stressObservations.length,eligibleCells:Object.keys(stress.eligible).length,status:stress.status,globalOptimalityEstablished:false,allUnset:true,work:stress.work,elapsedMs:stress.elapsedMs},nativeBoundary:targeted.nativeBoundary,nativeExtraction:targeted.nativeExtraction,crossSlotSharedFamily:targeted.crossSlotSharedFamily,oracle:{...targeted.oracle,scope:'four category/readability cells; exhaustive raw-candidate enumeration independently checks search while sharing production policy replay and metrics; not independent verification of all policy meanings'},rationalMetricBoundary:rationalBoundary,assessment:'Exact computation completes on the three preserved structures. Mixed108 selects three cells with 1/99 Arabic and 1/192 English useful-finding coverage and no highlights. Broader mixed stress exhausts safely. No guaranteed worst-case or native high-coverage capacity is established.'};
await writeFile(outputPath,JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({outputPath,sha256:hash(await readFile(outputPath)),fixtures:fixtureResults.map(({name,enabledCells,elapsedMs})=>({name,enabledCells,elapsedMs})),stress:stress.status,oracleCombinations:targeted.oracle.enumerated}));
