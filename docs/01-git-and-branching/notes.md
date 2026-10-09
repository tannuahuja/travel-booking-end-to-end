# Git and branching — interview notes

A branch is a movable reference to a commit that lets you work independently.

Typical workflow: update main → create feature branch → commit → push → pull request → CI checks and review → merge.

```bash
git status
git switch main
git pull --ff-only
git switch -c feature/my-change
git diff
git add .
git commit -m "feat: describe the change"
git push -u origin feature/my-change
git log --oneline --graph --decorate --all
```

Interview questions:
- Difference between fetch and pull?
- Difference between merge and rebase?
- How do you resolve conflicts?
- Why protect main?
- What is trunk-based development?
