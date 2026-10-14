# Product requirements | Bean Professor 2.0

## Product promise
A user brings their beans, gear, brewing or roasting goals, and previous results. The Bean Professor recommends an actionable experiment with clear provenance, tracks the session, and helps interpret the outcome. Do not claim all guidance is formally approved by the Specialty Coffee Association.

## Navigation and priority
Bottom tabs: **Coffee School**, **Brew Lab**, **Lab Journal**, **Roast Lab**. Profile and equipment library via account/settings; Coffee School opens first on default home. Native safe areas, accessibility, light/dark support where appropriate. Overall style: espresso/cream with slightly laboratory-inspired labels, cozy coffee shop photography as a readable blurred backdrop, authentic supplied logo. Avoid putting heavy blurry photo behind dense or interactive text without contrast treatment.

## Coffee School (P0)
- Chat anchored in indexed, rights-cleared specialty-coffee research; default placeholder 'Teach me something new about coffee'.
- Explain origin, processing, flavor chemistry, water, extraction, brewing, roasting, coffee history and standards.
- Cite individual claims with tappable source metadata; distinguish established evidence, expert opinion and uncertainty.
- Save optional conversations, but never present uncited historic quotations as confirmed.

## Brew Lab (P0)
- Default equipment: Calphalon espresso, Chemex, Bee House cone, siphon, AeroPress, French Press, Bialetti Moka Pot. Allow custom devices and favorites.
- Enter coffee name, origin/region, variety, processing, roast, grinder, water, dose and sensory goal.
- Camera, library image and screenshot ingestion; present recognized fields for confirmation/editing and a confidence indicator. Never auto-commit guesses.
- Guide output: recipe with dose, yield/ratio, grind descriptors, water temperature, timing, steps, sensory reasoning, corrective adjustments and source citations; clearly mark method-specific differences.
- Session timer with lap/events; editing notes, ratings, measured results, and lab-chat tied to the experiment.

## Lab Journal (P0)
- Browse/filter/search saved brews, roasts, favorites and notes. Preserve legacy sessions through adapter.
- View exactly what guide was generated and which references were available when saved, plus user changes and tasting notes.
- Export user's own sessions; enable account and journal deletion path consistent with policies.
- Add structured observed values (dose/yield, duration, first crack, roast outcome) as optional fields; don't overwrite old free-text data.

## Roast Lab (P1, but initial basic flow required)
- Defaults: Behmor 1600 original, allow user-defined roasters; show supported controls for model variant.
- Green coffee origin, variety, process, batch weight, target style, moisture/density if known; scan packaging or screenshot for suggestions.
- Output pre-roast settings, checkpoints, expected uncertainty, monitoring and cooling instructions; never fabricate inaccessible sensor data.
- Hard-stop suggestions incompatible with original Behmor 1600 locked-settings behavior. Important: verify legacy assertion about selectable settings/manual controls from original manufacturer's documentation before claiming specific button actions.
- Stopwatch with first crack / cooling markers, optional notes and roasting chat.
- Roasting guidance is informational; include equipment manufacturer's safety instructions and avoid unsafe overrides.

## Authentication (P0)
- Email/password with real confirmation and reset flow; Google login on both OSs; persistent sessions; understandable error messages.
- Native deep link and universal/app links, token storage in appropriate platform secure storage, sign-out.
- Public educational mode may allow browsing without login; saving requires login.

## Welcome (P1)
- One short verifiable coffee fact/tip/quote when app opens after a fresh session, dismiss via tap/fade.
- Rotate fairly without immediate repeats; only approved entries with provenance; attributed quotes need exact original reference.
- Allow accessibility reduced motion and skip.

## Acceptance criteria for primary journeys
1. Fresh user can sign up, verify email, sign in, reset password, sign in with Google, and sign out on physical iPhone and Android.
2. Given a bag photo, confirm/edit parsed data before generating a Brew Lab guide; display applicable citations and save to Journal.
3. Existing session imported into staging is visible only to its owner, and saving edits survives app restart.
4. Original Behmor selected never gets instructions requiring an unavailable in-roast power change.
5. Coffee School answer contains a clear, accessible source trail for each factual/numeric claim or explicitly labels unsupported suggestions.
6. Timer elapsed time remains correct after screen lock and app background/foreground cycles; alerts aren't used as a substitute for supervision.
7. First-run splash can be dismissed immediately and never blocks login or loading.
8. App works with poor network: user sees cached journal; expensive online features report unavailable state honestly.
