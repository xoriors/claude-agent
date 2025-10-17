# HK Reservation Fetcher

A Node.js CLI tool to fetch reservations from HotelKey (HK) Datastream API with support for polling and resending queue messages.

## Features

- **Poll Mode**: Continuously poll ALL messages from the HK datastream queue
- **Resend Mode**: Request historical data for specific date ranges and statuses
- **Pagination**: Configurable batch sizes (1-10 messages per request)
- **JSON Output**: Structured JSON files with metadata
- **Acknowledgment**: Optional auto-acknowledgment of processed messages
- **Logging**: Comprehensive logging with Winston
- **Error Handling**: Retry logic and rate limiting protection

## Installation

```bash
cd hk-reservation-fetcher
npm install
```

## Configuration

### Option 1: Environment Variables (.env file)

Create a `.env` file in the project root:

```env
HK_API_URL=https://api.hotelkey.com
HK_APP_ID=your-app-id-here
HK_USERNAME=your-username
HK_PASSWORD=your-password
OUTPUT_DIR=./output
DEFAULT_PAGE_SIZE=10
```

### Option 2: Command Line Arguments

All configuration can be provided via command line arguments (see Usage section).

## Usage

### Poll Mode (Continuous Polling)

Poll all available messages from the queue:

```bash
npm start -- --method poll --app-id APP_ID --page-size 10
```

Poll with auto-acknowledgment:

```bash
npm start -- --method poll --app-id APP_ID --acknowledge
```

**Note**: Poll mode retrieves ALL messages from the queue without filtering. Use resend mode to filter by status and date range.

### Resend Mode (Historical Data)

Request historical data for a specific date range and status:

```bash
npm start -- --method resend \
  --app-id APP_ID \
  --status IN_HOUSE \
  --start-date 2025-10-12 \
  --end-date 2025-10-15
```

Request multiple statuses:

```bash
npm start -- --method resend \
  --app-id APP_ID \
  --status IN_HOUSE,DEPARTURE,ARRIVALS \
  --start-date 2025-10-01 \
  --end-date 2025-10-31
```

**Note**: The resend endpoint requires the "DATA STREAM RESEND" feature to be enabled in your HK account.

## Command Line Options

| Option | Alias | Type | Description | Default |
|--------|-------|------|-------------|---------|
| `--method` | `-m` | string | Fetch method: `poll` or `resend` | `poll` |
| `--app-id` | - | string | HK Application ID (required) | - |
| `--api-url` | - | string | HK API base URL (required) | - |
| `--username` | - | string | Basic auth username (required) | - |
| `--password` | - | string | Basic auth password (required) | - |
| `--status` | `-s` | string | Status filter(s) for **resend only**, comma-separated | - |
| `--start-date` | - | string | Start date (YYYY-MM-DD) for **resend only** | - |
| `--end-date` | - | string | End date (YYYY-MM-DD) for **resend only** | - |
| `--page-size` | `-p` | number | Messages per request (1-10) | `10` |
| `--output-dir` | `-o` | string | Output directory for JSON files | `./output` |
| `--acknowledge` | `--ack` | boolean | Auto-acknowledge messages | `false` |
| `--help` | `-h` | - | Show help | - |
| `--version` | `-v` | - | Show version | - |

## Valid Status Values

- `ARRIVALS` - Upcoming check-ins
- `IN_HOUSE` - Currently checked-in guests
- `DEPARTURE` - Upcoming check-outs
- `BOOKED` - Future reservations

## Output Format

### Reservation Files

Each batch creates a timestamped JSON file:

```
output/
├── reservations_20251015_143022_batch1.json
├── reservations_20251015_143023_batch2.json
└── summary_20251015_143025.json
```

Example reservation file structure:

```json
{
  "metadata": {
    "method": "poll",
    "fetchedAt": "2025-10-15T14:30:22.123Z",
    "count": 10,
    "batchNumber": 1
  },
  "reservations": [
    {
      "stream_id": "...",
      "event_type": "RESERVATION",
      "property_id": "...",
      "property_code": "CDFIN",
      "reservation": {
        "id": "...",
        "reservation_no": "...",
        "status": "CHECKED_IN",
        "guest_info": {...},
        ...
      }
    }
  ]
}
```

### Summary File

```json
{
  "method": "poll",
  "totalProcessed": 150,
  "totalBatches": 15,
  "duration": "45.32s",
  "completedAt": "2025-10-15T14:30:25.456Z"
}
```

## Logging

Logs are written to:
- **Console**: All log levels with color coding
- **combined.log**: All logs
- **error.log**: Error logs only

Set log level via environment variable:

```bash
LOG_LEVEL=debug npm start -- --method poll --app-id xxx
```

## How It Works

### Poll Mode

1. Requests messages from the queue in batches
2. Writes ALL reservations to JSON files (no filtering)
3. Optionally acknowledges processed messages
4. Continues until queue is empty (3 consecutive empty polls)

### Resend Mode

1. Generates date range from start-date to end-date
2. For each date and status combination:
   - Calls the resend API endpoint
   - API triggers messages to be added to the queue
3. After resend completes, use poll mode to retrieve the messages

**Workflow**: `resend` → wait → `poll`

## Error Handling

- **Rate Limiting**: Automatic retry with backoff
- **Authentication Errors**: Clear error messages
- **Network Errors**: Logged with full context
- **Invalid Configuration**: Validation before execution

## Troubleshooting

### "DATA STREAM RESEND IS NOT ENABLED"

The resend feature needs to be enabled in your HK account. Contact HK support or use poll mode instead.

### "Missing required configuration"

Ensure you provide all required parameters via CLI arguments or .env file:
- `HK_API_URL`
- `HK_APP_ID`
- `HK_USERNAME`
- `HK_PASSWORD`

### No messages returned

- Check if there are messages in the queue
- Ensure your app_id has access to the datastream
- For resend mode: verify your date range and status filters are correct

## Development

Run in watch mode:

```bash
npm run dev -- --method poll --app-id xxx
```

## Cleanup

Clean up generated files and dependencies:

```bash
# Remove everything (node_modules, output files, logs, package-lock.json)
npm run clean

# Remove only output files and logs (keep node_modules)
npm run clean:output
```

After running `npm run clean`, you'll need to reinstall dependencies:

```bash
npm install
```

## License

MIT
