# PawHub CI/CD Guide

This guide explains the Continuous Integration and Continuous Deployment (CI/CD) pipeline implemented for PawHub using GitHub Actions.

## 📌 Workflow Explanation
The primary pipeline is located in `.github/workflows/ci.yml`. It runs automatically on two events:
1. **Push** to `main`, `master`, or `develop`.
2. **Pull Request** targeting `main`, `master`, or `develop`.

This ensures that no broken code is merged into the critical branches.

## 🚀 How CI Works
When a developer opens a Pull Request, the `verify` job starts. It provisions an Ubuntu runner and executes the following steps sequentially:

1. **Checkout**: Pulls the code from the repository.
2. **Setup Node.js**: Installs Node.js v20.x and caches `npm` modules to drastically speed up future builds.
3. **Install Dependencies**: Runs `npm ci` for deterministic installations (or falls back to `npm install`).
4. **Type Checking**: Runs the TypeScript compiler (`npx tsc --noEmit`) to catch type errors. **Fails the pipeline if types are invalid.**
5. **Linting**: Runs `npm run lint` (ESLint) to enforce code formatting and syntax standards. **Fails the pipeline if lint errors exist.**
6. **Build Verification**: Runs `npm run build` to ensure Next.js can compile a production bundle successfully. **Fails the pipeline if the build crashes.**
7. **Security Audit**: Runs `npm audit --production` to scan for known vulnerabilities. This step generates a report in the logs but does *not* fail the build for low-severity issues.
8. **Dependency Check**: Runs `npm outdated` and `npm ls` to log a report of packages that need upgrading or duplicate dependencies.

## 🛠️ How to Troubleshoot Failures
If the GitHub Actions check fails on your Pull Request (displays a red ❌), follow these steps:
1. Click on the "Details" link next to the failed check.
2. Look at the specific step that failed (e.g., "Type Checking" or "Linting").
3. **Lint Failures**: Run `npm run lint` locally. Fix the highlighted lines, commit, and push.
4. **TypeScript Failures**: Run `npx tsc --noEmit` locally. Fix the type mismatches, commit, and push.
5. **Build Failures**: Run `npm run build` locally. Identify missing dependencies or Next.js build errors.

## 🔮 Future Jobs Architecture
The `ci.yml` is structured with stubbed-out jobs for future expansion. When the project is ready, you can uncomment and implement:

- `unit-tests`: For Jest or Vitest integration.
- `e2e-tests`: For Playwright browser automation tests.
- `lighthouse`: For automated performance audits.
- `deploy`: For pushing successfully tested code to AWS or Vercel.

To add a new job, simply open `.github/workflows/ci.yml` and add a new job definition under `jobs:`, ensuring you use the `needs: [verify]` constraint to make sure it only runs after code quality is guaranteed.
