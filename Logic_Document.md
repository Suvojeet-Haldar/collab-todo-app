# Logic Document

## Smart Assign Logic

The **Smart Assign** feature ensures fair distribution of workload among users. Here's how it works:

1. **Trigger**: A user clicks the "Smart Assign" button on any task.
2. **Backend Logic**:
   - All users are fetched.
   - For each user, the number of tasks in **Todo** and **In Progress** statuses are counted (considered active tasks).
   - The user with the **least number of active tasks** is selected.
3. **Assignment**: That user is assigned to the task.
4. **Sync**: The change is broadcast in real-time to all connected clients via Socket.IO.
5. **Edge Cases**:
   - If multiple users have the same count, the first matching user is chosen.
   - If no users exist or all are equally loaded, the system does nothing or shows a warning.

## Conflict Handling Logic

The app detects real-time **task editing conflicts** between multiple users. Here's how:

### Detection:

1. Each task has a `lastEdited` timestamp and `updatedBy` field.
2. When a user tries to **edit and save a task**, the frontend:
   - Fetches the latest version from the server.
   - Compares the local timestamp (`lastEdited`) with the current server value.
3. If there's a mismatch, a **conflict is detected**.

### Resolution:

A modal (`ConflictModal`) pops up with:
- **Your Version**: The user's unsaved changes.
- **Server Version**: The latest saved version from another user.
- Two buttons:
  - **Merge**: Merges description or fields manually (optional).
  - **Overwrite**: Pushes your version to the server and updates it for all users.

### Broadcast:
After conflict is resolved, the final version is emitted to all users via Socket.IO and stored in MongoDB.

## Task Title Validation Logic

Validation is enforced on both frontend and backend:

- **Uniqueness**: No two tasks on the same board can have the same title.
- **Forbidden Titles**: The task title cannot be:
  - "Todo"
  - "In Progress"
  - "Done"
- If a conflict is found, the task is not saved and the user is shown a relevant error.
