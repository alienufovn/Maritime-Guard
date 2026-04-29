# Security Specification: Naviguard Protocol

## Data Invariants
1. A feedback message must be a string between 10 and 2000 characters.
2. `createdAt` must always match `request.time`.
3. Users can only read their own feedback (if they were authenticated during submission).
4. Benchmark results are immutable once written.

## The Dirty Dozen (Attack Vectors)
1. **Unauthorized Write**: Attempt to write feedback with a future timestamp.
2. **Schema Poisoning**: Injecting a 1MB object into the `message` field.
3. **Identity Spoofing**: Submitting feedback on behalf of another UID.
4. **Blanket Query**: Authenticated user trying to `list` all feedback messages.
5. **PII Leak**: Non-admin user trying to `get` private benchmark logs.
6. **Immutable Override**: Attempting to `update` a submitted benchmark result.
7. **Phantom Delete**: Attempting to delete critical audit logs in `benchmarks`.
8. **Relational Break**: Creating a benchmark result for a non-existent taskId.
9. **Email Spoof**: Setting `userEmail` to an admin email without verification.
10. **Shadow Field**: Adding `isVerified: true` to a feedback document.
11. **ID Poisoning**: Using a 1MB string as the document ID for feedback.
12. **Denial of Wallet**: Rapid succession of `get` calls to exhausted resources.

## Test Strategy (Manual Audit)
- Verify `isValidFeedback()` enforces string size and request time.
- Verify `isValidBenchmarkResult()` prevents field injection via `keys().size()`.
- Verify `allow list` is restricted to owners.
