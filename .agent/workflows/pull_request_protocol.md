---
description: Pull Request Protocol
---

# Pull Request Protocol

> [!IMPORTANT]
> **NEVER** push directly to the `main` or `master` branch.

All changes must follow this workflow:

1.  **Create a Branch**: `git checkout -b type/descriptive-name` (e.g., `feat/add-teal-section`, `fix/logo-test`).
2.  **Commit Changes**: Use semantic commit messages (e.g., `feat: ...`, `fix: ...`, `chore: ...`).
3.  **Push Branch**: `git push origin type/descriptive-name`.
4.  **Open Pull Request**: `gh pr create --title "Title" --body "Description"`.
5.  **Link Issue**: Ensure the PR is linked to the relevant issue (e.g., "Closes #13").
6.  **Merge**: Only merge after approval/checks pass (or if auto-merge is approved for the task).

## Turbo Mode

// turbo-all
If this workflow is active, ensure all git commands follow the branching strategy.
