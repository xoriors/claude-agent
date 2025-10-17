const logger = require('../utils/logger');
const { generateDateRange } = require('../utils/dateUtils');

class ResendService {
  constructor(client, fileService, config) {
    this.client = client;
    this.fileService = fileService;
    this.config = config;
    this.totalProcessed = 0;
    this.totalBatches = 0;
  }

  /**
   * Process resend for a specific date and status
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} status - Status filter
   * @returns {Promise<Object>} Processing result
   */
  async processDateStatus(date, status) {
    try {
      logger.info(`Requesting resend for date: ${date}, status: ${status}`);

      const response = await this.client.resendQueueMessages(date, status);

      // The resend endpoint triggers messages to be added to the queue
      // We would need to poll them separately, or handle the response if it returns data directly
      // Based on the API spec, it seems to return a success status

      logger.info(`Resend request successful for ${date} - ${status}`);

      return {
        date,
        status,
        success: true,
        response
      };

    } catch (error) {
      logger.error(`Resend failed for ${date} - ${status}: ${error.message}`);
      return {
        date,
        status,
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Execute resend operation for date range and statuses
   * @returns {Promise<Object>} Summary of resend operation
   */
  async executeResend() {
    logger.info('Starting resend operation...');
    logger.info(`Configuration: ${JSON.stringify(this.config.toJSON(), null, 2)}`);

    const startTime = Date.now();
    const results = [];

    try {
      // Generate date range
      const dates = generateDateRange(this.config.startDate, this.config.endDate);
      logger.info(`Processing ${dates.length} dates with ${this.config.statuses.length} statuses each`);

      // Iterate through each date and status combination
      for (const date of dates) {
        for (const status of this.config.statuses) {
          const result = await this.processDateStatus(date, status);
          results.push(result);

          if (result.success) {
            this.totalProcessed++;
          }

          // Small delay to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      const duration = (Date.now() - startTime) / 1000;

      // Generate summary
      const summary = {
        method: 'resend',
        dateRange: {
          start: this.config.startDate,
          end: this.config.endDate,
          totalDays: dates.length
        },
        statuses: this.config.statuses,
        totalRequests: results.length,
        successfulRequests: results.filter(r => r.success).length,
        failedRequests: results.filter(r => !r.success).length,
        duration: `${duration.toFixed(2)}s`,
        results: results,
        completedAt: new Date().toISOString(),
        note: 'Resend requests trigger messages to be added to the queue. Use poll method to retrieve them.'
      };

      await this.fileService.writeSummary(summary);

      logger.info('Resend operation complete');
      logger.info(`Total successful requests: ${summary.successfulRequests}/${summary.totalRequests}`);
      logger.info(`Duration: ${duration.toFixed(2)}s`);

      if (summary.failedRequests > 0) {
        logger.warn(`${summary.failedRequests} requests failed. Check summary file for details.`);
      }

      return summary;

    } catch (error) {
      logger.error(`Resend operation failed: ${error.message}`);
      throw error;
    }
  }
}

module.exports = ResendService;
