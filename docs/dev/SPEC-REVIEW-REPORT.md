# SPEC review report

## Current gate

State: Ready for delivery planning. Owner: sdd-specify. Reviewed on 2026-10-25.

Scope: SPEC root, four semantic children and the normative JSON Schema. No implementation, production validator execution or browser acceptance is claimed. Package-wide QC is outside this assessment.

## Reviewed identities

- `SPEC.md`: SHA-256 `c23d34279910953298f7bb1e1b0efbd0da8fe7cc5f639899c816f0b5b8ac3a5a`.
- `spec/CONFIGURATION.md`: SHA-256 `7bce1c97539bcd31dc775979b9d4cbe7be9a469e79f4ca61224071f46db8d3c9`.
- `spec/GAMEPLAY.md`: SHA-256 `3f5f86115108b7bab2d69d01d953690ebafd4b2ffb63f48724354221fa37d225`.
- `spec/LEADERBOARD-SCHEMA.json`: SHA-256 `5b24a01939d53dc185c421aaa34173f1b3e8cfd545695519e77c8574426e7cd6`.
- `spec/LEADERBOARD.md`: SHA-256 `86ca42a8c88050e542abcb9a938a7363e6bcd1d3a60168db7717f9285d7b00d4`.
- `spec/ROTATION.md`: SHA-256 `5dcb2682df56cc2ebdea6b29794fc5b547cb8599145d444897c54d037d3c67f1`.

## Governing inputs

- `PROJECT.md`: SHA-256 `356830face7845b524b9d21011ad899d0ca4491bc70baca9ddf59712021fccc1`.
- `ARCHITECTURE.md`: SHA-256 `afd0c9d33a017ab2456061098763febb6700afc222f168bb4e55209179b29488`.
- `DECOMPOSITION.md`: SHA-256 `a10c96c6d030e25bedfb4c08c56b2b509ea09ef86ccd960fbc713f2edcb91107`.

The explicit PROJECT approval and subsequent scoped autodoc preapproval are recorded in DOCS_PREPARATION. Acceptance and technical readiness remain separate.

## Initial review

Compared each accepted scope group with its canonical contracts and component owners. Inspected collision/locking/penetrator interactions, source/hold lifetimes, timing and pause ordering, independent settings resolution/write failures, result ranking and atomic file boundaries. Inspected every rotation transition and downward-positive sign convention; checked schema JSON parsing, required fields, bounds and timestamp pattern examples. Local document links and preparation-content boundaries checked.

| Coverage | Contract route | Assessment |
| --- | --- | --- |
| Classic lifecycle, gravity, scoring, input | G-01–G-06; S-01/S-05; A-01/A-03/A-09 | Defined and consistent with domain/controller ownership. |
| Modern queue/rotation/hold/ghost/drop | G-07–G-09, R-01; A-02/A-04 | Geometry/tables, target sharing and midline straddling are explicit. |
| Penetrator and bonuses | P-01–P-03; S-02; A-05 | Traversal differs from locking; viability/hold/cap/white rendering are covered. |
| Six settings and persistence | C-01–C-04; S-03; A-06 | Defaults/tokens, duplicates, omission and independent write failures are covered. |
| Session ranking and portable results | L-01–L-04; S-04; A-07/A-08 | ID/score/UTC, schema-first JSON, actual SQLite metadata/schema/storage classes, resource limits and atomic replacement are covered. |
| Browser/output requirements | S-05/A-09 and component verification seams | Chromium/Firefox interaction, rendering, reload and file IO are required; document checks do not substitute for them. |

Confirmed unresolved findings: none. No correction/recheck cycle was needed. Schema parsing/pattern checks do not establish a compiled validator's behavior; implementation must compile the actual schema with explicit format validation and run the invalid-date corpus. SQL syntax/metadata and row validation remain acceptance work using the actual bundled SQLite runtime. The contracts define intended behavior, not existing functionality.
