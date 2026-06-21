# Contributing to PawHub

We welcome contributions to PawHub! To maintain code quality and system integrity, please adhere strictly to the following guidelines.

## 🛠️ Local Setup

1. Fork and clone the repository.
2. Run `npm install` to grab all dependencies.
3. Request `.env.local` testing credentials from the engineering lead.
4. Start the server using `npm run dev:socket` to ensure WebSocket connectivity works locally.

---

## 📝 Coding Standards

- **TypeScript Strict Mode**: The project enforces strict typing. `any` is forbidden unless absolutely necessary (e.g., catching raw errors). Use generic types and standard interfaces.
- **Logging**: **NEVER** use `console.log()`. You must import and utilize `src/lib/logger.ts` for all debugging and application logging. See `LOGGING_GUIDE.md`.
- **Error Handling**: Do not return arbitrary JSON errors. Throw standard Error Classes from `src/lib/errors.ts` (e.g., `throw new ValidationError()`).
- **Styling**: We use Tailwind CSS. Rely on design tokens defined in `global.css` (e.g., `bg-[var(--color-primary)]`) rather than hardcoded hex values.

---

## 🌳 Branching Strategy

We use standard GitFlow:
- `main` / `master`: Production code.
- `develop`: Pre-production staging.
- `feature/<name>`: New features.
- `bugfix/<name>`: Fixing issues.
- `hotfix/<name>`: Urgent production fixes.

---

## 🤝 Pull Request Process

1. Ensure your branch is up to date with `develop`.
2. Run the CI pipeline locally before pushing:
   - `npx tsc --noEmit`
   - `npm run lint`
   - `npm run build`
3. Create a descriptive PR outlining what changed and *why*.
4. **The CI/CD GitHub Action will run automatically.** If the action fails, your PR cannot be merged. Fix the issues and push again.
5. Require at least 1 code review approval before merging.
