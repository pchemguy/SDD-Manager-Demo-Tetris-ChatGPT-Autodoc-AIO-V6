# Phase 5 — JSON leaderboard

## Delivered boundary

T-038–T-047 provide a page-lifetime top-ten leaderboard and manual schema-validated JSON Save/Restore for0.5.0. Every completed game, including zero, records once with unique stable identity and UTC completion time. Restart retains results; abandoned runs are excluded and navigation/reload clears history. Ranking is score descending, then timestamp and ASCII ID ascending.

JSON uses the actual canonical draft2020-12 schema with pinned Ajv8.20.0, strict real-calendar UTC format, no coercion/defaults/removal and semantic duplicate-ID validation. Bounded fatal UTF-8 decoding returns a fresh candidate. Restore replaces only after complete validation. Save snapshots records; empty/full/unsorted and mismatched-extension JSON work. The exact schema is downloadable and production license notices ship.

File actions compose pause reasons, disable overlap/restart, handle cancellation/failures and bound codec initialization/work by10000ms. Late replies cannot commit. Picker/read/download listeners, timers, URLs and inputs have owned cleanup. Source review and tests repaired download setup URL leakage, pre-aborted picker work and falsy rejection success classification.

## Independent review and executed acceptance

Independent read-only reviews for all three milestones and final guide/test recheck found no remaining Critical, Important or Minor issue. Code assessment covered validation/store, completion lifecycle, rendering, actual schema/codecs and file/controller/presentation/resource boundaries separately from execution. Reports5.1–5.3 contain findings/rechecks and no unresolved TODOs.

Final executable payload at T-046 passed221 unit tests, TypeScript/Vite package and86 complete exact-packaged Chromium/Firefox checks:84 page interactions and2 exact HTTP/member checks. Includes predecessor classic/modern/natural penetrator/configuration behavior; actual real-game top-ten/restart/reload behavior; empty/ten/unsorted JSON uploads/download bytes, stable fields and exact schema download; nine invalid uploads preserving every prior row. Controlled tests prove size-before-read, immutable snapshot, deadline/cancel/late-work handling and pause composition. Modeled failure/cancel events are distinguished from real uploads/downloads. Firefox full leaderboard/file-controls screenshot inspected. This report changes no executable payload, so final acceptance remains applicable.

Actual T-038–T-046 commit audit confirms one owning result/evidence/initial checkbox per commit. Prior closed phase reports are unchanged; T-047 will be audited after commit. Delivery issues/milestones are published/closed. Phase-review closure, explicit main integration, merged verification, hosted CI and0.5.0 release remain pending effects.

## Release readiness and limits

Version/package0.5.0, guides and capability labels agree on JSON-only portability. Clean final package must be reproducible and bound to an eligible main release commit/tag, exact notes/body and verified uploaded/downloaded assets. The optional comprehensive-prerelease advisory was emitted; required review/checks proceed under full authorization.

Linux HTTP/isolated Chromium and Firefox are verified. OS-window visibility, actual BFCache eligibility, native OS picker cancellation, HTTPS execution and Windows remain unverified or modeled as described in reports/README. Local Firefox requires the diagnosed trusted-local-only override; hosted CI uses defaults.

## TODO

None for phase5. SQLite portability remains assigned phase6T-048–T-057, not a deferral. Full target completion remains1.0.0 after that verified integration/release.
