[02:10:48.354] Running build in Washington, D.C., USA (East) – iad1
[02:10:48.354] Build machine configuration: 4 cores, 8 GB
[02:10:48.370] Cloning github.com/paskferrari/mistervertex (Branch: main, Commit: b465a98)
[02:10:48.466] Previous build caches not available
[02:10:48.615] Cloning completed: 245.000ms
[02:10:48.877] Running "vercel build"
[02:10:49.256] Vercel CLI 47.1.1
[02:10:49.552] Installing dependencies...
[02:11:01.847] 
[02:11:01.848] added 425 packages in 12s
[02:11:01.848] 
[02:11:01.848] 143 packages are looking for funding
[02:11:01.848]   run `npm fund` for details
[02:11:02.056] Detected Next.js version: 15.5.3
[02:11:02.060] Running "npm run build"
[02:11:02.169] 
[02:11:02.169] > bvertex@0.1.0 build
[02:11:02.170] > next build
[02:11:02.170] 
[02:11:02.938] Attention: Next.js now collects completely anonymous telemetry regarding usage.
[02:11:02.939] This information is used to shape Next.js' roadmap and prioritize features.
[02:11:02.939] You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
[02:11:02.939] https://nextjs.org/telemetry
[02:11:02.939] 
[02:11:02.990]    ▲ Next.js 15.5.3
[02:11:02.990] 
[02:11:03.086]    Creating an optimized production build ...
[02:11:12.548]  ✓ Compiled successfully in 9.3s
[02:11:12.552]    Skipping linting
[02:11:12.552]    Checking validity of types ...
[02:11:19.239]    Collecting page data ...
[02:11:19.690] Error: supabaseUrl is required.
[02:11:19.691]     at <unknown> (.next/server/chunks/2461.js:21:80520)
[02:11:19.691]     at new bA (.next/server/chunks/2461.js:21:80771)
[02:11:19.691]     at bB (.next/server/chunks/2461.js:21:85650)
[02:11:19.691]     at 63579 (.next/server/app/api/admin/migrate-db/route.js:1:1413)
[02:11:19.691]     at c (.next/server/webpack-runtime.js:1:128)
[02:11:19.691]     at <unknown> (.next/server/app/api/admin/migrate-db/route.js:1:8200)
[02:11:19.691]     at c.X (.next/server/webpack-runtime.js:1:1206)
[02:11:19.692]     at <unknown> (.next/server/app/api/admin/migrate-db/route.js:1:8175)
[02:11:19.692]     at Object.<anonymous> (.next/server/app/api/admin/migrate-db/route.js:1:8232)
[02:11:19.695] 
[02:11:19.696] > Build error occurred
[02:11:19.699] [Error: Failed to collect page data for /api/admin/migrate-db] {
[02:11:19.699]   type: 'Error'
[02:11:19.699] }
[02:11:19.755] Error: Command "npm run build" exited with 1