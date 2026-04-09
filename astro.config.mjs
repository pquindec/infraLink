import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';
export default defineConfig({
  site: 'https://www.infralinknet.com',
  output: 'server',
  adapter: vercel(),
  integrations: [react(), tailwind()],
});
