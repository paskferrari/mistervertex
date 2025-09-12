[12:08:47.234] Running build in Washington, D.C., USA (East) – iad1
[12:08:47.235] Build machine configuration: 4 cores, 8 GB
[12:08:47.254] Cloning github.com/paskferrari/mistervertex (Branch: main, Commit: f88e868)
[12:08:47.572] Cloning completed: 317.000ms
[12:08:48.333] Restored build cache from previous deployment (4Eq7FndT75dtzBXf5HVL7ju8U8S1)
[12:08:49.008] Running "vercel build"
[12:08:49.444] Vercel CLI 47.1.1
[12:08:49.765] Installing dependencies...
[12:08:50.918] 
[12:08:50.918] up to date in 924ms
[12:08:50.919] 
[12:08:50.919] 143 packages are looking for funding
[12:08:50.919]   run `npm fund` for details
[12:08:50.952] Detected Next.js version: 15.5.3
[12:08:50.957] Running "npm run build"
[12:08:51.084] 
[12:08:51.085] > bvertex@0.1.0 build
[12:08:51.085] > next build
[12:08:51.085] 
[12:08:51.896]    ▲ Next.js 15.5.3
[12:08:51.896]    - Experiments (use with caution):
[12:08:51.896]      ✓ optimizeCss
[12:08:51.896]      · optimizePackageImports
[12:08:51.896] 
[12:08:52.003]    Creating an optimized production build ...
[12:09:05.270]  ✓ Compiled successfully in 12.7s
[12:09:05.274]    Linting and checking validity of types ...
[12:09:11.173] 
[12:09:11.174] Failed to compile.
[12:09:11.174] 
[12:09:11.174] ./src/app/admin/dashboard/page.tsx
[12:09:11.174] 14:3  Warning: 'TrendingUp' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.174] 50:6  Warning: React Hook useEffect has a missing dependency: 'checkAuth'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[12:09:11.174] 
[12:09:11.174] ./src/app/admin/login/page.tsx
[12:09:11.175] 6:22  Warning: 'TrendingUp' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.175] 44:14  Warning: 'err' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.175] 
[12:09:11.175] ./src/app/admin/predictions/page.tsx
[12:09:11.175] 4:39  Warning: 'TrendingUp' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.175] 66:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.175] 106:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.175] 144:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.176] 
[12:09:11.176] ./src/app/api/admin/clear-wallet/route.ts
[12:09:11.176] 4:28  Warning: 'request' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.176] 
[12:09:11.176] ./src/app/api/admin/create-wallet-table/route.ts
[12:09:11.176] 4:28  Warning: 'request' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.176] 
[12:09:11.177] ./src/app/api/admin/migrate-db/route.ts
[12:09:11.177] 21:28  Warning: 'request' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.177] 28:19  Warning: 'existingData' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:09:11.177] 
[12:09:11.177] ./src/app/api/admin/setup-notifications/route.ts
[12:09:11.177] 18:28  Warning: 'request' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.177] 25:11  Warning: 'sqlContent' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:09:11.178] 32:19  Warning: 'existingTable' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:09:11.178] 53:19  Warning: 'tableExists' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:09:11.178] 
[12:09:11.178] ./src/app/api/admin/setup-wallet/route.ts
[12:09:11.178] 4:28  Warning: 'request' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.178] 
[12:09:11.178] ./src/app/api/admin/setup-xbank/route.ts
[12:09:11.179] 6:28  Warning: 'request' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.179] 
[12:09:11.179] ./src/app/api/predictions/[id]/route.ts
[12:09:11.179] 57:23  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.179] 
[12:09:11.179] ./src/app/api/wallet/[id]/route.ts
[12:09:11.185] 15:23  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.185] 
[12:09:11.185] ./src/app/api/wallet/route.ts
[12:09:11.185] 2:25  Warning: 'safeSupabaseAuth' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.185] 111:36  Warning: 'existingError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:09:11.185] 
[12:09:11.186] ./src/app/api/xbank/analytics/export/route.ts
[12:09:11.186] 13:67  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.186] 78:42  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.186] 105:56  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.186] 106:52  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.186] 109:61  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.186] 110:64  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.187] 
[12:09:11.187] ./src/app/api/xbank/analytics/route.ts
[12:09:11.187] 13:67  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.188] 32:23  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.188] 77:56  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.188] 78:52  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.190] 81:61  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.190] 82:64  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.190] 87:43  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.190] 96:64  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.191] 96:72  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.191] 132:56  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.191] 137:56  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.191] 138:52  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.191] 139:67  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.191] 140:60  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.192] 152:30  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.192] 174:63  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.192] 195:30  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.192] 210:72  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.192] 
[12:09:11.192] ./src/app/api/xbank/backup/route.ts
[12:09:11.192] 124:45  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.192] 132:40  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.192] 140:41  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.193] 148:45  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.193] 156:55  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.193] 
[12:09:11.193] ./src/app/api/xbank/bankroll/route.ts
[12:09:11.193] 5:11  Warning: 'BankrollTransaction' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.193] 26:42  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.193] 106:42  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.193] 234:42  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.193] 
[12:09:11.193] ./src/app/api/xbank/board/posts/[id]/route.ts
[12:09:11.193] 100:20  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.194] 
[12:09:11.194] ./src/app/api/xbank/board/posts/route.ts
[12:09:11.194] 27:11  Warning: 'visibility' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:09:11.194] 
[12:09:11.194] ./src/app/api/xbank/groups/[id]/predictions/route.ts
[12:09:11.194] 26:18  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.194] 29:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.194] 117:18  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.194] 120:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.195] 206:18  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.195] 209:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.195] 
[12:09:11.195] ./src/app/api/xbank/groups/[id]/route.ts
[12:09:11.195] 26:18  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.195] 29:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.195] 83:57  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.195] 84:45  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.195] 85:34  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.195] 87:33  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.196] 88:33  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.196] 90:46  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.196] 125:18  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.196] 128:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.196] 221:18  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.196] 224:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.196] 
[12:09:11.196] ./src/app/api/xbank/groups/route.ts
[12:09:11.197] 67:54  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.197] 70:53  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.197] 71:54  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.197] 72:57  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.197] 74:63  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.197] 76:21  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.197] 77:34  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.197] 79:21  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.199] 80:34  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.199] 
[12:09:11.199] ./src/app/api/xbank/predictions/[id]/route.ts
[12:09:11.199] 85:23  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.199] 
[12:09:11.199] ./src/app/api/xbank/scalate/[id]/route.ts
[12:09:11.200] 96:20  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.200] 
[12:09:11.200] ./src/app/api/xbank/scalate/[id]/steps/route.ts
[12:09:11.200] 106:42  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.200] 
[12:09:11.200] ./src/app/api/xbank/scalate/route.ts
[12:09:11.200] 2:10  Warning: 'createClient' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.200] 5:27  Warning: 'request' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.201] 
[12:09:11.201] ./src/app/api/xbank/settings/route.ts
[12:09:11.201] 142:23  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.201] 
[12:09:11.201] ./src/app/api/xbank/stats/route.ts
[12:09:11.201] 104:52  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.201] 105:53  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.201] 106:56  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.201] 108:62  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.202] 114:20  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.202] 115:32  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.202] 121:20  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.202] 122:32  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.202] 132:62  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.207] 135:24  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.208] 136:37  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.208] 140:51  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.208] 140:59  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.208] 155:55  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.208] 155:63  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.208] 176:56  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.208] 208:84  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.208] 216:91  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.208] 
[12:09:11.208] ./src/app/dashboard/page.tsx
[12:09:11.208] 32:50  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.208] 33:10  Warning: 'showLogoutConfirm' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:09:11.208] 33:29  Warning: 'setShowLogoutConfirm' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:09:11.208] 34:10  Warning: 'showRemoveConfirm' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:09:11.208] 34:29  Warning: 'setShowRemoveConfirm' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:09:11.208] 51:6  Warning: React Hook useEffect has a missing dependency: 'checkUserAndLoadData'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[12:09:11.208] 
[12:09:11.209] ./src/app/layout.tsx
[12:09:11.209] 8:10  Warning: 'supabase' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.209] 
[12:09:11.209] ./src/app/login/page.tsx
[12:09:11.209] 67:14  Warning: 'err' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.209] 180:29  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[12:09:11.209] 191:18  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[12:09:11.209] 192:57  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[12:09:11.209] 
[12:09:11.209] ./src/app/page.tsx
[12:09:11.209] 24:11  Warning: 'isMobile' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:09:11.209] 75:14  Warning: 'err' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.209] 131:18  Error: 'Image' is not defined.  react/jsx-no-undef
[12:09:11.209] 258:16  Error: 'Image' is not defined.  react/jsx-no-undef
[12:09:11.209] 
[12:09:11.209] ./src/app/welcome/page.tsx
[12:09:11.209] 23:6  Warning: React Hook useEffect has a missing dependency: 'checkUser'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[12:09:11.209] 
[12:09:11.209] ./src/app/xbank/page.tsx
[12:09:11.209] 6:10  Warning: 'Zap' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.209] 40:10  Warning: 'showToast' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:09:11.210] 41:10  Warning: 'toastMessage' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:09:11.210] 42:10  Warning: 'isKeyboardNavigation' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:09:11.210] 46:6  Warning: React Hook useEffect has a missing dependency: 'checkUser'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[12:09:11.210] 49:9  Warning: 'showToastMessage' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:09:11.210] 127:31  Warning: 'userId' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.210] 476:86  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[12:09:11.210] 496:86  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[12:09:11.210] 
[12:09:11.210] ./src/components/InstallPrompt.tsx
[12:09:11.210] 76:60  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[12:09:11.210] 151:73  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[12:09:11.210] 152:54  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[12:09:11.210] 
[12:09:11.210] ./src/components/Navigation.tsx
[12:09:11.210] 6:19  Warning: 'TrendingUp' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.210] 6:56  Warning: 'User' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.210] 6:62  Warning: 'Shield' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.210] 12:29  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.210] 
[12:09:11.210] ./src/components/OfflineSupport.tsx
[12:09:11.210] 8:35  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.211] 18:56  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.211] 19:10  Warning: 'offlineData' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:09:11.211] 43:6  Warning: React Hook useEffect has a missing dependency: 'syncPendingActions'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[12:09:11.211] 75:9  Warning: 'addPendingAction' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:09:11.211] 75:37  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.211] 99:40  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.211] 188:51  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.211] 212:57  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.211] 238:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.211] 
[12:09:11.211] ./src/components/OnboardingGuide.tsx
[12:09:11.211] 44:67  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[12:09:11.211] 50:66  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[12:09:11.211] 105:77  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[12:09:11.211] 117:37  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[12:09:11.211] 117:44  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[12:09:11.211] 145:72  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[12:09:11.211] 151:24  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[12:09:11.211] 151:31  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[12:09:11.211] 158:65  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[12:09:11.212] 
[12:09:11.212] ./src/components/PWAManager.tsx
[12:09:11.212] 90:40  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[12:09:11.212] 116:56  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[12:09:11.212] 
[12:09:11.212] ./src/components/xbank/AnalyticsDashboard.tsx
[12:09:11.212] 4:82  Warning: 'Calendar' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.212] 4:92  Warning: 'Filter' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.212] 65:6  Warning: React Hook useEffect has a missing dependency: 'loadAnalytics'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[12:09:11.212] 89:9  Warning: 'memoizedMetrics' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:09:11.212] 99:6  Warning: React Hook useMemo has a missing dependency: 'analytics'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[12:09:11.212] 
[12:09:11.212] ./src/components/xbank/BackupManager.tsx
[12:09:11.212] 4:49  Warning: 'Calendar' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.212] 64:6  Warning: React Hook useEffect has missing dependencies: 'checkLastBackup' and 'loadBackupSettings'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
[12:09:11.212] 118:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.212] 
[12:09:11.212] ./src/components/xbank/BankrollManager.tsx
[12:09:11.212] 25:43  Warning: 'currentBankroll' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.212] 52:6  Warning: React Hook useEffect has a missing dependency: 'loadTransactions'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[12:09:11.213] 146:9  Warning: 'getTransactionColor' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:09:11.213] 371:72  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[12:09:11.213] 
[12:09:11.213] ./src/components/xbank/GroupsManager.tsx
[12:09:11.213] 4:23  Warning: 'Edit' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.213] 4:37  Warning: 'TrendingUp' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.213] 4:57  Warning: 'Calendar' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.213] 4:67  Warning: 'DollarSign' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.213] 4:79  Warning: 'BarChart3' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.213] 38:10  Warning: 'predictions' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:09:11.213] 
[12:09:11.213] ./src/components/xbank/PersonalBoard.tsx
[12:09:11.213] 4:51  Warning: 'Edit' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.213] 4:65  Warning: 'Filter' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.213] 4:81  Warning: 'Calendar' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.213] 4:91  Warning: 'Trophy' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.213] 4:99  Warning: 'TrendingUp' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.214] 53:10  Warning: 'selectedPost' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:09:11.214] 53:24  Warning: 'setSelectedPost' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:09:11.214] 54:10  Warning: 'showPostModal' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:09:11.214] 54:25  Warning: 'setShowPostModal' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:09:11.214] 265:9  Warning: 'getVisibilityLabel' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:09:11.214] 
[12:09:11.214] ./src/components/xbank/PredictionForm.tsx
[12:09:11.214] 4:27  Warning: 'Calendar' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.214] 
[12:09:11.214] ./src/components/xbank/PredictionsList.tsx
[12:09:11.214] 50:10  Warning: 'editingPrediction' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:09:11.214] 50:29  Warning: 'setEditingPrediction' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[12:09:11.214] 
[12:09:11.214] ./src/components/xbank/ScalateManager.tsx
[12:09:11.214] 572:55  Warning: 'index' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.214] 
[12:09:11.214] ./src/hooks/useTouch.ts
[12:09:11.214] 3:18  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
[12:09:11.215] 
[12:09:11.215] info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
[12:09:11.257] Error: Command "npm run build" exited with 1