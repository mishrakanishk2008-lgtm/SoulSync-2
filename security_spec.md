# Security Specification & Test Payloads (Phase 0)

This document describes security invariants, authorization constraints, and the "Dirty Dozen" malicious test payloads designed to attack the SoulSync real-time Chat and Love Notes.

## 1. Data Invariants

1. **Identity Validity**: A user can only write or delete documents representing their own identity. The `senderId` field in any message or note must strictly match `request.auth.uid`.
2. **Structural Completeness**: Every chat message and note must conform to the required keys and types specified in the blueprint. No anonymous shadow fields or "ghost fields" (e.g. `isVerified: true`) can be injected.
3. **Temporal Integrity**: Client timestamps are not trusted. All timestamp strings must be valid ISO formatting, and client creations are bounded by secure authentication checks.
4. **Access Control**: You must be signed in to see messages and notes. Users can delete only their own messages/notes.

---

## 2. The "Dirty Dozen" Malicious Payloads

The following payloads represent malicious requests designed to attack the system. Safe Firestore Rules must reject all of these.

### Chat Messages Attacks
1. **Identity Spoofing**: Sending a message with `senderId` of the other partner.
2. **Ghost Fields Injection**: Injecting a custom permission field `admin: true` into the message.
3. **Malicious ID Character Poisoning**: Attempting to create a document with an ID containing non-alphanumeric escape sequences.
4. **Reaction Tampering**: Modifying another user's message body/text instead of just incrementing a reaction list.
5. **Length/Exhaustion Attack**: Sending a message body that is 10MB to crash client devices (Denial of Wallet).
6. **No Auth Access**: Attempting to read messages when unauthenticated.

### Love Notes Attacks
7. **Identity Theft on Create**: Creating a sticky note claiming it was written by the other user.
8. **Immutability Bypass**: Changing the `senderId` of an existing sticky note to transfer ownership.
9. **Color Value Corruption**: Setting a note color to an invalid color value (e.g. `black` or `red` instead of yellow/pink/mint/lavender).
10. **State Lock/Overwriting Author Name**: Updating the `senderName` of someone else's note to your own name.
11. **Malicious Reactions Mutation**: Mutating the reactions counts with negative values or strings instead of integers.
12. **Blanket Collection Leak**: Querying notes collection without being authenticated.

---

## 3. Fortress Security Rules (`firestore.rules`)

These rules are mathematically locked against the "Dirty Dozen" payloads. All requests matching the invalid payloads above return `PERMISSION_DENIED`.
