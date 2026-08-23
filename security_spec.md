# Security Specification - Financial Dashboard

## Data Invariants
- All user data (transactions, accounts, investments, goals, profile) MUST be nested under `/users/{userId}`.
- A user can ONLY read and write their own data.
- Document IDs should be validated for format and length.
- Timestamps (if any, though not explicitly in blueprint) should use server time.
- Field types must match the blueprint exactly.

## The "Dirty Dozen" Payloads (Red Team Test Cases)

1. **Identity Theft (Write)**: Authenticated User A tries to create a transaction in User B's path.
   - Path: `/users/USER_B_ID/transactions/tx123`
   - Payload: `{ "id": "tx123", "amount": 100, ... }`
   - Expected: `PERMISSION_DENIED`

2. **Cross-User Snooping (Read)**: Authenticated User A tries to get User B's account balance.
   - Path: `/users/USER_B_ID/accounts/acc456`
   - Expected: `PERMISSION_DENIED`

3. **Anonymous Vandalism**: Unauthenticated user tries to update a user profile.
   - Path: `/users/USER_C_ID`
   - Expected: `PERMISSION_DENIED`

4. **Schema Poisoning (Type Mismatch)**: User tries to write a string into the `amount` field (number).
   - Path: `/users/USER_A_ID/transactions/tx789`
   - Payload: `{ "id": "tx789", "amount": "one thousand", ... }`
   - Expected: `PERMISSION_DENIED` (Validation should fail)

5. **Resource Exhaustion (Large ID)**: User tries to use a 2MB string as a document ID.
   - Path: `/users/USER_A_ID/transactions/[2MB_STRING]`
   - Expected: `PERMISSION_DENIED` (isValidId should fail)

6. **Shadow Fields (Creation)**: User tries to inject a `verified: true` field not in the schema.
   - Path: `/users/USER_A_ID/transactions/tx101`
   - Payload: `{ "id": "tx101", "amount": 100, ..., "verified": true }`
   - Expected: `PERMISSION_DENIED` (Strict keys check)

7. **Shadow Fields (Update)**: User tries to add a `role: 'admin'` field during an update.
   - Path: `/users/USER_A_ID`
   - Payload: `{ "activeSheetId": "sheet1", "role": "admin" }`
   - Expected: `PERMISSION_DENIED` (affectedKeys().hasOnly() check)

8. **Unverified Account Access**: User with `email_verified: false` tries to write. (Mandatory for standard writes).
   - Path: `/users/USER_A_ID/accounts/acc1`
   - Expected: `PERMISSION_DENIED`

9. **ID Hijacking**: User tries to create a transaction with an ID in the payload that doesn't match the document ID in the path (if enforced). Actually, let's enforce payload ID matching path ID if possible, or just ignore payload ID.
   - Better: User tries to set `userId` in a document to something else if the schema had it (but it's path-based here).

10. **Global List Scraping**: User tries to list ALL transactions across ALL users.
    - Query: `db.collectionGroup('transactions')`
    - Expected: `PERMISSION_DENIED` (Unless specifically allowed, which it isn't here)

11. **PII Leakage**: User tries to read another user's email if it were stored in the profile (not in blueprint but a general test).

12. **Negative Amount**: User tries to set a negative amount where only positive is expected (if enforced).
    - Payload: `{ "amount": -100 }`
    - Expected: `PERMISSION_DENIED` (if schema enforces `amount > 0`)

## Test Runner logic (Simplified)
We will implement rules that handle these cases.
