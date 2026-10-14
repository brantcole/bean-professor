# Security, test plan, and mobile release

## Security and compliance
- No model API keys, Firecrawl keys, Lovable keys, Supabase service-role keys or service credentials in bundle or source control. Client uses only publishable Supabase key if policy allows.
- Supabase RLS tested for all user-owned tables: authenticated A cannot read/change B's journal, equipment or stored scans. Check storage bucket policies too.
- Scan photos may include names/addresses or personal data: explain retention, default to deletion after parsing unless user explicitly saves originals, and allow delete/export.
- Separate staging/production; limit database privileges; make migrations reversible where possible and take backups.
- Moderation, rate limits, privacy policy, terms, support address, data deletion in app. Document any third-party processing of uploaded images and AI conversations.
- Authentication: email confirmation, verified reset emails, Google sign-in on both OSs, deep links, account deletion, recovery and sign-out. Confirm Apple requirements for third-party social login and comparable sign-in methods before submission.
- Avoid claims of official SCA endorsement or of medical/food safety assurance.

## Test matrix
- iOS physical device and simulator; Android physical device and emulator; small/large screens, dynamic type, screen readers.
- Auth: brand-new email confirmation, expired link, reset, Google, token refresh, deep-link cold launch, blocked account and deletion.
- Lab: no photo/camera permissions, oversize/HEIC image, bad OCR, missing origin, duplicate submit, offline, API timeout, cancel, export.
- Timer: backgrounding, suspended app, orientation, device time adjustments, resume, reload and low power mode.
- Equipment: Behmor original vs newer models and unknown custom roaster; NEVER suggest inaccessible controls.
- AI: fabricated citation URLs, conflicting sources, source with no passage, empty retrieval, prompt injection hidden in label photograph or source text.
- Journal: migration fidelity, multi-device sync, RLS negative tests, duplicate save, edit/delete and backup recovery.
- Accessibility: reduced motion for splash, labels and focus order, contrast against cafe photo.

## Release checklist
1. Choose app display name, iOS bundle identifier, Android application ID and verify trademark/name availability.
2. Acquire/develop complete icon/splash asset set from user-owned artwork; verify sizing and native readability.
3. Configure Apple Developer, App Store Connect, Google Play Console and Expo EAS; verify current publisher requirements when submitting.
4. Internal testing -> closed beta (TestFlight/Play) -> production only after functional, privacy, accessibility and evidence review.
5. Prepare screenshots, description, content rating, privacy disclosures, account deletion and support contact. Match store disclosure to actual telemetry/AI/photo behavior.
6. Instrument crashes, performance, cost caps and abuse alerts with privacy-respecting logging. Set incident rollback plans.

## Definition of done
Release candidates have successful device test runs, signed binaries, checked migrations, reproducible CI, tested auth, traceable coffee advice, clear disclaimers and reviewer-ready policies. Passing a local web preview alone does not satisfy this gate.
