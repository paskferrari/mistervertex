21:12:32.176 Running build in Washington, D.C., USA (East) – iad1
21:12:32.177 Build machine configuration: 4 cores, 8 GB
21:12:32.356 Cloning github.com/paskferrari/mistervertex (Branch: main, Commit: e829493)
21:12:32.805 Cloning completed: 449.000ms
21:12:33.584 Restored build cache from previous deployment (4mfFJWtE8iDU3REBrJ2Fff3kCX8q)
21:12:34.278 Running "vercel build"
21:12:34.690 Vercel CLI 48.8.2
21:12:35.024 Installing dependencies...
21:12:37.537 
21:12:37.537 added 39 packages, removed 1 package, and changed 11 packages in 2s
21:12:37.537 
21:12:37.537 165 packages are looking for funding
21:12:37.537   run `npm fund` for details
21:12:37.570 Detected Next.js version: 15.5.3
21:12:37.575 Running "npm run build"
21:12:37.706 
21:12:37.706 > bvertex@0.1.0 build
21:12:37.706 > next build
21:12:37.706 
21:12:38.435    ▲ Next.js 15.5.3
21:12:38.435 
21:12:38.519    Creating an optimized production build ...
21:12:47.024 Failed to compile.
21:12:47.024 
21:12:47.024 ./src/app/api/xbank/analytics/route.ts
21:12:47.025 Module parse failed: Identifier 'user' has already been declared (24:22)
21:12:47.025 File was processed with these loaders:
21:12:47.025  * ./node_modules/next/dist/build/webpack/loaders/next-flight-loader/index.js
21:12:47.025  * ./node_modules/next/dist/build/webpack/loaders/next-swc-loader.js
21:12:47.025 You may need an additional loader to handle the result of these loaders.
21:12:47.025 |         const userId = user.id;
21:12:47.025 |         // Verifica ruolo VIP
21:12:47.025 >         const { data: user, error: userError } = await supabaseAdmin.from('users').select('role').eq('id', userId).single();
21:12:47.025 |         if (userError || !user || user.role !== 'abbonato_vip' && user.role !== 'admin') {
21:12:47.025 |             return NextResponse.json({
21:12:47.025 
21:12:47.025 Import trace for requested module:
21:12:47.025 ./src/app/api/xbank/analytics/route.ts
21:12:47.025 
21:12:47.027 
21:12:47.028 > Build failed because of webpack errors
21:12:47.071 Error: Command "npm run build" exited with 1

---

Fix applied:
- Resolved duplicate identifier in `src/app/api/xbank/analytics/route.ts` by renaming the second destructured variable from `user` to `userRow` during VIP role check.
- Verified locally with `npm run dev` (Next.js 15.5.3) running on `http://localhost:3000/` without compile errors.

Next steps for deploy:
- Trigger a new Vercel deployment from branch `main` after pulling latest changes.
- Expect the previous webpack error to be gone; build should progress past analytics route.
- If further errors arise, capture the logs here and I will address them.