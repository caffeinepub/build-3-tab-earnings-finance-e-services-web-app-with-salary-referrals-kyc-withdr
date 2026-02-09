# Specification

## Summary
**Goal:** Make Tap-to-Earn tapping feel instant and responsive during rapid taps while reducing network overhead and preserving existing rules (ban checks, claiming behavior, and ad triggers).

**Planned changes:**
- Update the Tap-to-Earn UI to increment coin balance/tap count immediately on tap (optimistic UI), without blocking fast consecutive taps.
- Batch/queue taps on the client and flush them to the backend periodically instead of sending one request per tap, with reconciliation/rollback on failures.
- Add a backend method to register a batch of taps in one call (increment by N) with validation (non-zero and reasonable max) and existing authorization/ban checks; keep existing single-tap and claim behavior unchanged.
- Ensure ad-trigger thresholds (small at multiples of 45, big at multiples of 280) are evaluated against the effective (optimistic/batched) tap count, without double-triggering, and keep tapping blocked while an ad is showing.

**User-visible outcome:** Users can tap rapidly in Tap-to-Earn with immediate on-screen increments and smooth responsiveness; taps sync to the server in batches, bans still prevent tapping, and ads still trigger at the correct counts.
