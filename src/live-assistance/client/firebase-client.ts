import { initializeApp, getApps, type FirebaseOptions } from 'firebase/app';
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
  getToken,
  type AppCheck,
} from 'firebase/app-check';
import { getAuth, signInAnonymously } from 'firebase/auth';

let appCheck: AppCheck | undefined;
let pending: Promise<{ authorization: string; appCheck: string }> | undefined;

// Imported only by an explicit request after the transmission notice. This Auth
// identity survives financing resets and fictional identity changes.
export function guestCredentials(configuration: FirebaseOptions, siteKey: string) {
  if (pending) return pending;
  pending = (async () => {
    const app =
      getApps().find(app => app.name === 'rifd-live') ?? initializeApp(configuration, 'rifd-live');
    appCheck ??= initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(siteKey),
      isTokenAutoRefreshEnabled: false,
    });
    const auth = getAuth(app);
    await auth.authStateReady();
    if (auth.currentUser && !auth.currentUser.isAnonymous) throw Error('access-denied');
    const user = auth.currentUser ?? (await signInAnonymously(auth)).user;
    const [idToken, appToken] = await Promise.all([user.getIdToken(), getToken(appCheck)]);
    return { authorization: `Bearer ${idToken}`, appCheck: appToken.token };
  })().finally(() => {
    pending = undefined;
  });
  return pending;
}
