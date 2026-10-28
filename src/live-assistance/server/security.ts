import { LiveStop } from './admission';

type Verifiers = {
  auth(
    token: string,
    checkRevoked: true,
  ): Promise<{ uid: string; firebase: { sign_in_provider: string } }>;
  app(token: string): Promise<{ appId: string }>;
};

export function firebaseGuestVerifier(verifiers: Verifiers, expectedAppId: string | undefined) {
  return async (authorization?: string, appCheck?: string) => {
    if (
      !authorization?.startsWith('Bearer ') ||
      !authorization.slice(7) ||
      !appCheck ||
      !expectedAppId
    )
      throw new LiveStop('access-denied');
    const [user, app] = await Promise.all([
      verifiers.auth(authorization.slice(7), true),
      verifiers.app(appCheck),
    ]);
    if (!user.uid || user.firebase.sign_in_provider !== 'anonymous' || app.appId !== expectedAppId)
      throw new LiveStop('access-denied');
    return user.uid;
  };
}
