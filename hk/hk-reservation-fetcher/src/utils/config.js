require('dotenv').config();

class Config {
  constructor(cliArgs = {}) {
    // API Configuration
    this.apiUrl = cliArgs.apiUrl || process.env.HK_API_URL;
    this.appId = cliArgs.appId || process.env.HK_APP_ID;
    this.username = cliArgs.username || process.env.HK_USERNAME;
    this.password = cliArgs.password || process.env.HK_PASSWORD;

    // Operation Configuration
    this.method = cliArgs.method || process.env.DEFAULT_METHOD || 'poll';
    this.pageSize = parseInt(cliArgs.pageSize || process.env.DEFAULT_PAGE_SIZE || '10');
    this.statuses = this.parseStatuses(cliArgs.status);
    this.startDate = cliArgs.startDate;
    this.endDate = cliArgs.endDate;
    this.outputDir = cliArgs.outputDir || process.env.OUTPUT_DIR || './output';
    this.acknowledge = cliArgs.acknowledge || false;

    // Validate required fields
    this.validate();
  }

  parseStatuses(statusInput) {
    if (!statusInput) return [];

    const validStatuses = ['ARRIVALS', 'IN_HOUSE', 'DEPARTURE', 'BOOKED'];
    let statuses = [];

    if (Array.isArray(statusInput)) {
      statuses = statusInput;
    } else if (typeof statusInput === 'string') {
      statuses = statusInput.split(',').map(s => s.trim().toUpperCase());
    }

    // Validate statuses
    const invalidStatuses = statuses.filter(s => !validStatuses.includes(s));
    if (invalidStatuses.length > 0) {
      throw new Error(`Invalid status values: ${invalidStatuses.join(', ')}. Valid values are: ${validStatuses.join(', ')}`);
    }

    return statuses;
  }

  validate() {
    const required = ['apiUrl', 'appId', 'username', 'password'];
    const missing = required.filter(field => !this[field]);

    if (missing.length > 0) {
      throw new Error(`Missing required configuration: ${missing.join(', ')}. Please provide via CLI arguments or .env file.`);
    }

    // Validate method
    if (!['poll', 'resend'].includes(this.method)) {
      throw new Error('Method must be either "poll" or "resend"');
    }

    // Validate page size
    if (this.pageSize < 1 || this.pageSize > 10) {
      throw new Error('Page size must be between 1 and 10');
    }

    // Validate date requirements for resend method
    if (this.method === 'resend') {
      if (!this.startDate || !this.endDate) {
        throw new Error('Resend method requires --start-date and --end-date parameters');
      }
      if (this.statuses.length === 0) {
        throw new Error('Resend method requires at least one --status parameter');
      }
    }
  }

  toJSON() {
    return {
      apiUrl: this.apiUrl,
      appId: this.appId,
      method: this.method,
      pageSize: this.pageSize,
      statuses: this.statuses,
      startDate: this.startDate,
      endDate: this.endDate,
      outputDir: this.outputDir,
      acknowledge: this.acknowledge
    };
  }
}

module.exports = Config;
