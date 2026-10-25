# Browser development policy

Apply this policy before selecting or using browsers, including agent browser tools, project automation and remote/container facilities. Browser-independent work and document-only planning require no browser installation.

Selection and isolation rules are mandatory; framework guidance and capability checks apply only where relevant to the selected work.

## Browser selection

- **Project documents govern browser priorities, requirements and test coverage**, including objectives established with the user during document design. Apply the defaults below only to unspecified choices.
- **When a browser is needed and none is specified, prioritize Chromium.** Include Firefox in the default browser environment. This does not require every individual check to run on both; select checks from the task's acceptance criteria and documented matrix.
- **Other browsers are prohibited by default.** Use them when project documents explicitly define the corresponding priority or requirement. Do not select another browser simply because it is available.
- Use the project's declared automation framework and compatible browser builds. A browser target does not itself select Playwright or add supported platforms.

## Environment isolation

Use a dedicated environment with identifiable browser binaries and isolated profiles, caches and downloads. Its binary location must be assigned to the project, execution job or disposable container, with a known distribution/version compatible with the runner. Reuse an existing contained installation when these conditions are established; downloading again for each task is unnecessary.

Do not search for or use personal/system browser installations, attach to personal sessions, or reuse personal profiles, cookies or extensions. Do not install, replace or reconfigure a global browser. Keep generated binaries/state outside tracked source and production assets; add ignore rules for repository-local generated paths. Clean up only owned sessions and artifacts.

For agent tools and remote facilities, establish the browser identity, dedicated installation and isolated state before use. Tool availability or an isolated profile alone is insufficient. If those conditions cannot be established, treat that facility as unavailable and select a compliant alternative or report the affected browser work blocked.

## Setup

1. Inspect project documents, dependencies, lockfile, runner configuration and declared commands. Establish the required browsers, modes and capabilities for the actual execution host.
2. Provision missing assets from official browser/framework distributions within the authorized environment. Keep browser and runner versions compatible; preserve unrelated toolchains and caches. Host dependencies must remain within the authorized setup scope.
3. Configure binary/state locations consistently for installation and execution, including CI and separate tool processes. Follow the host's shell policies. Put setup sequences in temporary shell files with explicit failure handling; stop after a failed prerequisite before running dependent tests.
4. Exercise the actual project runner/application path. Retain reproducible setup commands, versions, installation location, launch mode and evidence limits in existing project documentation or task evidence.

## When Playwright is selected

### Preflight and normal setup

Proactively establish provisioning and representative execution before dependent browser work; do not wait for the user to diagnose failures. Use the project's installed package/CLI and lockfile to identify the runner version and matching managed browser revisions. Record the execution host's OS/architecture and required modes. Do not install an unpinned runner or change versions merely to retry a download.

Set `PLAYWRIGHT_BROWSERS_PATH` to one absolute, dedicated directory for installation and every automation process, following the host's shell policy. The default per-user cache alone does not establish ownership. Inspect compatible contained assets before downloading again. For a Node project with the usual installed `playwright` dependency, the following commands use its local CLI; resolve the actual installed CLI if its layout differs:

```text
node node_modules/playwright/cli.js --version
node node_modules/playwright/cli.js install --dry-run chromium firefox
node node_modules/playwright/cli.js install --only-shell chromium firefox
```

Use the last command for default headless-shell coverage; omit `--only-shell` when full Chromium is required. Check options against the installed version. Name selected browsers explicitly; avoid an unqualified all-browser install. Firefox requires Playwright's managed patched build, not stock Firefox. Provision host dependencies only within the authorized setup scope.

### Chromium mode

Default to Playwright's **Chromium headless shell** for application execution, UI interaction, Canvas rendering and screenshots. A visible GUI is unnecessary for those capabilities. Use `browserName: 'chromium'`, `headless: true` and no `channel` or custom executable override:

```javascript
{ name: 'chromium', use: { browserName: 'chromium', headless: true } }
```

`channel: 'chromium'` selects full Chromium's headless mode; full Chromium and headed execution are separate choices. Require those modes only when project criteria need them, such as desktop-window behavior or a capability absent from the shell. If full Chromium fails a host-denied socket operation, test the default shell when it meets the accepted scope; retain explicitly required full/headed coverage as blocked until a compatible facility is available. Report the effective executable/mode from launch logs, not merely the project label or an executable-path API that may describe another mode.

For a documented branded-browser requirement, use a contained provisioning route. Do not use `playwright install chrome` or another global browser installer: `PLAYWRIGHT_BROWSERS_PATH` does not relocate branded Chrome/Edge installations.

### Download diagnostics and recovery

Diagnose each required browser independently; an installer stopping at Chromium says nothing about Firefox. Use the installed runner's dry-run URLs/revisions, a finite request deadline and bounded GET response sampling. Retain the command, sanitized requested/final URL and redirects, status, content type, received size and archive signature/error excerpt. Never log credentials or signed URL secrets. HEAD or HTTP success alone is insufficient; validate the complete downloaded archive before use.

| Observation | Next action |
| --- | --- |
| HTTP 200 with HTML, or HTTP 503 | Inspect the bounded body and proxy/gateway evidence; test the official fallbacks. Distinguish failure through this network path from an upstream-wide outage. |
| TLS error, timeout or interrupted transfer | Check configured proxy/CA, deadline and transfer evidence. Apply the supported correction; never disable certificate verification. Retry only with a transient-failure basis or changed condition. |
| Valid archive, failed extraction or missing binary | Check integrity, disk space, extraction path/permissions and runner revision before downloading again. |
| Installation lock | Establish the lock's owner and whether an installer remains active. Remove only an owned stale lock; never clear another process's lock or cache. |

If the normal route fails, proactively select a compatible contained installation, an official fallback/approved artifact mirror, a version-matched official container image, or an approved offline/remote environment. `PLAYWRIGHT_DOWNLOAD_HOST` and per-browser host variables support approved mirrors; they must expose the paths required by the installed runner. Do not guess mirrors, weaken TLS or evade network controls. A failed CDN does not establish that the official image registry is unavailable.

### Official image fallback

Use Microsoft's `mcr.microsoft.com/playwright:v<runner-version>-<supported-distribution>` image when compatible with the host and required architecture; replace placeholders from the actual runner and published image metadata. Prefer running the image through an available authorized container runtime. The image supplies browsers and OS dependencies; the matching project Playwright package is still required.

When a container runtime is unavailable, selective extraction of official image browser files is an eligible fallback:

1. Use a fresh owned temporary directory and check disk space. Request `https://mcr.microsoft.com/v2/playwright/manifests/<tag>` with Docker/OCI manifest and index Accept types. Resolve the required OS/architecture descriptor; fetch its manifest by digest rather than assuming the tag is a single-platform image.
2. Fetch the manifest's config and needed layer blobs through `/v2/playwright/blobs/<digest>`. Inspect config/history and archive entries to locate the browser paths, normally `/ms-playwright`. Do not assume the final layer contains them. Record the selected image/platform digest; verify manifest/config/layer SHA-256 and declared sizes before extraction. Keep TLS verification enabled.
3. Process relevant layers in order, honoring replacements and whiteout deletions. Extract only required managed-browser directories, including the selected Chromium shell/full build and required auxiliaries such as FFmpeg. Reject traversal, escaping links and device entries; preserve executable modes and safe internal links. Use a trusted OCI extractor if manual handling cannot establish these guarantees.
4. Point `PLAYWRIGHT_BROWSERS_PATH` at the extracted browser root, preserving managed directory names. Confirm required revisions against the installed runner. Extraction supplies no container isolation or OS dependencies: check host ABI/libraries separately, accounting for bundled library resolution, and use a compatible environment if necessary.
5. Run the execution checks below before retaining the installation. Record source/digests, extraction method, destination, versions and limitations. Do not commit binaries or bake this session's version/digest into general defaults.

### Firefox content-process recovery

Separate browser launch from context/page creation. When Firefox starts but page creation hangs or child processes crash with namespace/sandbox permission errors such as `/proc/self/uid_map: EPERM`, inspect browser logs and host dependencies first. For trusted local application tests in a dedicated execution environment, test this process-local override without changing host restrictions:

```javascript
const browser = await firefox.launch({
    headless: true,
    timeout: 10_000,
    env: { ...process.env, MOZ_DISABLE_CONTENT_SANDBOX: '1' },
});
```

The snippet assumes the project's imported `firefox` runner. In Playwright Test, apply the same `env` object under the Firefox project's `use.launchOptions`; gate it on the diagnosed execution environment, not every Firefox run. This disables Firefox's internal content-process sandbox and reduces browser isolation; it does not remove the host sandbox or make untrusted pages safe. Do not use it for arbitrary external content or when policy requires the internal sandbox. In those cases use an approved compatible execution environment.

Adopt the override only after repeated page/interaction/rendering/teardown checks succeed; retain its reason and scope, and re-evaluate it when the host changes. If it fails, remove the override and diagnose the actual logs rather than stacking sandbox-disable flags. Do not drop Firefox from required coverage or change host security settings as an implicit repair.

### Execution checks and evidence

Use finite launch/action/navigation timeouts **and a whole-process deadline covering page creation and cleanup**; launch timeout alone does not bound later operations. On expiry, stop only the owned process tree and confirm disposition before retrying.

For each required browser/mode, verify launch, context creation, page creation, interaction, required rendering/screenshots, at least two isolated context/page cycles, and teardown. Then execute the relevant target-application tests through its actual runner/server path. A synthetic page verifies environment capability, not application acceptance; headless input does not prove OS-window focus behavior. Capture effective versions/mode, settings, commands, outcomes and limits in existing task evidence.

Classify failures by download, integrity/extraction, revision, host dependency, launch, session/page, rendering or application stage. A successful download or launch cannot close later-stage evidence gaps. Do not repeat unchanged failures, re-download sound binaries for session errors, or retry rejected escalation. Report the precise missing capability and tested alternatives; continue independent work only where accepted task dependencies permit it.

Version-specific sources: [Playwright browsers](https://playwright.dev/docs/browsers), [official image/container guidance](https://playwright.dev/docs/docker), [CI setup](https://playwright.dev/docs/ci) and [Mozilla's documented content-sandbox override](https://firefox-source-docs.mozilla.org/performance/jit_profiling_with_samply.html).

## Verification and recovery

Select evidence required by the task; a successful installation or launch does not establish full application acceptance.

| Capability | Evidence |
| --- | --- |
| Provisioning | Compatible binary, trusted distribution and valid downloaded artifacts; a successful HTTP response alone is insufficient. Exercise fresh owned provisioning when reproducibility is required. |
| Sessions | The repeated context/page lifecycle and teardown used by the actual suite. |
| Visible output | Inspect screenshots or suitable pixel/shape/glyph assertions when rendering matters; DOM text does not prove font or Canvas rasterization. |
| Native events | Exercise actual focus, visibility or input delivery where required. Keep modeled handler checks separate from native evidence. |

On failure, retain the attempted command and observed error. Distinguish provisioning, version, host dependency, launch, session and rendering limitations; investigate supported remedies within the documented browser requirements and isolation rules. Record material substitutions and rerun affected checks after changes. Do not reduce required coverage or retry unchanged failures indefinitely.

Report verified behavior, omissions and environment limits separately. Interactive agent browsing does not prove the project's automated harness. Missing required evidence blocks the affected acceptance claim; unavailable optional checks do not invalidate independently verified behavior.
