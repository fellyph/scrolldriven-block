async function globalTeardown(): Promise<void> {
	// eslint-disable-next-line no-console
	console.log('Stopping WordPress Playground server...');

	const cliServer = (global as any).cliServer;

	if (cliServer && typeof cliServer.exit === 'function') {
		await cliServer.exit();
	}

	// eslint-disable-next-line no-console
	console.log('WordPress Playground server stopped.');
}

export default globalTeardown;
