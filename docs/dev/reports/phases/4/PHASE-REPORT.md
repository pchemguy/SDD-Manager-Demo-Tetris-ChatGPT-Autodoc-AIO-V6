# Phase 4 — Persistent configuration

## Delivered boundary

T-028–T-037 deliver six live native controls, dynamic whole-piece ghost visibility, alternate locking policies and independent cookie/URL persistence for version0.4.0. Every setting resolves valid unique URL → valid unique cookie → default before game creation. Explicit URL defaults save; omitted/invalid parameters never replace saved choices with defaults. Changed keys preserve path, fragment, foreign query and history state without adding entries. Cookie/history failures are independent, visible and nonblocking.

Availability/visibility changes are immediate; each spawned piece captures both locking policies. Hold/drop/preview disabling preserves domain state. Dynamic ghost hides straddling/upper projections and returns for wholly lower projections, including penetrators. Ghost remains independent of hard-drop availability. The guide documents exact values, timing, persistence and failure behavior.

## Review and verification

Independent read-only milestone4.1,4.2 and whole-phase4.3 assessments/rechecks found no remaining Critical, Important or Minor issue. Review covered source/settings/domain/controller/presentation/input boundaries and predecessor behavior separately from execution. Reports4.1–4.3 retain detailed evidence; none has unresolved TODOs.

Final executable payload at T-036 passed 144 unit tests, TypeScript/Vite build/package and66 packaged Chromium/Firefox checks:64 page interactions and2 HTTP/member-inventory checks. This report changes no executable payload, so that evidence remains applicable. Includes actual cookies/reloads for all keys, mixed/invalid/duplicate sources, history preservation, modeled independent failures, native select ownership, whole-piece midline geometry, all four penetrator locking combinations, minimum viewport and classic/modern/natural penetrator regressions.

Actual T-028–T-036 commit audit confirms one owning task/result/evidence/initial checkbox per commit; T-037 will be audited after commit. Prior closed phase report paths are unchanged. Tasks/issues and delivery milestones are verified published/closed before this review; phase-review closure, explicit main merge, merged checks, hosted CI and release publication remain pending effects.

## Release readiness and limits

Version/package0.4.0 and player documentation match the delivered scope. Required product members exclude credentials, caches, skills and development provenance. Final release must use the exact eligible main release commit, reproducible clean ZIP/checksum and matching notes/tag/body/assets. The optional comprehensive-prerelease advisory was emitted; required independent code review and package checks continue without an approval pause.

Linux HTTP and isolated Chromium/Firefox execution are established. HTTPS Secure flags are adapter-tested. Native OS-window/tab visibility, actual BFCache eligibility and Windows execution remain unverified. Local Firefox requires the diagnosed trusted-local-only content-sandbox override; CI uses normal defaults.

## TODO

None within phase4. Session leaderboard and manual JSON/SQLite files remain assigned phases5/6, not phase4 deferrals. Full T-001–T-057 authorization remains active through1.0.0.
