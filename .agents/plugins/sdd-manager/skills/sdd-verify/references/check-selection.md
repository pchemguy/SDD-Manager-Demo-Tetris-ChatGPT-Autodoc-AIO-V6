# Select sufficient checks

Include the shared [Markdown style](../../sdd-conventions/references/markdown-style.md) in scoped document checks: heading, top-level list and code-block separation, four-space structural/list indentation, single-space marker separators, continuation attachment and Markdown templates. Preserve literal code/data syntax and exclude closed records. Formatting checks do not replace substantive conformance or authorize repairs.

Read the accepted contract and requested work boundary before selecting commands. Inspect the actual diff or relevant implementation, declared tooling, and tests. A task's expected edit scope helps locate effects; it does not excuse ignoring dependent behavior affected by its changes.

## Scope and evidence

| Boundary | Evidence to establish |
| --- | --- |
| Task | Its acceptance conditions and directly affected behavior, including necessary regressions. |
| Selected change | Changed contracts, affected consumers, compatibility, and integration paths. |
| Milestone or phase | Separate implementation code review and check evidence, applicable PLAN exits, constituent results, cross-component behavior and report/TODO evidence. Load boundary review for explicit review tasks. |
| Project | Requested acceptance, integration, build, packaging, or other project-level checks. |

For feature work, use the owning FEATURE-TASKS and relevant feature contracts alongside applicable main requirements. A feature's scoped parent checkbox does not establish the whole-project milestone or phase exit conditions.

Select current maintained documents and active campaign records for documentation/link checks. Exclude [closed campaign artifacts](../../sdd-conventions/references/review-campaigns.md#closed-campaign-records); they are historical, need no current compatibility check and must not produce a repair/report backlog. Read selected history only for a specific task question. Verify preservation through the proposed path/object diff, without loading old contents. Describe actual check scope accurately.

## Select checks

1. Identify observable acceptance conditions and the evidence each needs. Reuse meaningful tests, inspections, examples, or measurements; do not create artificial tests merely to populate a checklist.
2. Select direct checks for affected behavior, dependent checks for relevant consumers, integration checks for collaborating components, and exit checks for the requested boundary. Include failure paths and operational risks where the contract calls for them.
3. Follow mandatory project commands, suites, supported environments, and boundary checks. Run the declared full suite when project policy or the requested scope requires it; report why checks are omitted or unavailable. An apparently small change does not waive governing requirements.
4. Use existing test routing when helpful, but inspect whether it still reflects the changed components and contracts. Report missing or stale mapping entries rather than treating the map as proof of coverage.
5. Identify coverage gaps and unsuitable checks. Return needed test design or changes through the implementation workflow to **sdd-tdd**; verification does not silently add tests or redefine acceptance.

Select checks proportionate to the requested claim. For example, compilation does not establish runtime behavior, a unit check may not establish packaging, and a timing run does not establish correctness. Documentation may need inspected contracts, executable examples, link checks, or documentation generation instead of unrelated runtime tests. Performance or security claims require evidence appropriate to the particular claim.

## Representative capability readiness

Derive environment probes from the capabilities required by the planned checks. Installation success, package presence or a trivial smoke check verifies only what it exercised; it cannot establish repeated-session, rendering, platform or native-delivery capability. Record observed coverage and limits, then route an actual facility blocker to the manager and affected execution workflow. Do not silently reduce acceptance to available evidence.

When selected checks need a browser, follow applicable project policies and declared setup before choosing facilities or executing checks. Route an observed setup/runtime blocker to the execution workflow. Retain required coverage and report policy conflicts rather than silently changing acceptance. Browser/fonts/Canvas checks are not prerequisites for unrelated CLI or pure engine tasks. Keep modeled handler evidence separate from native event delivery, and interactive agent-browser evidence separate from the project's automated harness.
