# Lessons Learned & Technical Debrief

**Document Purpose:** This document captures critical technical lessons, troubleshooting steps, and "gotchas" encountered during the development of the TABS project. It serves as a knowledge base to prevent recurring issues.

---

## 🏗️ CI/CD & Build Infrastructure

### 1. The "Exit Code 1" Phantom Build Failure (Jan 2026)

**Symptom:**
The `CI - Build and Test` workflow (specifically `Build Next.js site`) failed consistently on the `main` branch with a generic error:

> `Process completed with exit code 1.`

**Characteristics:**

- **Local Build (`npm run build`)**: ✅ Passed.
- **PR Checks**: ✅ Passed.
- **Hotfix Branch**: ✅ Passed.
- **Main Branch**: ❌ Failed immediately after merge.
- **Logs**: Opaque. No stack trace or specific error message pointing to code.

**Root Cause:**
This was a **Lockfile/Dependency Drift** issue. The `package-lock.json` and `node_modules` in the CI environment (specifically how `npm ci` restored them) had drifted or corrupted in a way that caused the Next.js/Turbopack binary to crash silently. This often happens when `package-lock.json` is generated on different OS platforms or npm versions without strict synchronization.

**Resolution:**
The fix required a "scorched earth" regeneration of the lockfile:

```bash
# 1. Delete existing artifacts
rm package-lock.json
rm -r node_modules

# 2. Clean install to regenerate lockfile
npm install

# 3. Commit and Push
git add package-lock.json
git commit -m "chore: regenerate package-lock.json"
git push origin main
```

**Key Lesson:**
If a CI build fails with "Exit Code 1" and no logs, **suspect the lockfile first**. Do not waste time debugging React components until you have verified dependency integrity by checking if a fresh lockfile resolves the issue.

---

## 📊 Google Analytics Integration

### 2. Static Exports & Dynamic Data (Impact Counter)

**Challenge:**
We wanted to display "Researchers Helped" (Active Users) on a **static** GitHub Pages site (`output: export`).

**Constraint:**
Static sites cannot fetch live database values at runtime (client-side) securely without exposing API keys or hitting CORS issues, and they have no backend server to query.

**Solution Pattern (The "Auto-Update Loop"):**

1.  **Build Time Data**: We treat the analytics data as "content" (like a blog post).
2.  **Workflow (`ga-report.yml`)**: A scheduled GitHub Action runs daily.
3.  **Fetch & Save**: It fetches data from Google Analytics and saves it to `src/data/impact.json`.
4.  **Auto-Commit**: The workflow commits this JSON file back to the repo.
5.  **Trigger Deploy**: This commit triggers the standard `pages-build-deployment` workflow.

**Result:**
The site stays "stateless" but updates its content daily.

**Lesson:**
For static sites, use **CI/CD as your "backend"**. If data changes slowly (daily/weekly), generate it at build time rather than fetching it at runtime.
