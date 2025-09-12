[15:47:57.553] Running build in Washington, D.C., USA (East) – iad1
[15:47:57.553] Build machine configuration: 4 cores, 8 GB
[15:47:57.574] Cloning github.com/paskferrari/mistervertex (Branch: main, Commit: ec3c10f)
[15:47:57.972] Cloning completed: 397.000ms
[15:47:59.777] Restored build cache from previous deployment (4Eq7FndT75dtzBXf5HVL7ju8U8S1)
[15:48:01.194] Running "vercel build"
[15:48:01.599] Vercel CLI 47.1.1
[15:48:01.912] Installing dependencies...
[15:48:03.613] 
[15:48:03.613] up to date in 1s
[15:48:03.613] 
[15:48:03.614] 143 packages are looking for funding
[15:48:03.614]   run `npm fund` for details
[15:48:03.644] Detected Next.js version: 15.5.3
[15:48:03.648] Running "npm run build"
[15:48:03.772] 
[15:48:03.772] > bvertex@0.1.0 build
[15:48:03.772] > next build
[15:48:03.772] 
[15:48:04.552]    ▲ Next.js 15.5.3
[15:48:04.553]    - Experiments (use with caution):
[15:48:04.553]      ✓ optimizeCss
[15:48:04.553]      · optimizePackageImports
[15:48:04.553] 
[15:48:04.659]    Creating an optimized production build ...
[15:48:17.275]  ✓ Compiled successfully in 12.1s
[15:48:17.280]    Linting and checking validity of types ...
[15:48:22.769] 
[15:48:22.769] Failed to compile.
[15:48:22.770] 
[15:48:22.770] ./src/app/api/xbank/scalate/[id]/steps/route.ts
[15:48:22.770] 6:18  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[15:48:22.770] 
[15:48:22.770] ./src/app/api/xbank/settings/route.ts
[15:48:22.770] 11:21  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[15:48:22.770] 
[15:48:22.770] ./src/app/dashboard/page.tsx
[15:48:22.770] 32:50  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[15:48:22.770] 50:6  Warning: React Hook useEffect has a missing dependency: 'checkUserAndLoadData'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[15:48:22.771] 
[15:48:22.771] ./src/app/layout.tsx
[15:48:22.771] 8:10  Warning: 'supabase' is defined but never used.  @typescript-eslint/no-unused-vars
[15:48:22.771] 
[15:48:22.771] ./src/app/login/page.tsx
[15:48:22.771] 67:14  Warning: 'err' is defined but never used.  @typescript-eslint/no-unused-vars
[15:48:22.771] 191:18  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[15:48:22.771] 192:57  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[15:48:22.771] 
[15:48:22.771] ./src/app/page.tsx
[15:48:22.771] 25:11  Warning: 'isMobile' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[15:48:22.771] 76:14  Warning: 'err' is defined but never used.  @typescript-eslint/no-unused-vars
[15:48:22.771] 
[15:48:22.771] ./src/app/welcome/page.tsx
[15:48:22.771] 23:6  Warning: React Hook useEffect has a missing dependency: 'checkUser'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[15:48:22.771] 
[15:48:22.772] ./src/app/xbank/page.tsx
[15:48:22.772] 6:10  Warning: 'Zap' is defined but never used.  @typescript-eslint/no-unused-vars
[15:48:22.772] 40:10  Warning: 'showToast' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[15:48:22.772] 41:10  Warning: 'toastMessage' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[15:48:22.772] 42:10  Warning: 'isKeyboardNavigation' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[15:48:22.772] 46:6  Warning: React Hook useEffect has a missing dependency: 'checkUser'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[15:48:22.772] 49:9  Warning: 'showToastMessage' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[15:48:22.772] 127:31  Warning: 'userId' is defined but never used.  @typescript-eslint/no-unused-vars
[15:48:22.772] 
[15:48:22.772] ./src/components/OfflineSupport.tsx
[15:48:22.772] 25:10  Warning: 'offlineData' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[15:48:22.772] 99:9  Warning: 'addPendingAction' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[15:48:22.772] 244:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[15:48:22.772] 
[15:48:22.773] info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
[15:48:22.833] Error: Command "npm run build" exited with 1