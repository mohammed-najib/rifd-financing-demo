import type { ReactNode } from 'react';

export function Heading({ children }: { children: ReactNode }) {
  return <h1 tabIndex={-1}>{children}</h1>;
}
