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
  echo "Refusing to overwrite existing repository: $full_repo" >&2
  exit 1
fi

publish_branch="publish-${GITHUB_RUN_ID:-local}"
git subtree split --prefix=project -b "$publish_branch"
commit_count="$(git rev-list --count "$publish_branch")"
if (( commit_count < 2 || commit_count > 7 )); then
  echo "Published history must contain 2-7 meaningful commits; found $commit_count" >&2
  exit 1
fi

gh repo create "$full_repo" --public --description "$description"
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
  echo
  echo "### Published history"
  git log --reverse --pretty='format:- `%h` %s' "$publish_branch"
} >> "${GITHUB_STEP_SUMMARY:-/dev/null}"

echo "Published https://github.com/$full_repo with $commit_count commits"

