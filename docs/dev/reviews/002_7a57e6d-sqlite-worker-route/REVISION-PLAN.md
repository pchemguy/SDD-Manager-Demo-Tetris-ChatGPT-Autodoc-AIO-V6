# SQLite development worker route correction

## Scope and provenance

Campaign 002_7a57e6d-sqlite-worker-route starts at 7a57e6d3a1f94539559b096a5fcaa92cd6308ed0 (published v1.0.1). Creation parent and integration target: main. Working branch: revision/002_7a57e6d-sqlite-worker-route. The user reports the error remains at this exact commit on Windows. Issue 67 stays open. The prior campaign's cold-cache reload fix is independently verified but did not resolve the user's reported failure; its closed records remain unchanged.

The user subsequently confirmed that v1.0.0 works without symlinks/junctions. Offered the choice of retaining unsupported linked launches or finishing the narrow development-worker workaround, the user explicitly selected **Finish workaround**. Deliver only this confirmed worker route correction; do not claim general Vite symlink/junction support or a SQLite codec defect.

## Evidence and action A-001

The browser rejects `/@fs/G:/Downloads/GH/SDD-Manager-Demo-Tetris-ChatGPT-Autodoc-AIO-V6/src/leaderboard/sqlite.worker.ts?worker_file&type=module` because it returns HTML. The page is `http://127.0.0.1:5173/?next=on&hold=on`. The same server's `/src/leaderboard/sqlite.worker.ts?worker_file&type=module` returns HTTP 200, `Content-Type: text/javascript`, compiled JavaScript, Vite's worker environment import and correctly rooted `/src/leaderboard/...` and `/node_modules/...` imports. These user-supplied HTTP diagnostics establish a transport-route failure before SQLite initialization. The underlying drive alias/casing mechanism is not established.

Add a regression with a real copied project whose leaderboard directory links to the original trusted source. Model the observed filesystem-worker entry response as HTML while retaining the real project-relative worker transformation, dependencies, WASM, database and browser. Observe first Save/Restore failures before the fix. During development, construct the worker from Vite's base-prefixed project-relative source route and worker transform query. Retain the existing statically bundled production worker. Verify ordinary and linked layouts, first Save and Restore, no reload, exact data, lazy WASM and cleanup in Chromium/Firefox, plus unit and packaged acceptance. Use Windows CMD/Linux Bash CI. Integrate and publish patch 1.0.2 after verification, retaining accurate limits and the already published 1.0.1 outcome. Stop after this correction.
