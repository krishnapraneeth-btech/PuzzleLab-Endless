#!/usr/bin/env bash
# Push this project to a GitHub repository.
# Usage: ./push-to-github.sh https://github.com/YOUR-USERNAME/YOUR-REPO.git [branch]
set -euo pipefail

REPO_URL="${1:?Usage: ./push-to-github.sh https://github.com/USER/REPO.git [branch]}"
BRANCH="${2:-main}"
cd "$(dirname "$0")"

# Work even if the downloaded folder has no usable .git directory.
if [ ! -d .git ] || [ ! -f .git/HEAD ]; then
  git init -q
fi
git config user.name "Arena Agent"
git config user.email "agent@arena.ai"

git add .
git commit -q -m "Puzzle Lab — endless offline puzzle APK" || echo "Nothing new to commit."

git branch -M "$BRANCH"
if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REPO_URL"
else
  git remote add origin "$REPO_URL"
fi

echo "Pushing to $REPO_URL (branch: $BRANCH) ..."
git push -u origin "$BRANCH"
