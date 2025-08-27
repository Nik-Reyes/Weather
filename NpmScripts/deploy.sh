#!/bin/bash

set -e
git show-ref --quiet refs/heads/gh-pages || git branch gh-pages
git checkout gh-pages
git merge main --no-edit 
npm run build 
git add dist -f
git commit -m 'Deployment commit' || echo "No changes to commit"
git subtree push --prefix dist origin gh-pages
git checkout main