# Team Git & GitHub Workflow

## Phase 1: Planning (On GitHub)
Before anyone types a single line of code, the task must exist on GitHub.

1. Go to the **Issues** tab on GitHub.
2. Click **New Issue**. Add a title and description.
3. Look at the number GitHub assigns it (e.g., `#5`). You will need this number later.
4. Assign the issue to the person doing the work.

---

## Phase 2: Starting the Work (In PowerShell)
Never start coding until you have pulled the latest changes from the team and created a safe workspace (a branch).

1. Sync your local computer with GitHub:
   ```powershell
   git checkout main
   git pull origin main
   ```
2. Create a new branch for your specific task:
   *(Name it something related to the task, like `feature/login` or `feature/allergy-check`)*
   ```powershell
   git checkout -b feature/your-branch-name
   ```

---

## Phase 3: Coding & Saving (In IntelliJ & PowerShell)
Now, open IntelliJ and write your code. Once the code is working and tested:

1. Stage all your changes:
   ```powershell
   git add .
   ```
2. Commit the changes:
   *(Always include "Refs #IssueNumber" so GitHub automatically links it)*
   ```powershell
   git commit -m "Feat: Briefly describe what you did (Refs #5)"
   ```
3. Push your branch up to GitHub:
   ```powershell
   git push -u origin feature/your-branch-name
   ```

---

## Phase 4: Review and Merge (On GitHub)
**The person who wrote the code does not merge it.** Another team member does.

### 1. Create the Pull Request (The Coder):
* Go to the GitHub repository.
* Click the **Pull requests** tab.
* Click **New pull request**.
* Base: `main` <- Compare: `feature/your-branch-name`.
* Click **Create pull request**.

### 2. Review and Merge (The Reviewer):
* Open the Pull Request.
* Check the **Files changed** tab to make sure they didn't break anything.
* Click **Merge pull request** and confirm.
* Click the **Delete branch** button that appears immediately after merging. *(This keeps the remote repository clean).*

---

## Phase 5: Cleanup (In PowerShell)
Once the code is merged into `main` on GitHub, the coder's local branch is now useless. They need to clean up their computer.

1. Switch back to main and get the newly merged code:
   ```powershell
   git checkout main
   git pull origin main
   ```
2. Delete the old local branch:
   ```powershell
   git branch -d feature/your-branch-name
   ```
3. Clear out deleted remote branches from your local view:
   ```powershell
   git fetch --prune
   ```

> **Note:** If your team strictly follows this loop (Issue -> Sync -> Branch -> Code -> Push -> PR -> Merge -> Clean), you will never overwrite each other's files.
