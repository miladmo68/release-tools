#!/usr/bin/env bash
set -euo pipefail

manifest=".factory/release.json"
if [[ ! -f "$manifest" ]]; then
  echo "Missing $manifest" >&2
  exit 1
fi

if [[ -z "${GH_TOKEN:-}" ]]; then
  echo "PORTFOLIO_BOT_TOKEN is not configured" >&2
  exit 1
fi

# GitHub-hosted Ubuntu runners include system Google Chrome. Use it for real
# Playwright QA without an apt mirror dependency or a browser download.
if ! command -v google-chrome >/dev/null 2>&1; then
  echo "System Google Chrome is unavailable on this runner" >&2
  exit 1
fi

read_manifest() {
  node -e 'const m=require("./.factory/release.json"); const v=m[process.argv[1]]; if (typeof v !== "string" || !v.trim()) process.exit(2); process.stdout.write(v.trim())' "$1"
}

owner="miladmo68"
repository="$(read_manifest repository)"
description="$(read_manifest description)"
homepage="$(read_manifest homepage)"

if [[ ! "$repository" =~ ^[a-z0-9][a-z0-9-]{2,59}$ ]]; then
  echo "Invalid repository slug: $repository" >&2
  exit 1
fi

if [[ "$homepage" != "https://miladmo68.github.io/$repository/" ]]; then
  echo "Homepage must be the expected GitHub Pages URL" >&2
  exit 1
fi

required=(
  "project/README.md"
  "project/package.json"
  "project/.github/workflows/deploy.yml"
)
for path in "${required[@]}"; do
  if [[ ! -f "$path" ]]; then
    echo "Missing required release file: $path" >&2
    exit 1
  fi
done

if grep -RInE --exclude-dir=node_modules --exclude='*.lock' '(OPENAI_API_KEY|GITHUB_TOKEN|PORTFOLIO_BOT_TOKEN|BEGIN (RSA|OPENSSH|EC) PRIVATE KEY)' project; then
  echo "Potential secret detected in staged project" >&2
  exit 1
fi

full_repo="$owner/$repository"
if gh repo view "$full_repo" >/dev/null 2>&1; then
  if [[ "$(gh repo view "$full_repo" --json isEmpty --jq .isEmpty)" != "true" ]]; then
    echo "Refusing to overwrite existing non-empty repository: $full_repo" >&2
    exit 1
  fi
  echo "Resuming publication into existing empty repository: $full_repo"
  resume_empty=true
else
  resume_empty=false
fi

publish_branch="publish-${GITHUB_RUN_ID:-local}"
git subtree split --prefix=project -b "$publish_branch"

workspace="$(pwd)"
validation_dir="$(mktemp -d)"
cleanup() {
  cd "$workspace"
  git worktree remove --force "$validation_dir" >/dev/null 2>&1 || true
}
trap cleanup EXIT

git worktree add "$validation_dir" "$publish_branch"
cd "$validation_dir"

for npm_script in validate qa:browser; do
  if ! node -e 'const p=require("./package.json"); process.exit(p.scripts?.[process.argv[1]] ? 0 : 1)' "$npm_script"; then
    echo "Missing required npm script: $npm_script" >&2
    exit 1
  fi
done

npm install --package-lock-only --ignore-scripts
npm ci
npm run validate
PLAYWRIGHT_USE_SYSTEM_CHROME=1 npm run qa:browser

screenshots=(
  "public/screenshots/desktop.png"
  "public/screenshots/mobile.png"
)
for screenshot in "${screenshots[@]}"; do
  if [[ ! -s "$screenshot" ]]; then
    echo "Browser QA did not create required screenshot: $screenshot" >&2
    exit 1
  fi
done

git config user.name "Milad Portfolio Cloud"
git config user.email "miladmo68@users.noreply.github.com"
git add package-lock.json public/screenshots/desktop.png public/screenshots/mobile.png
if git diff --cached --quiet; then
  echo "Browser QA screenshots must be newly generated or updated" >&2
  exit 1
fi
git commit -m "chore: lock dependencies and add verified previews"

cd "$workspace"
git worktree remove --force "$validation_dir"
trap - EXIT

commit_count="$(git rev-list --count "$publish_branch")"
if (( commit_count < 13 || commit_count > 21 )); then
  echo "Two-day release history must contain 12-20 meaningful authoring commits plus the verified screenshot commit (13-21 total); found $commit_count" >&2
  exit 1
fi

if [[ "$resume_empty" != "true" ]]; then
  gh repo create "$full_repo" --public --description "$description"
fi
gh api --method PATCH "repos/$full_repo" -f homepage="$homepage" -f has_issues=true -f has_projects=false -f has_wiki=false >/dev/null

gh auth setup-git
git remote add publish "https://github.com/$full_repo.git"
git push publish "$publish_branch:refs/heads/main"
gh api --method POST "repos/$full_repo/pages" -f build_type=workflow >/dev/null

{
  echo "## Published portfolio project"
  echo
  echo "- Repository: https://github.com/$full_repo"
  echo "- Expected live URL: $homepage"
  echo "- Meaningful commits: $commit_count"
  echo "- Validation: npm ci, validate, Chromium desktop/mobile QA"
  echo
  echo "### Published history"
  git log --reverse --pretty='format:- `%h` %s' "$publish_branch"
} >> "${GITHUB_STEP_SUMMARY:-/dev/null}"

echo "Published https://github.com/$full_repo with $commit_count commits"

