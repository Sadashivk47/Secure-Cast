# Firestore Security Specification - Broadcast App

## Data Invariants
1. A profile is only readable and writeable by its owner, or readable by an admin.
2. A group is only manageable (create, update, delete) by an admin.
3. Members can only see their own memberships in `group_members`.
4. Members can only see messages that were sent to them (tracked via `message_recipients`).
5. `admin_activity_log` is strictly restricted to admins.
6. All timestamps (`created_at`, `updated_at`, `sent_at`) must be server-generated.
7. Role assignments must not be modifiable by the users themselves.

## The "Dirty Dozen" Payloads (Denial Tests)
1. **User Spoofing Profile**: User A trying to update User B's profile.
2. **Elevating Role**: Member trying to update their own `role` to 'admin'.
3. **Unauthorized Group Creation**: Member trying to create a `Group`.
4. **Unauthorized Broadcast**: Member trying to create a `Message` document.
5. **Intercepting Private Message**: User A trying to read a `MessageRecipient` doc belonging to User B.
6. **Modifying Delivery Status**: User A trying to update `read_at` for User B's message.
7. **Bypassing Member Count**: User trying to update `member_count` in a `Group` manually.
8. **Malicious ID Injection**: Trying to create a document with a 2KB junk string as ID.
9. **Timestamp Manipulation**: Trying to set `created_at` in the past.
10. **Ghost Field Injection**: Adding `is_god_mode: true` to a profile update.
11. **Reading Activity Logs**: Member trying to list documents in `admin_activity_log`.
12. **Deleting Admin Resource**: Member trying to delete a `Group`.

## Test Runner (Logic Verification)
(This would be implemented in a test file, but here we describe the logic gates)
- `isValidProfile(data)`
- `isValidGroup(data)`
- `isValidMessage(data)`
- `isOwner(userId)`
- `isAdmin()`
