import { expect, test } from 'vitest'
import { firebaseGuestVerifier } from '../../src/live-assistance/security'

test('allowance identity requires verified anonymous Auth and the configured App Check app', async () => {
  const auth = async (token: string, revoked: true) => {
    expect(revoked).toBe(true)
    if (token !== 'dummy-anonymous' && token !== 'dummy-other-provider') throw Error('bad-token')
    return { uid: 'guest', firebase: { sign_in_provider: token === 'dummy-anonymous' ? 'anonymous' : 'google.com' } }
  }
  const app = async (token: string) => { if (token !== 'dummy-app') throw Error('bad-app'); return { appId: 'configured-app' } }
  const verify = firebaseGuestVerifier({ auth, app }, 'configured-app')
  await expect(verify('Bearer dummy-anonymous', 'dummy-app')).resolves.toBe('guest')
  for (const [token, appToken] of [['', 'dummy-app'], ['Bearer dummy-other-provider', 'dummy-app'], ['Bearer dummy-anonymous', 'invalid']]) await expect(verify(token, appToken)).rejects.toThrow()
  await expect(firebaseGuestVerifier({ auth, app }, 'other-app')('Bearer dummy-anonymous', 'dummy-app')).rejects.toThrow('access-denied')
  await expect(firebaseGuestVerifier({ auth, app }, undefined)('Bearer dummy-anonymous', 'dummy-app')).rejects.toThrow('access-denied')
})
