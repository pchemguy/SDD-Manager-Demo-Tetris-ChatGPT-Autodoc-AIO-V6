# Leaderboard and portable files

Session top 10 lists completed games, including zero scores. It ranks score descending, then completion time ascending, then stable ID in ASCII order. Equal scores remain separate. Times are explicitly UTC. Restart keeps the list; leaving or reloading the page discards it. Abandoned games do not enter it. Saved settings persist independently.

## Save and Restore

The buttons sit below the leaderboard. Choose JSON or SQLite in Save format, then Save to download an immutable snapshot. Empty exports are valid. Save never clears results. Restore opens a picker for either format, detects content rather than trusting the extension or MIME type, and replaces the session list only after the entire file passes validation. Restored results become the session leaderboard. IDs, scores and UTC times are preserved exactly. No automatic permanent score storage occurs.

Play pauses during file operations; overlap and restart are disabled. Cancel file operation stops pending work without changing results. Canceling the picker also leaves results intact. Completion removes only the file pause, so an earlier user pause remains. Clear status reports errors and controls become available again. Save reports that a download was offered; the browser decides where to save it.

Selection has no deadline. Once Restore bytes are available, the whole codec operation, including SQLite initialization, has a 10,000 ms deadline. Save work is also bounded. Cancellation or timeout terminates owned worker processing and ignores late results. An unavailable SQLite runtime affects its operation; JSON, gameplay and the session list remain usable.

## Shared result rules

Both formats contain at most ten results with unique IDs. IDs contain 1–64 ASCII characters, start with a letter or digit and then allow letters, digits, dot, underscore, colon or hyphen. Scores are integers from 0 through 9007199254740991. Timestamps use real Gregorian dates, years 0001–9999, exactly three millisecond digits and UTC Z. Offsets, impossible dates, year zero and leap seconds reject. Unsorted valid imports receive the canonical rank without changing field values.

## JSON

The Download JSON Schema link supplies the exact canonical schema bundled with the application. A UTF-8 file has this structure:

```json
{
  "formatVersion": 1,
  "results": [
    {"id": "example-1", "score": 100, "timestamp": "2026-01-01T00:00:00.000Z"}
  ]
}
```

The root and records permit no extra fields. Validation uses the schema with strict calendar UTC support, without coercion, inserted defaults or property removal. Shared checks also reject duplicate IDs. Standard JSON duplicate-object-property parsing applies. Malformed UTF-8/JSON and files larger than 65,536 bytes reject.

## SQLite

Save creates a genuine SQLite 3 binary database with `PRAGMA user_version=1` and this table:

```sql
CREATE TABLE high_scores (
    id TEXT NOT NULL PRIMARY KEY,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 9007199254740991),
    timestamp TEXT NOT NULL
);
```

Restore requires that version, valid integrity, one ordinary `high_scores` table and the matching columns/types/NOT NULL/primary-key metadata. Generated/hidden columns, virtual tables, extra tables, views, triggers and extra indexes reject; SQLite's internal primary-key index is allowed. Equivalent ordinary schemas may be accepted without literal SQL text equality. Actual ID/timestamp values must have text storage class and score must have integer storage class; REAL `1.0` rejects even though its numeric value is integral. Every row still passes shared validation. Row order is not a ranking guarantee.

Files larger than 1,048,576 bytes reject before any read or initialization. A bounded header identifies format before the remaining bytes are read; oversized JSON rejects after that classification and before its body. All admitted bytes are read at most once. SQLite import uses a disposable worker/database with read protections; the application never executes imported SQL text. SQL text dumps are not supported SQLite files.

On every validation/read/runtime error, the existing list remains unchanged in value and order. A valid JSON file with a `.sqlite` extension, or a valid SQLite file with a `.json` extension, can restore because content controls the decoder. Saving and restoring are always manual.
