[02:16:26.597] Running build in Washington, D.C., USA (East) – iad1
[02:16:26.597] Build machine configuration: 4 cores, 8 GB
[02:16:26.613] Cloning github.com/paskferrari/mistervertex (Branch: main, Commit: f370684)
[02:16:26.724] Previous build caches not available
[02:16:26.903] Cloning completed: 290.000ms
[02:16:27.226] Running "vercel build"
[02:16:27.635] Vercel CLI 47.1.1
[02:16:27.989] Installing dependencies...
[02:16:40.703] 
[02:16:40.703] added 425 packages in 12s
[02:16:40.703] 
[02:16:40.704] 143 packages are looking for funding
[02:16:40.704]   run `npm fund` for details
[02:16:40.751] Detected Next.js version: 15.5.3
[02:16:40.755] Running "npm run build"
[02:16:40.870] 
[02:16:40.871] > bvertex@0.1.0 build
[02:16:40.871] > next build
[02:16:40.871] 
[02:16:41.690] Attention: Next.js now collects completely anonymous telemetry regarding usage.
[02:16:41.691] This information is used to shape Next.js' roadmap and prioritize features.
[02:16:41.691] You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
[02:16:41.691] https://nextjs.org/telemetry
[02:16:41.691] 
[02:16:41.746]    ▲ Next.js 15.5.3
[02:16:41.746] 
[02:16:41.848]    Creating an optimized production build ...
[02:16:52.272]  ✓ Compiled successfully in 10.3s
[02:16:52.276]    Skipping linting
[02:16:52.276]    Checking validity of types ...
[02:16:59.297]    Collecting page data ...
[02:16:59.753] Error: supabaseUrl is required.
[02:16:59.754]     at <unknown> (.next/server/chunks/2461.js:21:80520)
[02:16:59.754]     at new bA (.next/server/chunks/2461.js:21:80771)
[02:16:59.754]     at bB (.next/server/chunks/2461.js:21:85650)
[02:16:59.754]     at 18886 (.next/server/app/api/admin/create-user/route.js:1:889)
[02:16:59.754]     at c (.next/server/webpack-runtime.js:1:128)
[02:16:59.754]     at <unknown> (.next/server/app/api/admin/create-user/route.js:1:7878)
[02:16:59.754]     at c.X (.next/server/webpack-runtime.js:1:1206)
[02:16:59.754]     at <unknown> (.next/server/app/api/admin/create-user/route.js:1:7853)
[02:16:59.754]     at Object.<anonymous> (.next/server/app/api/admin/create-user/route.js:1:7910)
[02:16:59.758] 
[02:16:59.758] > Build error occurred
[02:16:59.762] [Error: Failed to collect page data for /api/admin/create-user] {
[02:16:59.763]   type: 'Error'
[02:16:59.763] }
[02:16:59.816] Error: Command "npm run build" exited with 1