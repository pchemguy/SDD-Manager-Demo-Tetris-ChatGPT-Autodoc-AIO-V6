# Leaderboard and JSON files

Session top 10 lists completed games, including zero scores. It ranks score descending, then completion time ascending, then stable ID in ASCII order. Equal scores remain separate. Times are explicitly UTC. Restart keeps the list; leaving or reloading the page discards it. Abandoned games do not enter it. Saved settings persist independently.

## Save and Restore

Save and Restore sit below the leaderboard. This release offers JSON. Save downloads an immutable snapshot, including an empty list, without clearing results. Restore opens a file picker and replaces the session list after the entire file passes validation. It accepts valid JSON by content even if its filename has another extension. Restored records become the session leaderboard. No automatic permanent score storage occurs.

Play pauses during a file operation; overlapping operations and restart are disabled. Cancel file operation stops pending work without changing results. Canceling the picker leaves the list intact. Completion removes only the file pause, so an earlier user pause remains. A clear status reports errors and the controls become available again. Save reports that a download was offered; the browser decides where to save it.

JSON codec work has a 10,000 ms deadline after bytes arrive. Selection has no deadline. Files larger than 65,536 bytes are rejected before reading/decoding. UTF-8 must be well formed. Restore validates the canonical schema and all records before replacement; malformed files leave prior values and ordering unchanged.

## Portable format

The Download JSON Schema link supplies the exact versioned schema bundled with this release. A file has this structure:

```json
{
  "formatVersion": 1,
  "results": [
    {"id": "example-1", "score": 100, "timestamp": "2026-01-01T00:00:00.000Z"}
  ]
}
```

The root and records permit no extra fields. There are at most ten results with unique IDs. IDs contain 1–64 ASCII characters, start with a letter or digit and then allow letters, digits, dot, underscore, colon or hyphen. Scores are integers from 0 through 9007199254740991. Timestamps use real Gregorian dates, years 0001–9999, exactly three millisecond digits and UTC Z; offsets, impossible dates and leap seconds reject. Values are preserved exactly. Unsorted valid input is ranked when restored.

Schema validation performs no coercion, inserted defaults or property removal. Shared validation additionally rejects duplicate IDs. Standard JSON duplicate-object-property parsing applies. SQLite portability is scheduled for the next increment; this release does not advertise SQLite support.
