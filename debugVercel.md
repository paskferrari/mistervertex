19:49:56.639 Running build in Washington, D.C., USA (East) – iad1
19:49:56.640 Build machine configuration: 4 cores, 8 GB
19:49:56.750 Cloning github.com/paskferrari/mistervertex (Branch: main, Commit: 056259e)
19:49:56.751 Previous build caches not available.
19:49:57.120 Cloning completed: 370.000ms
19:49:57.489 Running "vercel build"
19:49:57.897 Vercel CLI 48.8.0
19:49:58.225 Installing dependencies...
19:50:11.242 
19:50:11.242 added 437 packages in 13s
19:50:11.243 
19:50:11.243 152 packages are looking for funding
19:50:11.243   run `npm fund` for details
19:50:11.308 Detected Next.js version: 15.5.3
19:50:11.313 Running "npm run build"
19:50:12.402 
19:50:12.402 > bvertex@0.1.0 build
19:50:12.402 > next build
19:50:12.402 
19:50:13.042 Attention: Next.js now collects completely anonymous telemetry regarding usage.
19:50:13.042 This information is used to shape Next.js' roadmap and prioritize features.
19:50:13.043 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
19:50:13.043 https://nextjs.org/telemetry
19:50:13.043 
19:50:13.100    ▲ Next.js 15.5.3
19:50:13.100    - Experiments (use with caution):
19:50:13.100      ✓ optimizeCss
19:50:13.100      · optimizePackageImports
19:50:13.100 
19:50:13.185    Creating an optimized production build ...
19:50:25.949  ⚠ Compiled with warnings in 12.4s
19:50:25.949 
19:50:25.949 ./src/app/api/xbank/copytrade/[id]/route.ts
19:50:25.949 Attempted import error: 'getSupabaseUserClient' is not exported from '@/lib/supabase' (imported as 'getSupabaseUserClient').
19:50:25.949 
19:50:25.949 Import trace for requested module:
19:50:25.949 ./src/app/api/xbank/copytrade/[id]/route.ts
19:50:25.949 
19:50:25.950 ./src/app/api/xbank/copytrade/[id]/route.ts
19:50:25.950 Attempted import error: 'getSupabaseUserClient' is not exported from '@/lib/supabase' (imported as 'getSupabaseUserClient').
19:50:25.950 
19:50:25.950 Import trace for requested module:
19:50:25.950 ./src/app/api/xbank/copytrade/[id]/route.ts
19:50:25.950 
19:50:25.950 ./src/app/api/xbank/copytrade/copy/route.ts
19:50:25.950 Attempted import error: 'getSupabaseUserClient' is not exported from '@/lib/supabase' (imported as 'getSupabaseUserClient').
19:50:25.950 
19:50:25.950 Import trace for requested module:
19:50:25.950 ./src/app/api/xbank/copytrade/copy/route.ts
19:50:25.950 
19:50:25.950 ./src/app/api/xbank/copytrade/copy/route.ts
19:50:25.951 Attempted import error: 'getSupabaseUserClient' is not exported from '@/lib/supabase' (imported as 'getSupabaseUserClient').
19:50:25.951 
19:50:25.951 Import trace for requested module:
19:50:25.951 ./src/app/api/xbank/copytrade/copy/route.ts
19:50:25.951 
19:50:25.951 ./src/app/api/xbank/copytrade/route.ts
19:50:25.951 Attempted import error: 'getSupabaseUserClient' is not exported from '@/lib/supabase' (imported as 'getSupabaseUserClient').
19:50:25.951 
19:50:25.951 Import trace for requested module:
19:50:25.951 ./src/app/api/xbank/copytrade/route.ts
19:50:25.951 
19:50:25.951 ./src/app/api/xbank/copytrade/route.ts
19:50:25.951 Attempted import error: 'getSupabaseUserClient' is not exported from '@/lib/supabase' (imported as 'getSupabaseUserClient').
19:50:25.951 
19:50:25.952 Import trace for requested module:
19:50:25.952 ./src/app/api/xbank/copytrade/route.ts
19:50:25.952 
19:50:25.954    Linting and checking validity of types ...
19:50:31.474 
19:50:31.475 Failed to compile.
19:50:31.475 
19:50:31.475 ./src/app/api/analytics/route.ts
19:50:31.475 20:19  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
19:50:31.475 26:12  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
19:50:31.475 
19:50:31.475 ./src/app/api/xbank/copytrade/[id]/route.ts
19:50:31.475 72:23  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
19:50:31.476 
19:50:31.476 ./src/app/api/xbank/copytrade/route.ts
19:50:31.476 113:13  Error: 'total' is never reassigned. Use 'const' instead.  prefer-const
19:50:31.476 
19:50:31.476 ./src/app/dashboard/page.tsx
19:50:31.476 41:10  Warning: 'isScrolled' is assigned a value but never used.  @typescript-eslint/no-unused-vars
19:50:31.476 
19:50:31.476 ./src/app/xbank/page.tsx
19:50:31.476 105:6  Warning: React Hook useCallback has a missing dependency: 'loadSettings'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
19:50:31.476 
19:50:31.477 ./src/components/LandingEmailForm.tsx
19:50:31.477 15:10  Warning: 'isSubmitted' is assigned a value but never used.  @typescript-eslint/no-unused-vars
19:50:31.477 17:11  Warning: 'lightTap' is assigned a value but never used.  @typescript-eslint/no-unused-vars
19:50:31.477 
19:50:31.477 ./src/components/xbank/AnalyticsDashboard.tsx
19:50:31.477 123:31  Warning: 'score' is defined but never used.  @typescript-eslint/no-unused-vars
19:50:31.477 
19:50:31.477 ./src/components/xbank/GroupsManager.tsx
19:50:31.484 38:10  Warning: 'predictions' is assigned a value but never used.  @typescript-eslint/no-unused-vars
19:50:31.484 
19:50:31.484 ./src/components/xbank/PredictionsDisplay.tsx
19:50:31.484 4:53  Warning: 'TrendingUp' is defined but never used.  @typescript-eslint/no-unused-vars
19:50:31.485 23:31  Warning: 'currency' is defined but never used.  @typescript-eslint/no-unused-vars
19:50:31.485 
19:50:31.485 ./src/components/xbank/PredictionsList.tsx
19:50:31.485 68:6  Warning: React Hook useEffect has a missing dependency: 'loadPredictions'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
19:50:31.485 
19:50:31.485 ./src/components/xbank/ScalateManager.tsx
19:50:31.486 71:6  Warning: React Hook useEffect has a missing dependency: 'loadScalate'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
19:50:31.486 
19:50:31.486 ./src/lib/analytics.ts
19:50:31.486 1:72  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
19:50:31.486 
19:50:31.486 ./src/ui/LeaderboardItem.tsx
19:50:31.486 17:11  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
19:50:31.486 
19:50:31.486 info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
19:50:31.550 Error: Command "npm run build" exited with 1