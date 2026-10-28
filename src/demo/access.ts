import { canReadApplication } from '../domain'
import type { ActorId, Application, Dataset } from '../domain/model'
import { DemoError } from './storage'

export function createAccess(newDrafts: Map<string, Application>) {
  const permitted = (data: Dataset, who: ActorId, id: string): Application => {
    const application = data.applications.find(application => application.id === id) ?? newDrafts.get(id)
    if (!application || !canReadApplication(who, application)) throw new DemoError('unavailable')
    return application
  }
  const editable = (data: Dataset, who: ActorId, id: string): Application => {
    const application = data.applications.find(application => application.id === id) ?? newDrafts.get(id)
    if (!application || application.owner !== who) throw new DemoError('unavailable')
    return application
  }
  return { permitted, editable }
}