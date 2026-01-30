import type { FullConfig } from '@playwright/test';

/**
 * Warm up the dev server by hitting key routes before tests run.
 * Turbopack compiles pages on first request, which can take >30s.
 * Pre-warming avoids timeouts in actual tests.
 */
export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL ?? 'http://localhost:3333';

  const routes = [
    '/',
    '/booking',
    '/tours',
    '/contact',
    '/admin',
    '/terms',
    '/privacy',
    '/company',
  ];

  console.log(`[global-setup] Warming up dev server at ${baseURL}...`);

  for (const route of routes) {
    try {
      const url = `${baseURL}${route}`;
      const response = await fetch(url, {
        signal: AbortSignal.timeout(90_000),
      });
      console.log(`[global-setup] ${route} -> ${response.status}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`[global-setup] ${route} -> FAILED (${message})`);
    }
  }

  console.log('[global-setup] Warmup complete.');
}
