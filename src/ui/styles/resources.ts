import stylesheet from './index.css?url';

export async function prepareStylesheet(): Promise<void> {
  const resource = new URL(stylesheet, document.baseURI);
  // A failed response can leave a sheet with empty or inaccessible rules.
  const hasRules = (link: HTMLLinkElement) => {
    try {
      return !!link.sheet?.cssRules.length;
    } catch {
      return false;
    }
  };
  if (
    Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')).some(link => {
      const url = new URL(link.href);
      return url.origin === resource.origin && url.pathname === resource.pathname && hasRules(link);
    })
  )
    return;
  // A failed head link cannot establish readiness. A new link also lets explicit Retry load it again.
  await new Promise<void>((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    // A fresh URL avoids reusing a cached failed or empty stylesheet response.
    resource.searchParams.set('rifd-resource', crypto.randomUUID());
    link.href = resource.href;
    const refuse = () => {
      link.remove();
      reject(new Error('resources'));
    };
    link.onload = () => {
      if (hasRules(link)) resolve();
      else refuse();
    };
    link.onerror = refuse;
    document.head.append(link);
  });
}
