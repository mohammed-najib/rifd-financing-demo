import type { EvidenceRun, EvidenceSource, PreparedPage } from './contract'
import { composeLocations, same } from './locations'
import { prepareCrops, preparePage } from './prepare'

// A stored answer never authorizes drawing on a newly decoded preview. Recreate
// the exact raster and crop, including both hashes, before returning pixels.
export async function restoreRegion(source: EvidenceSource, run: EvidenceRun, page: number, target: string, signal: AbortSignal): Promise<PreparedPage | null> {
  if (Date.parse(run.expiresAt) <= Date.now() || run.stale || run.provenance.source.hash !== source.hash) return null
  const selection = { source, declaration: run.provenance.context, binding: run.provenance.binding, ...(run.provenance.correction ? { correction: run.provenance.correction } : {}) }
  const location = composeLocations(run, selection).find(location => location.page === page && location.target === target)
  if (location?.status !== 'shown') return null
  const recorded = run.pages?.find(result => result.page === page)
  const binding = run.verifications?.find(stage => stage.page === page)?.request.state.regions?.find(region => region.target === target)
  if (!recorded || !binding) return null
  const reconstructed = await preparePage(source, signal, page, true)
  if (signal.aborted || !same(recorded.raster, reconstructed.manifest)) return null
  const { cropHash, ...geometry } = binding
  const [crop] = await prepareCrops(reconstructed, [geometry], signal)
  if (signal.aborted || crop.binding.cropHash !== cropHash || !same(crop.binding, binding)) return null
  return reconstructed
}
