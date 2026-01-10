import { runCLI } from '@wp-playground/cli';
import * as path from 'path';

async function globalSetup(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('Starting WordPress Playground server...');

  // Use process.cwd() and navigate to plugin directory
  const pluginPath = path.join(process.cwd());

  let cliServer;
  try {
    cliServer = await runCLI({
    command: 'server',
    php: '8.3',
    wp: 'latest',
    login: true,
    port: 9400,
    mount: [
      {
        hostPath: pluginPath,
        vfsPath: '/wordpress/wp-content/plugins/my-scroll-block',
      },
    ],
    blueprint: {
      steps: [
        {
          step: 'setSiteOptions',
          options: {
            blogname: 'WordPress Scroll-driven block',
            blogdescription: 'Created by Fellyph',
          },
        },
        {
          step: 'activatePlugin',
          pluginPath: '/wordpress/wp-content/plugins/my-scroll-block/my-scroll-block.php',
        },
        {
          step: 'runPHP',
          code: `<?php 
            require_once '/wordpress/wp-load.php'; 
            wp_insert_post(array(
              'post_title' => 'Demo Scroll Animations Post', 
              'post_content' => '<!-- wp:paragraph {"animationType":"fade-in"} --><p class="scroll-anim-block scroll-anim-fade-in" data-scroll-anim="1">This is a demo paragraph with fade-in animation applied.</p><!-- /wp:paragraph --><!-- wp:paragraph {"animationType":"slide-in-left"} --><p class="scroll-anim-block scroll-anim-slide-in-left" data-scroll-anim="1">This paragraph slides in from the left.</p><!-- /wp:paragraph --><!-- wp:heading {"animationType":"scale-up"} --><h2 class="wp-block-heading scroll-anim-block scroll-anim-scale-up" data-scroll-anim="1">This heading scales up</h2><!-- /wp:heading -->', 
              'post_author' => 1, 
              'post_status' => 'publish'
            )); 
          ?>`,
        },
      ],
    },
  });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to start WordPress Playground:', error);
    throw error;
  }

  // Store the server instance globally for teardown
  (global as any).cliServer = cliServer;

  // eslint-disable-next-line no-console
  console.log('WordPress Playground server started on http://127.0.0.1:9400');

  // Wait for WordPress to be fully ready by polling the health endpoint
  const maxAttempts = 30;
  const delayMs = 2000;
  let attempts = 0;
  let lastError: Error | null = null;

  while (attempts < maxAttempts) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('http://127.0.0.1:9400/wp-admin/', {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok || response.status === 302) {
        // eslint-disable-next-line no-console
        console.log(`WordPress is ready after ${attempts + 1} attempt(s)`);
        lastError = null;
        break;
      }
    } catch (error) {
      lastError = error as Error;
      // Server not ready yet, continue polling
    }

    attempts++;
    if (attempts < maxAttempts) {
      // eslint-disable-next-line no-console
      console.log(`Waiting for WordPress to be ready... (attempt ${attempts}/${maxAttempts})`);
      await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
    }
  }

  if (attempts >= maxAttempts) {
    // eslint-disable-next-line no-console
    console.error('Last error:', lastError);
    throw new Error('WordPress Playground failed to start within the expected time');
  }

  // Additional wait for plugin initialization
  await new Promise<void>((resolve) => setTimeout(resolve, 1000));
}

export default globalSetup;
