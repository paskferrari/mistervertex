15:23:06.399 Running build in Washington, D.C., USA (East) – iad1
15:23:06.399 Build machine configuration: 4 cores, 8 GB
15:23:06.525 Cloning github.com/paskferrari/mistervertex (Branch: main, Commit: 0b5a1f1)
15:23:06.526 Previous build caches not available.
15:23:06.934 Cloning completed: 408.000ms
15:23:07.299 Running "vercel build"
15:23:07.999 Vercel CLI 48.8.2
15:23:08.330 Installing dependencies...
15:23:21.374 
15:23:21.374 added 437 packages in 13s
15:23:21.375 
15:23:21.375 152 packages are looking for funding
15:23:21.375   run `npm fund` for details
15:23:21.438 Detected Next.js version: 15.5.3
15:23:21.442 Running "npm run build"
15:23:21.565 
15:23:21.565 > bvertex@0.1.0 build
15:23:21.565 > next build
15:23:21.565 
15:23:22.194 Attention: Next.js now collects completely anonymous telemetry regarding usage.
15:23:22.194 This information is used to shape Next.js' roadmap and prioritize features.
15:23:22.195 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
15:23:22.195 https://nextjs.org/telemetry
15:23:22.195 
15:23:22.249    ▲ Next.js 15.5.3
15:23:22.249    - Experiments (use with caution):
15:23:22.249      ✓ optimizeCss
15:23:22.249      · optimizePackageImports
15:23:22.249 
15:23:22.332    Creating an optimized production build ...
15:23:34.420  ✓ Compiled successfully in 11.8s
15:23:34.424    Linting and checking validity of types ...
15:23:39.844 
15:23:39.844 ./src/app/api/analytics/route.ts
15:23:39.845 27:12  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
15:23:39.845 
15:23:39.845 ./src/app/dashboard/page.tsx
15:23:39.845 41:10  Warning: 'isScrolled' is assigned a value but never used.  @typescript-eslint/no-unused-vars
15:23:39.845 
15:23:39.845 ./src/app/xbank/page.tsx
15:23:39.845 105:6  Warning: React Hook useCallback has a missing dependency: 'loadSettings'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
15:23:39.845 
15:23:39.845 ./src/components/LandingEmailForm.tsx
15:23:39.845 15:10  Warning: 'isSubmitted' is assigned a value but never used.  @typescript-eslint/no-unused-vars
15:23:39.845 17:11  Warning: 'lightTap' is assigned a value but never used.  @typescript-eslint/no-unused-vars
15:23:39.845 
15:23:39.846 ./src/components/xbank/AnalyticsDashboard.tsx
15:23:39.846 123:31  Warning: 'score' is defined but never used.  @typescript-eslint/no-unused-vars
15:23:39.846 
15:23:39.846 ./src/components/xbank/GroupsManager.tsx
15:23:39.846 38:10  Warning: 'predictions' is assigned a value but never used.  @typescript-eslint/no-unused-vars
15:23:39.846 
15:23:39.846 ./src/components/xbank/PredictionsDisplay.tsx
15:23:39.846 4:53  Warning: 'TrendingUp' is defined but never used.  @typescript-eslint/no-unused-vars
15:23:39.846 23:31  Warning: 'currency' is defined but never used.  @typescript-eslint/no-unused-vars
15:23:39.847 
15:23:39.847 ./src/components/xbank/PredictionsList.tsx
15:23:39.847 68:6  Warning: React Hook useEffect has a missing dependency: 'loadPredictions'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
15:23:39.847 
15:23:39.847 ./src/components/xbank/ScalateManager.tsx
15:23:39.847 71:6  Warning: React Hook useEffect has a missing dependency: 'loadScalate'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
15:23:39.847 
15:23:39.847 ./src/ui/LeaderboardItem.tsx
15:23:39.847 17:11  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
15:23:39.847 
15:23:39.847 info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
15:23:44.296 Failed to compile.
15:23:44.297 
15:23:44.297 ./capacitor.config.ts:1:33
15:23:44.297 Type error: Cannot find module '@capacitor/cli' or its corresponding type declarations.
15:23:44.297 
15:23:44.297 [0m[31m[1m>[22m[39m[90m 1 |[39m [36mimport[39m { [33mCapacitorConfig[39m } [36mfrom[39m [32m'@capacitor/cli'[39m
15:23:44.297  [90m   |[39m                                 [31m[1m^[22m[39m
15:23:44.297  [90m 2 |[39m
15:23:44.297  [90m 3 |[39m [90m// Usa CAP_URL per puntare a un server custom (es. Android emulator 10.0.2.2:3000)[39m
15:23:44.297  [90m 4 |[39m [90m// Usa CAP_DEV=1 per abilitare la modalità dev di default su localhost:3000[39m[0m
15:23:44.331 Next.js build worker exited with code: 1 and signal: null
15:23:44.384 Error: Command "npm run build" exited with 1