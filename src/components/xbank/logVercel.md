[12:29:51.483] Running build in Washington, D.C., USA (East) – iad1
[12:29:51.484] Build machine configuration: 4 cores, 8 GB
[12:29:51.500] Cloning github.com/paskferrari/mistervertex (Branch: main, Commit: 5d3511c)
[12:29:51.819] Cloning completed: 318.000ms
[12:29:52.713] Restored build cache from previous deployment (4Eq7FndT75dtzBXf5HVL7ju8U8S1)
[12:29:53.325] Running "vercel build"
[12:29:53.700] Vercel CLI 47.1.1
[12:29:54.124] Installing dependencies...
[12:29:55.144] 
[12:29:55.144] up to date in 834ms
[12:29:55.145] 
[12:29:55.145] 143 packages are looking for funding
[12:29:55.145]   run `npm fund` for details
[12:29:55.176] Detected Next.js version: 15.5.3
[12:29:55.179] Running "npm run build"
[12:29:55.287] 
[12:29:55.287] > bvertex@0.1.0 build
[12:29:55.287] > next build
[12:29:55.287] 
[12:29:56.001]    ▲ Next.js 15.5.3
[12:29:56.002]    - Experiments (use with caution):
[12:29:56.002]      ✓ optimizeCss
[12:29:56.002]      · optimizePackageImports
[12:29:56.002] 
[12:29:56.097]    Creating an optimized production build ...
[12:30:07.249]  ✓ Compiled successfully in 10.7s
[12:30:07.252]    Linting and checking validity of types ...
[12:30:12.242] 
[12:30:12.243] Failed to compile.
[12:30:12.243] 
[12:30:12.243] ./src/app/admin/dashboard/page.tsx
[12:30:12.243] 14:3  Warning: 'TrendingUp' is defined but never used.  @typescript-eslint/no-unused-vars
[12:30:12.243] 50:6  Warning: React Hook useEffect has a missing dependency: 'checkAuth'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[12:30:12.243] 
[12:30:12.243] ./src/app/admin/login/page.tsx
[12:30:12.243] 6:22  Warning: 'TrendingUp' is defined but never used.  @typescript-eslint/no-unused-vars
[12:30:12.244] 44:14  Warning: 'err' is defined but never used.  @typescript-eslint/no-unused-vars
[12:30:12.244] 
[12:30:12.244] ./src/app/admin/predictions/page.tsx
[12:30:12.244] 4:39  Warning: 'TrendingUp' is defined but never used.  @typescript-eslint/no-unused-vars
[12:30:12.244] 66:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[12:30:12.244] 106:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[12:30:12.244] 144:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[12:30:12.244] 
[12:30:12.244] ./src/app/api/admin/clear-wallet/route.ts
[12:30:12.244] 4:28  Warning: 'request' is defined but never used.  @typescript-eslint/no-unused-vars
[12:30:12.244] 
[12:30:12.244] ./src/app/api/admin/create-wallet-table/route.ts
[12:30:12.245] 4:28  Warning: 'request' is defined but never used.  @typescript-eslint/no-unused-vars
[12:30:12.245] 
[12:30:12.245] ./src/app/api/admin/migrate-db/route.ts
[12:30:12.245] 21:28  Warning: 'request' is defined but never used.  @typescript-eslint/no-unused-vars
[12:30:12.245] 28:19  Warning: 'existingData' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:30:12.245] 
[12:30:12.245] ./src/app/api/admin/setup-notifications/route.ts
[12:30:12.245] 18:28  Warning: 'request' is defined but never used.  @typescript-eslint/no-unused-vars
[12:30:12.245] 25:11  Warning: 'sqlContent' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:30:12.246] 32:19  Warning: 'existingTable' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:30:12.246] 53:19  Warning: 'tableExists' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:30:12.246] 
[12:30:12.246] ./src/app/api/admin/setup-wallet/route.ts
[12:30:12.246] 4:28  Warning: 'request' is defined but never used.  @typescript-eslint/no-unused-vars
[12:30:12.246] 
[12:30:12.246] ./src/app/api/admin/setup-xbank/route.ts
[12:30:12.246] 6:28  Warning: 'request' is defined but never used.  @typescript-eslint/no-unused-vars
[12:30:12.246] 
[12:30:12.247] ./src/app/api/predictions/[id]/route.ts
[12:30:12.247] 57:23  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.247] 
[12:30:12.247] ./src/app/api/wallet/[id]/route.ts
[12:30:12.247] 15:23  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.247] 
[12:30:12.247] ./src/app/api/wallet/route.ts
[12:30:12.247] 2:25  Warning: 'safeSupabaseAuth' is defined but never used.  @typescript-eslint/no-unused-vars
[12:30:12.247] 111:36  Warning: 'existingError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:30:12.251] 
[12:30:12.251] ./src/app/api/xbank/analytics/export/route.ts
[12:30:12.251] 13:67  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.251] 78:42  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.251] 105:56  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.251] 106:52  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.251] 109:61  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.252] 110:64  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.252] 
[12:30:12.252] ./src/app/api/xbank/analytics/route.ts
[12:30:12.252] 27:11  Warning: 'MonthlyData' is defined but never used.  @typescript-eslint/no-unused-vars
[12:30:12.252] 240:30  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.252] 255:72  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.252] 
[12:30:12.252] ./src/app/api/xbank/backup/route.ts
[12:30:12.252] 124:45  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.253] 132:40  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.253] 140:41  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.253] 148:45  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.253] 156:55  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.253] 
[12:30:12.253] ./src/app/api/xbank/bankroll/route.ts
[12:30:12.253] 5:11  Warning: 'BankrollTransaction' is defined but never used.  @typescript-eslint/no-unused-vars
[12:30:12.254] 26:42  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.254] 106:42  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.254] 234:42  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.254] 
[12:30:12.254] ./src/app/api/xbank/board/posts/[id]/route.ts
[12:30:12.254] 100:20  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.254] 
[12:30:12.254] ./src/app/api/xbank/board/posts/route.ts
[12:30:12.254] 27:11  Warning: 'visibility' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:30:12.255] 
[12:30:12.255] ./src/app/api/xbank/groups/[id]/predictions/route.ts
[12:30:12.255] 26:18  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.255] 29:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[12:30:12.255] 117:18  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.255] 120:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[12:30:12.255] 206:18  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.255] 209:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[12:30:12.256] 
[12:30:12.256] ./src/app/api/xbank/groups/[id]/route.ts
[12:30:12.256] 26:18  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.256] 29:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[12:30:12.256] 83:57  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.256] 84:45  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.256] 85:34  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.256] 87:33  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.256] 88:33  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.257] 90:46  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.257] 125:18  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.257] 128:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[12:30:12.257] 221:18  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.257] 224:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[12:30:12.257] 
[12:30:12.257] ./src/app/api/xbank/groups/route.ts
[12:30:12.257] 67:54  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.257] 70:53  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.257] 71:54  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.258] 72:57  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.258] 74:63  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.258] 76:21  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.258] 77:34  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.258] 79:21  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.258] 80:34  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.258] 
[12:30:12.258] ./src/app/api/xbank/predictions/[id]/route.ts
[12:30:12.259] 85:23  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.259] 
[12:30:12.259] ./src/app/api/xbank/scalate/[id]/route.ts
[12:30:12.259] 96:20  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.259] 
[12:30:12.259] ./src/app/api/xbank/scalate/[id]/steps/route.ts
[12:30:12.259] 106:42  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.259] 
[12:30:12.259] ./src/app/api/xbank/scalate/route.ts
[12:30:12.260] 2:10  Warning: 'createClient' is defined but never used.  @typescript-eslint/no-unused-vars
[12:30:12.260] 5:27  Warning: 'request' is defined but never used.  @typescript-eslint/no-unused-vars
[12:30:12.260] 
[12:30:12.260] ./src/app/api/xbank/settings/route.ts
[12:30:12.260] 142:23  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.260] 
[12:30:12.260] ./src/app/api/xbank/stats/route.ts
[12:30:12.260] 104:52  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.260] 105:53  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.260] 106:56  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.260] 108:62  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.261] 114:20  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.261] 115:32  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.261] 121:20  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.261] 122:32  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.261] 132:62  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.261] 135:24  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.261] 136:37  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.261] 140:51  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.261] 140:59  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.261] 155:55  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.261] 155:63  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.262] 176:56  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.262] 208:84  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.262] 216:91  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.262] 
[12:30:12.262] ./src/app/dashboard/page.tsx
[12:30:12.262] 32:50  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.262] 33:10  Warning: 'showLogoutConfirm' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:30:12.262] 33:29  Warning: 'setShowLogoutConfirm' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:30:12.262] 34:10  Warning: 'showRemoveConfirm' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:30:12.262] 34:29  Warning: 'setShowRemoveConfirm' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:30:12.263] 51:6  Warning: React Hook useEffect has a missing dependency: 'checkUserAndLoadData'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[12:30:12.263] 
[12:30:12.263] ./src/app/layout.tsx
[12:30:12.263] 8:10  Warning: 'supabase' is defined but never used.  @typescript-eslint/no-unused-vars
[12:30:12.263] 
[12:30:12.263] ./src/app/login/page.tsx
[12:30:12.263] 67:14  Warning: 'err' is defined but never used.  @typescript-eslint/no-unused-vars
[12:30:12.263] 180:29  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[12:30:12.264] 
[12:30:12.264] ./src/app/page.tsx
[12:30:12.264] 25:11  Warning: 'isMobile' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:30:12.264] 76:14  Warning: 'err' is defined but never used.  @typescript-eslint/no-unused-vars
[12:30:12.264] 
[12:30:12.264] ./src/app/welcome/page.tsx
[12:30:12.264] 23:6  Warning: React Hook useEffect has a missing dependency: 'checkUser'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[12:30:12.264] 
[12:30:12.264] ./src/app/xbank/page.tsx
[12:30:12.264] 6:10  Warning: 'Zap' is defined but never used.  @typescript-eslint/no-unused-vars
[12:30:12.264] 40:10  Warning: 'showToast' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:30:12.265] 41:10  Warning: 'toastMessage' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:30:12.265] 42:10  Warning: 'isKeyboardNavigation' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:30:12.265] 46:6  Warning: React Hook useEffect has a missing dependency: 'checkUser'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[12:30:12.265] 49:9  Warning: 'showToastMessage' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:30:12.265] 127:31  Warning: 'userId' is defined but never used.  @typescript-eslint/no-unused-vars
[12:30:12.265] 
[12:30:12.265] ./src/components/InstallPrompt.tsx
[12:30:12.265] 151:73  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[12:30:12.265] 152:54  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[12:30:12.265] 
[12:30:12.265] ./src/components/Navigation.tsx
[12:30:12.265] 6:19  Warning: 'TrendingUp' is defined but never used.  @typescript-eslint/no-unused-vars
[12:30:12.265] 6:56  Warning: 'User' is defined but never used.  @typescript-eslint/no-unused-vars
[12:30:12.266] 6:62  Warning: 'Shield' is defined but never used.  @typescript-eslint/no-unused-vars
[12:30:12.266] 12:29  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.266] 
[12:30:12.266] ./src/components/OfflineSupport.tsx
[12:30:12.266] 8:35  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.266] 18:56  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.266] 19:10  Warning: 'offlineData' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:30:12.266] 43:6  Warning: React Hook useEffect has a missing dependency: 'syncPendingActions'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[12:30:12.266] 75:9  Warning: 'addPendingAction' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:30:12.266] 75:37  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.266] 99:40  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.266] 188:51  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.267] 212:57  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.267] 238:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[12:30:12.267] 
[12:30:12.267] ./src/components/OnboardingGuide.tsx
[12:30:12.267] 44:67  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[12:30:12.267] 50:66  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[12:30:12.267] 105:77  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[12:30:12.267] 117:37  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[12:30:12.267] 117:44  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[12:30:12.267] 145:72  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[12:30:12.267] 151:24  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[12:30:12.267] 151:31  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[12:30:12.267] 158:65  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[12:30:12.268] 
[12:30:12.268] ./src/components/PWAManager.tsx
[12:30:12.268] 90:40  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[12:30:12.268] 116:56  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:30:12.268] 
[12:30:12.268] ./src/components/xbank/AnalyticsDashboard.tsx
[12:30:12.268] 65:6  Warning: React Hook useEffect has a missing dependency: 'loadAnalytics'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[12:30:12.269] 
[12:30:12.269] ./src/components/xbank/BackupManager.tsx
[12:30:12.269] 64:6  Warning: React Hook useEffect has missing dependencies: 'checkLastBackup' and 'loadBackupSettings'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
[12:30:12.269] 
[12:30:12.269] ./src/components/xbank/BankrollManager.tsx
[12:30:12.269] 25:43  Warning: 'currentBankroll' is defined but never used.  @typescript-eslint/no-unused-vars
[12:30:12.269] 52:6  Warning: React Hook useEffect has a missing dependency: 'loadTransactions'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[12:30:12.270] 
[12:30:12.270] info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
[12:30:12.316] Error: Command "npm run build" exited with 1