# Specification

## Summary
**Goal:** Localize the app UI to Bangla (bn-BD), switch all currency display/labels to BDT, update tap-to-earn claiming to convert taps into BDT, and adjust the tap-to-earn ad flow to show immediate externally configured ads.

**Planned changes:**
- Replace all user-facing frontend strings across Earn/Finance/E‑Service/Profile/Admin flows with Bangla (bn-BD), including titles, buttons, form labels/placeholders, toasts/alerts, empty states, and validation/error messages.
- Update all money/balance displays and amount-related labels/help text from USD to BDT using the ৳ symbol and Bangla-appropriate formatting where applicable.
- Implement tap-to-earn claiming conversion: credit +8 BDT per full 1000 taps/coins and preserve any remainder taps/coins for future claims; update related UI messaging to reflect credited BDT (in Bangla).
- Remove the prior 30-second delay/countdown from the tap-to-earn ad trigger so interstitial ads open immediately when thresholds are reached.
- Update the tap-to-earn interstitial ad rendering to load ads from a single configurable external ad script snippet and/or direct ad URL, replacing self-hosted static creative inventory; show a Bangla error state with a close option if the external ad fails to load.

**User-visible outcome:** The entire app appears in Bangla with BDT currency everywhere; tap-to-earn claims add BDT to balance at 8 BDT per 1000 taps while saving leftovers; and tap-to-earn ads show immediately and are served from the provided external script/link with graceful Bangla fallback messaging on failure.
