import { readFile } from 'node:fs/promises'
import { applicationDefault } from 'firebase-admin/app'

const iam = JSON.parse(await readFile(new URL('../functions/hosted-iam.json', import.meta.url), 'utf8'))
const logs = JSON.parse(await readFile(new URL('../functions/log-retention.json', import.meta.url), 'utf8'))
const parent = `projects/${iam.projectId}`
const destination = `logging.googleapis.com/${parent}/locations/${logs.location}/buckets/${logs.bucketId}`
const plan = { iam, logs: { ...logs, destination, defaultBucketExclusion: 'rifd-live-seven-day' } }
const [action] = process.argv.slice(2)
if (!['plan', 'apply'].includes(action) || process.argv.length !== 3) throw Error('Usage: node scripts/configure-live-operations.mjs plan|apply')
if (action === 'plan') console.log(JSON.stringify(plan, null, 2))
else {
  // Account access is separate from Firebase's public browser configuration.
  // Never print credentials or copy them into a VITE_ variable.
  const token = process.env.RIFD_OPERATOR_ACCESS_TOKEN ?? (await applicationDefault().getAccessToken()).access_token
  async function google(url, method = 'GET', body) {
    const response = await globalThis.fetch(url, { method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'x-goog-user-project': iam.projectId }, body: body === undefined ? undefined : JSON.stringify(body), signal: globalThis.AbortSignal.timeout(30_000) })
    if (!response.ok) { const error = Error(`Google operation failed with HTTP ${response.status}`); error.status = response.status; throw error }
    return response.json()
  }
  function addGrants(policy, grants) {
    policy.bindings ??= []
    for (const grant of grants) {
      let binding = policy.bindings.find(binding => binding.role === grant.role && !binding.condition)
      if (!binding) { binding = { role: grant.role, members: [] }; policy.bindings.push(binding) }
      binding.members = [...new Set([...binding.members, ...grant.members])]
    }
    return policy
  }
  const project = `https://cloudresourcemanager.googleapis.com/v1/${parent}`
  const policy = await google(`${project}:getIamPolicy`, 'POST', { options: { requestedPolicyVersion: 3 } })
  await google(`${project}:setIamPolicy`, 'POST', { policy: addGrants(policy, iam.projectGrants) })
  for (const grant of iam.secretGrants) {
    const secret = `https://secretmanager.googleapis.com/v1/${parent}/secrets/${grant.secret}`
    const policy = await google(`${secret}:getIamPolicy?options.requestedPolicyVersion=3`)
    await google(`${secret}:setIamPolicy`, 'POST', { policy: addGrants(policy, [grant]) })
  }
  const logging = `https://logging.googleapis.com/v2/${parent}`
  const bucket = `${logging}/locations/${logs.location}/buckets/${logs.bucketId}`
  let existing
  try { existing = await google(bucket) } catch (error) { if (error.status !== 404) throw error }
  if (!existing) await google(`${logging}/locations/${logs.location}/buckets?bucketId=${logs.bucketId}`, 'POST', { retentionDays: logs.retentionDays, description: 'Sanitized evidence assistance application logs' })
  else if (existing.retentionDays !== logs.retentionDays) throw Error('Existing bucket retention differs; inspect before changing it')
  const sink = `${logging}/sinks/${logs.bucketId}`
  try { existing = await google(sink) } catch (error) { if (error.status !== 404) throw error; existing = null }
  if (!existing) await google(`${logging}/sinks`, 'POST', { name: logs.bucketId, destination, filter: logs.applicationLogFilter })
  else if (existing.destination !== destination || existing.filter !== logs.applicationLogFilter || existing.disabled) throw Error('Existing application sink differs; inspect before changing it')
  const defaultSink = await google(`${logging}/sinks/_Default`)
  defaultSink.exclusions ??= []
  const exclusion = defaultSink.exclusions.find(value => value.name === plan.logs.defaultBucketExclusion)
  if (exclusion && (exclusion.filter !== logs.applicationLogFilter || exclusion.disabled)) throw Error('Existing default exclusion differs; inspect before changing it')
  if (!exclusion) {
    defaultSink.exclusions.push({ name: plan.logs.defaultBucketExclusion, filter: logs.applicationLogFilter, description: 'Keep application stdout/stderr in its seven-day bucket only' })
    await google(`${logging}/sinks/_Default?updateMask=exclusions`, 'PATCH', defaultSink)
  }
  console.log(JSON.stringify({ projectId: iam.projectId, iamApplied: true, applicationLogRetentionDays: logs.retentionDays }))
}
