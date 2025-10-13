import type { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig): Promise<void> {
  console.log('Stopping WordPress Playground server...');

  const cliServer = (global as any).cliServer;

  if (cliServer && typeof cliServer.exit === 'function') {
    await cliServer.exit();
  }

  console.log('WordPress Playground server stopped.');
}

export default globalTeardown;

