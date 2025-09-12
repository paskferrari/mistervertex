[01:55:17.737] Running build in Washington, D.C., USA (East) – iad1
[01:55:17.737] Build machine configuration: 4 cores, 8 GB
[01:55:17.756] Cloning github.com/paskferrari/mistervertex (Branch: main, Commit: 410d1df)
[01:55:17.868] Previous build caches not available
[01:55:18.465] Cloning completed: 709.000ms
[01:55:18.752] Running "vercel build"
[01:55:19.160] Vercel CLI 47.1.1
[01:55:19.563] Installing dependencies...
[01:55:32.894] 
[01:55:32.894] added 425 packages in 13s
[01:55:32.894] 
[01:55:32.894] 143 packages are looking for funding
[01:55:32.894]   run `npm fund` for details
[01:55:32.959] Detected Next.js version: 15.5.3
[01:55:32.963] Running "npm run build"
[01:55:33.081] 
[01:55:33.081] > bvertex@0.1.0 build
[01:55:33.082] > next build
[01:55:33.082] 
[01:55:33.929] Attention: Next.js now collects completely anonymous telemetry regarding usage.
[01:55:33.929] This information is used to shape Next.js' roadmap and prioritize features.
[01:55:33.929] You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
[01:55:33.929] https://nextjs.org/telemetry
[01:55:33.930] 
[01:55:33.986]    ▲ Next.js 15.5.3
[01:55:33.986] 
[01:55:34.091]    Creating an optimized production build ...
[01:55:45.072]  ✓ Compiled successfully in 10.8s
[01:55:45.077]    Linting and checking validity of types ...
[01:55:50.528] 
[01:55:50.529] Failed to compile.
[01:55:50.529] 
[01:55:50.529] ./src/app/admin/dashboard/page.tsx
[01:55:50.529] 49:6  Warning: React Hook useEffect has a missing dependency: 'checkAuth'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[01:55:50.529] 
[01:55:50.529] ./src/app/admin/login/page.tsx
[01:55:50.529] 43:14  Warning: 'err' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.529] 
[01:55:50.529] ./src/app/admin/predictions/page.tsx
[01:55:50.530] 65:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.530] 105:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.530] 143:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.530] 
[01:55:50.530] ./src/app/api/admin/clear-wallet/route.ts
[01:55:50.530] 4:28  Warning: 'request' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.530] 
[01:55:50.530] ./src/app/api/admin/create-wallet-table/route.ts
[01:55:50.530] 4:28  Warning: 'request' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.530] 
[01:55:50.530] ./src/app/api/admin/migrate-db/route.ts
[01:55:50.530] 14:28  Warning: 'request' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.531] 19:19  Warning: 'existingData' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[01:55:50.531] 
[01:55:50.531] ./src/app/api/admin/setup-notifications/route.ts
[01:55:50.531] 9:28  Warning: 'request' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.531] 16:11  Warning: 'sqlContent' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[01:55:50.531] 23:19  Warning: 'existingTable' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[01:55:50.531] 44:19  Warning: 'tableExists' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[01:55:50.531] 
[01:55:50.531] ./src/app/api/admin/setup-wallet/route.ts
[01:55:50.531] 4:28  Warning: 'request' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.531] 
[01:55:50.531] ./src/app/api/admin/setup-xbank/route.ts
[01:55:50.531] 6:28  Warning: 'request' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.531] 
[01:55:50.531] ./src/app/api/predictions/[id]/route.ts
[01:55:50.531] 55:23  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.531] 
[01:55:50.532] ./src/app/api/wallet/[id]/route.ts
[01:55:50.532] 14:23  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.532] 
[01:55:50.532] ./src/app/api/wallet/route.ts
[01:55:50.532] 2:25  Warning: 'safeSupabaseAuth' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.532] 111:36  Warning: 'existingError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[01:55:50.532] 
[01:55:50.532] ./src/app/api/xbank/analytics/export/route.ts
[01:55:50.532] 13:67  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.532] 78:42  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.532] 105:56  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.532] 106:52  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.532] 109:61  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.532] 110:64  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.532] 
[01:55:50.538] ./src/app/api/xbank/analytics/route.ts
[01:55:50.538] 13:67  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.539] 32:23  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.539] 77:56  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.539] 78:52  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.541] 81:61  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.541] 82:64  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.541] 87:43  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.541] 96:64  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.542] 96:72  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.542] 132:56  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.542] 137:56  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.542] 138:52  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.542] 139:67  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.542] 140:60  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.542] 152:30  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.542] 174:63  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.542] 195:30  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.542] 210:72  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.542] 
[01:55:50.542] ./src/app/api/xbank/backup/route.ts
[01:55:50.542] 124:45  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.542] 132:40  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.542] 140:41  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.542] 148:45  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.542] 156:55  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.542] 
[01:55:50.542] ./src/app/api/xbank/bankroll/route.ts
[01:55:50.542] 5:11  Warning: 'BankrollTransaction' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.542] 26:42  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.542] 106:42  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.542] 234:42  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.542] 
[01:55:50.542] ./src/app/api/xbank/board/posts/[id]/route.ts
[01:55:50.542] 98:20  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.543] 
[01:55:50.543] ./src/app/api/xbank/board/posts/route.ts
[01:55:50.543] 27:11  Warning: 'visibility' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[01:55:50.543] 
[01:55:50.543] ./src/app/api/xbank/groups/[id]/predictions/route.ts
[01:55:50.543] 25:18  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.543] 28:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.543] 115:18  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.543] 118:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.543] 203:18  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.543] 206:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.543] 
[01:55:50.543] ./src/app/api/xbank/groups/[id]/route.ts
[01:55:50.543] 25:18  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.543] 28:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.543] 82:57  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.543] 83:45  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.543] 84:34  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.543] 86:33  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.543] 87:33  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.543] 89:46  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.544] 123:18  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.544] 126:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.544] 218:18  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.544] 221:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.544] 
[01:55:50.544] ./src/app/api/xbank/groups/route.ts
[01:55:50.544] 67:54  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.544] 70:53  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.544] 71:54  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.544] 72:57  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.544] 74:63  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.544] 76:21  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.544] 77:34  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.544] 79:21  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.544] 80:34  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.545] 
[01:55:50.545] ./src/app/api/xbank/predictions/[id]/route.ts
[01:55:50.545] 85:23  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.545] 
[01:55:50.545] ./src/app/api/xbank/scalate/[id]/route.ts
[01:55:50.545] 94:20  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.545] 
[01:55:50.545] ./src/app/api/xbank/scalate/[id]/steps/route.ts
[01:55:50.545] 104:42  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.545] 
[01:55:50.545] ./src/app/api/xbank/scalate/route.ts
[01:55:50.545] 2:10  Warning: 'createClient' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.545] 5:27  Warning: 'request' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.545] 
[01:55:50.546] ./src/app/api/xbank/settings/route.ts
[01:55:50.546] 142:23  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.546] 
[01:55:50.546] ./src/app/api/xbank/stats/route.ts
[01:55:50.546] 104:52  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.546] 105:53  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.546] 106:56  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.546] 108:62  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.546] 114:20  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.546] 115:32  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.546] 121:20  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.546] 122:32  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.546] 132:62  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.546] 135:24  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.552] 136:37  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.552] 140:51  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.552] 140:59  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.552] 155:55  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.552] 155:63  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.552] 176:56  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.552] 208:84  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.552] 216:91  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.552] 
[01:55:50.552] ./src/app/dashboard/page.tsx
[01:55:50.552] 31:50  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.552] 32:10  Warning: 'showLogoutConfirm' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[01:55:50.552] 32:29  Warning: 'setShowLogoutConfirm' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[01:55:50.552] 33:10  Warning: 'showRemoveConfirm' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[01:55:50.552] 33:29  Warning: 'setShowRemoveConfirm' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[01:55:50.554] 50:6  Warning: React Hook useEffect has a missing dependency: 'checkUserAndLoadData'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[01:55:50.554] 
[01:55:50.554] ./src/app/login/page.tsx
[01:55:50.554] 66:14  Warning: 'err' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.554] 173:29  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[01:55:50.554] 184:18  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[01:55:50.554] 185:57  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[01:55:50.554] 
[01:55:50.554] ./src/app/page.tsx
[01:55:50.554] 47:14  Warning: 'err' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.554] 
[01:55:50.554] ./src/app/welcome/page.tsx
[01:55:50.554] 22:6  Warning: React Hook useEffect has a missing dependency: 'checkUser'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[01:55:50.554] 
[01:55:50.554] ./src/app/xbank/page.tsx
[01:55:50.554] 42:6  Warning: React Hook useEffect has a missing dependency: 'checkUser'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[01:55:50.554] 81:31  Warning: 'userId' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.554] 370:86  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[01:55:50.554] 388:86  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[01:55:50.554] 
[01:55:50.554] ./src/components/Navigation.tsx
[01:55:50.554] 6:56  Warning: 'User' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.554] 6:62  Warning: 'Shield' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.554] 11:29  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.554] 
[01:55:50.554] ./src/components/xbank/AnalyticsDashboard.tsx
[01:55:50.554] 4:82  Warning: 'Calendar' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.554] 4:92  Warning: 'Filter' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.554] 65:6  Warning: React Hook useEffect has a missing dependency: 'loadAnalytics'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[01:55:50.554] 89:9  Warning: 'memoizedMetrics' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[01:55:50.554] 99:6  Warning: React Hook useMemo has a missing dependency: 'analytics'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[01:55:50.555] 
[01:55:50.555] ./src/components/xbank/BackupManager.tsx
[01:55:50.555] 4:49  Warning: 'Calendar' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.555] 9:16  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.555] 10:11  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.555] 11:12  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.555] 12:16  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.555] 13:26  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.555] 14:13  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.555] 33:6  Warning: React Hook useEffect has missing dependencies: 'checkLastBackup' and 'loadBackupSettings'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
[01:55:50.555] 87:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.555] 
[01:55:50.555] ./src/components/xbank/BankrollManager.tsx
[01:55:50.555] 25:43  Warning: 'currentBankroll' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.555] 48:6  Warning: React Hook useEffect has a missing dependency: 'loadTransactions'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[01:55:50.555] 142:9  Warning: 'getTransactionColor' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[01:55:50.555] 337:59  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.555] 367:72  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[01:55:50.555] 
[01:55:50.555] ./src/components/xbank/GroupsManager.tsx
[01:55:50.555] 4:23  Warning: 'Edit' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.555] 4:37  Warning: 'TrendingUp' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.555] 4:57  Warning: 'Calendar' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.555] 4:67  Warning: 'DollarSign' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.555] 4:79  Warning: 'BarChart3' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.555] 38:10  Warning: 'predictions' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[01:55:50.555] 
[01:55:50.555] ./src/components/xbank/NotificationCenter.tsx
[01:55:50.555] 15:10  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.555] 
[01:55:50.555] ./src/components/xbank/PersonalBoard.tsx
[01:55:50.555] 4:51  Warning: 'Edit' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.555] 4:65  Warning: 'Filter' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.555] 4:81  Warning: 'Calendar' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.555] 4:91  Warning: 'Trophy' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.556] 4:99  Warning: 'TrendingUp' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.556] 52:10  Warning: 'selectedPost' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[01:55:50.556] 52:24  Warning: 'setSelectedPost' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[01:55:50.556] 53:10  Warning: 'showPostModal' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[01:55:50.556] 53:25  Warning: 'setShowPostModal' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[01:55:50.556] 256:9  Warning: 'getVisibilityLabel' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[01:55:50.556] 556:92  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.556] 570:93  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.556] 
[01:55:50.556] ./src/components/xbank/PredictionForm.tsx
[01:55:50.556] 4:27  Warning: 'Calendar' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.556] 9:26  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.556] 
[01:55:50.556] ./src/components/xbank/PredictionsList.tsx
[01:55:50.556] 4:26  Warning: 'Calendar' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.556] 4:36  Warning: 'TrendingUp' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.556] 4:56  Warning: 'Edit' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.556] 4:70  Warning: 'Eye' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.556] 22:9  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.556] 40:10  Warning: 'editingPrediction' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[01:55:50.556] 40:29  Warning: 'setEditingPrediction' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[01:55:50.556] 89:57  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.556] 109:46  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.556] 
[01:55:50.556] ./src/components/xbank/ScalateManager.tsx
[01:55:50.556] 4:10  Warning: 'TrendingUp' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.556] 4:68  Warning: 'Edit' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.556] 4:79  Warning: 'Calendar' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.556] 4:89  Warning: 'DollarSign' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.556] 154:9  Warning: 'addStepToScalata' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[01:55:50.556] 154:64  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.556] 402:101  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[01:55:50.556] 572:55  Warning: 'index' is defined but never used.  @typescript-eslint/no-unused-vars
[01:55:50.556] 
[01:55:50.556] info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
[01:55:50.610] Error: Command "npm run build" exited with 1