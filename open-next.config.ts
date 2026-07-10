import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// OpenNext adapter config for deploying this Next.js app to Cloudflare.
// Defaults are fine for a single-user CRM; see the OpenNext docs to add
// caching (KV/R2/D1) if you want ISR later.
export default defineCloudflareConfig();
