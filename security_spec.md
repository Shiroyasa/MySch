# Security Specification & Threat Model — MySchool

## 1. Data Invariants
1. A user cannot elevate their own role upon registration or update.
2. Only verified admins (including bootstrapped admin `kkaito447@gmail.com`) or role authorized managers can write master data.
3. Attendance and Assessment updates cannot modify immutable fields (e.g., studentId, sessionId, createdAt).
4. Student grades and scores cannot be published or tampered with by students.
5. All IDs must strictly conform to `isValidId` (`size <= 128`, regex matching alphanumeric and hyphens).
6. String fields must enforce maximum length constraints to prevent Denial-of-Wallet attacks.

## 2. The Dirty Dozen Payloads
1. **Self-Promote Super Admin**: Non-admin user attempts to write `{ role: "super_admin" }` to their user doc.
2. **Ghost Field Poisoning**: Inserting arbitrary `{ isAdmin: true, bypassSecurity: true }` in attendance payload.
3. **Huge String Attack (Denial-of-Wallet)**: Submitting a 500KB string into the `note` field.
4. **Invalid Path ID**: Attempting to create a document with path containing directory traversal or non-regex characters.
5. **Unauthorized Grade Tampering**: Student attempting to write directly to `/assessmentScores/{scoreId}`.
6. **Immutable Field Mutation**: Attempting to alter `sessionId` or `studentId` on an existing score.
7. **Unverified Email Impersonation**: Forging `request.auth.token.email` with `email_verified == false`.
8. **Blanket Query Scraping**: Attempting an unrestricted `getDocs` on private records without role verification.
9. **Orphan Attendance Line**: Creating an attendance record targeting a non-existent session ID.
10. **State Shortcutting**: Transitioning an assessment directly from 'draft' to 'dipublikasikan' by unauthorized role.
11. **Negative / Out-of-Bounds Score**: Score set to 9999 or -50.
12. **Audit Log Erasure**: Any user or actor attempting to delete or overwrite past audit logs.

## 3. Test Runner Specification
Tests verify PERMISSION_DENIED on each of the 12 malicious payloads.
