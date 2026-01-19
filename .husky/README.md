# Git Hooks (Husky)

This directory contains Git hooks managed by [Husky](https://typicode.github.io/husky/) to enforce code quality standards before commits.

## Installed Hooks

### `pre-commit`

**Purpose**: Automatically format code and check for linting errors before allowing a commit.

**What it does**:

1. **Captures list of staged files** before formatting (including renamed files)
2. **Runs Prettier** via `npm run format` (which executes `prettier --write .`) to auto-format **all files in the repository** according to `.prettierrc.json`
3. **Re-stages only the files that were originally staged** before formatting (so your commit contents stay scoped to what you staged)
4. **Runs ESLint** to check for code quality issues
5. **Blocks the commit** if linting errors are found

> ℹ️ **Note**: Because Prettier runs on the entire repository, **unstaged files may also be reformatted**. Those changes will **remain unstaged**; only the originally staged files are re-staged after formatting.

**Developer Experience**:

- ✅ **No manual formatting needed** - Just write code and commit
- ✅ **Formatting happens automatically** - Prettier runs on every commit
- ✅ **Consistent code style** - Everyone's commits are formatted the same way
- ✅ **AI-friendly** - Even AI-generated commits are automatically formatted

**Example Output**:

```
🔧 Running prettier to format code...
✅ Pre-commit checks passed! Code has been formatted.
```

### `commit-msg`

**Purpose**: Enforce conventional commit message format.

**What it does**:

1. **Validates commit message format** using commitlint
2. **Ensures messages follow** the conventional commits specification
3. **Blocks commits** with improperly formatted messages

**Required Format**:

```
<type>(<scope>): <subject>
```

**Valid Types**:

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `perf` - Performance improvements
- `ci` - CI/CD changes
- `revert` - Revert a previous commit

**Examples**:

```bash
git commit -m "feat: add dark mode toggle"
git commit -m "fix: resolve mobile navigation issue"
git commit -m "docs: update README with deployment instructions"
```

## Setup

Git hooks are automatically installed when you run:

```bash
npm install
```

This triggers the `prepare` script in `package.json`, which runs `husky` to set up the hooks.

## Troubleshooting

### Hooks Not Running

If git hooks aren't running:

1. **Verify hooks are installed**:

   ```bash
   git config core.hooksPath
   # Should output: .husky/_
   ```

2. **Reinstall hooks**:

   ```bash
   npm run prepare
   ```

3. **Check file permissions**:
   ```bash
   ls -la .husky/
   # pre-commit and commit-msg should be executable (-rwxr-xr-x)
   ```

### Bypassing Hooks (Emergency Only)

**⚠️ NOT RECOMMENDED** - Only use in emergencies:

```bash
git commit --no-verify -m "your message"
```

Bypassing hooks means:

- Your code may not be formatted correctly
- Your commit message may not follow conventions
- CI checks may fail
- Code review may require additional changes

**Always let the hooks run** - they save time in the long run!

## CI/CD Integration

While git hooks provide local enforcement, the CI pipeline also enforces these standards:

1. **Formatting check** (`npm run format:check`) in `.github/workflows/ci.yml`
2. **Linting** (`npm run lint`) in CI
3. **Tests** (`npm test`) in CI
4. **Build verification** (`npm run build`) in CI

The pre-commit hook ensures code is formatted before it even reaches CI, saving time and CI minutes.

## Benefits for AI Agents

The automatic formatting in the pre-commit hook helps ensure code quality for AI-assisted development:

- **AI agents don't always format code perfectly** - The hook ensures consistency
- **Automatic correction** - No need for AI to "remember" to run prettier
- **Works for local git commits** - Any local commit (human or AI-assisted) gets formatted
- **Prevents CI failures** - Formatting issues are caught before pushing

**Important Note**: Pre-commit hooks only run for local git commits. Commits made via GitHub's web interface, API, or other remote methods will not trigger the hook. In such cases, CI formatting checks provide a safety net.

This addresses the issue where AI agents making local commits would push code without proper formatting!

## More Information

- See `CONTRIBUTING.md` for complete development guidelines
- See `CODE_QUALITY.md` for detailed code quality standards
- See `commitlint.config.js` for commit message rules
- See `.prettierrc.json` for code formatting rules
