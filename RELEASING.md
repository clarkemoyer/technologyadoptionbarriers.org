# Releasing

This repo publishes GitHub Releases with a consistent, human-readable template (see [.github/RELEASE_TEMPLATE.md](.github/RELEASE_TEMPLATE.md)).

## Generate release notes (auto-filled sections)

The generator auto-fills:

- **Contributors** (commit authors in the git ref range)
- **Merged pull requests** (GitHub PRs merged in the ref date range)
- **Closed issues included** (GitHub issues closed in the ref date range)

It leaves the narrative sections (Main Summary, User Facing Changes, etc.) as placeholders for you to fill.

### Example

Generate notes for a patch release since the last tag:

```bash
npm run release:notes -- --from v0.2.0 --tag v0.2.1 --issue 159 --out tmp_release_notes_v0.2.1_generated.md
```

Then edit `tmp_release_notes_v0.2.1_generated.md` to fill in:

- `## Main Summary`
- `## 1. User Facing Changes`
- `## 2. Internal Application Improvements`
- `## 3. External Integrations` (if applicable)
- `## Lessons Learned`

## Create the GitHub Release

Using GitHub CLI:

```bash
gh release create v0.2.1 --title "v0.2.1 YYYY-MM-DD" --notes-file tmp_release_notes_v0.2.1_generated.md
```

## Requirements

- `git` installed
- GitHub CLI (`gh`) installed and authenticated (`gh auth status`)
