Run all quality gates on the codebase:

1. Run the `gates` script (`npm run gates` / `pnpm gates` / `yarn gates`)
2. Report results for each gate (typecheck, lint, test, build)
3. If any gate fails, identify the specific errors
4. Do NOT proceed with committing until all gates pass
