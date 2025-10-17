#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const Config = require('./utils/config');
const logger = require('./utils/logger');
const HKClient = require('./client/hkClient');
const FileService = require('./services/fileService');
const PollService = require('./services/pollService');
const ResendService = require('./services/resendService');

// CLI argument parsing
const argv = yargs(hideBin(process.argv))
  .option('method', {
    alias: 'm',
    type: 'string',
    description: 'Fetch method: poll or resend',
    choices: ['poll', 'resend'],
    default: 'poll'
  })
  .option('app-id', {
    type: 'string',
    description: 'HK Application ID (can also use HK_APP_ID env var)'
  })
  .option('api-url', {
    type: 'string',
    description: 'HK API base URL (can also use HK_API_URL env var)'
  })
  .option('username', {
    type: 'string',
    description: 'Basic auth username (can also use HK_USERNAME env var)'
  })
  .option('password', {
    type: 'string',
    description: 'Basic auth password (can also use HK_PASSWORD env var)'
  })
  .option('status', {
    alias: 's',
    type: 'string',
    description: 'Status filter(s) for resend method: ARRIVALS, IN_HOUSE, DEPARTURE, BOOKED (comma-separated for multiple)',
    coerce: (arg) => {
      if (!arg) return [];
      return arg.split(',').map(s => s.trim().toUpperCase());
    }
  })
  .option('start-date', {
    type: 'string',
    description: 'Start date (YYYY-MM-DD) - required for resend method only',
    coerce: (arg) => {
      if (arg && !/^\d{4}-\d{2}-\d{2}$/.test(arg)) {
        throw new Error('start-date must be in YYYY-MM-DD format');
      }
      return arg;
    }
  })
  .option('end-date', {
    type: 'string',
    description: 'End date (YYYY-MM-DD) - required for resend method only',
    coerce: (arg) => {
      if (arg && !/^\d{4}-\d{2}-\d{2}$/.test(arg)) {
        throw new Error('end-date must be in YYYY-MM-DD format');
      }
      return arg;
    }
  })
  .option('page-size', {
    alias: 'p',
    type: 'number',
    description: 'Number of messages per request (1-10)',
    default: 10
  })
  .option('output-dir', {
    alias: 'o',
    type: 'string',
    description: 'Output directory for JSON files',
    default: './output'
  })
  .option('acknowledge', {
    alias: 'ack',
    type: 'boolean',
    description: 'Automatically acknowledge processed messages',
    default: false
  })
  .example([
    ['$0 --method poll --app-id xxx --page-size 10', 'Poll all messages from queue'],
    ['$0 --method poll --app-id xxx --acknowledge', 'Poll and auto-acknowledge messages'],
    ['$0 --method resend --app-id xxx --status IN_HOUSE --start-date 2025-10-12 --end-date 2025-10-15', 'Resend for specific date range and status']
  ])
  .help()
  .alias('help', 'h')
  .version()
  .alias('version', 'v')
  .argv;

/**
 * Main execution function
 */
async function main() {
  try {
    // Initialize configuration
    logger.info('=== HK Reservation Fetcher ===');
    const config = new Config(argv);

    // Initialize services
    const client = new HKClient({
      apiUrl: config.apiUrl,
      appId: config.appId,
      username: config.username,
      password: config.password
    });

    const fileService = new FileService(config.outputDir);

    // Execute based on method
    let summary;

    if (config.method === 'poll') {
      const pollService = new PollService(client, fileService, config);
      summary = await pollService.pollAll();
    } else if (config.method === 'resend') {
      const resendService = new ResendService(client, fileService, config);
      summary = await resendService.executeResend();
    }

    // Display summary
    logger.info('=== Operation Summary ===');
    logger.info(JSON.stringify(summary, null, 2));
    logger.info(`Output directory: ${config.outputDir}`);

    process.exit(0);

  } catch (error) {
    logger.error('Fatal error:', error);

    if (error.message.includes('Missing required configuration')) {
      logger.error('\nPlease provide required configuration via:');
      logger.error('  1. Command line arguments (--app-id, --api-url, etc.)');
      logger.error('  2. Environment variables (HK_APP_ID, HK_API_URL, etc.)');
      logger.error('  3. .env file in the project root');
      logger.error('\nRun with --help for more information');
    }

    process.exit(1);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

// Run main function
main();
