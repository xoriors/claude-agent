const logger = require('../utils/logger');

class PollService {
  constructor(client, fileService, config) {
    this.client = client;
    this.fileService = fileService;
    this.config = config;
    this.totalProcessed = 0;
    this.totalBatches = 0;
  }

  /**
   * Process a batch of messages
   * @param {Array} messages - Raw messages from API
   * @returns {Object} Processed batch info
   */
  async processBatch(messages) {
    // Extract reservations (no filtering in poll mode)
    const reservations = messages.map(msg => msg.payload);

    // Write to file if we have reservations
    if (reservations.length > 0) {
      this.totalBatches++;
      await this.fileService.writeReservations(
        reservations,
        {
          method: 'poll'
        },
        this.totalBatches
      );
    }

    // Acknowledge messages if configured
    if (this.config.acknowledge) {
      await this.acknowledgeMessages(messages);
    }

    return {
      total: messages.length,
      processed: messages.length,
      receiptHandles: messages.map(m => m.receipt_handle)
    };
  }

  /**
   * Acknowledge processed messages
   * @param {Array} messages - Messages to acknowledge
   */
  async acknowledgeMessages(messages) {
    const handles = messages.map(m => m.receipt_handle);

    for (const handle of handles) {
      try {
        await this.client.acknowledgeMessage(handle);
      } catch (error) {
        logger.error(`Failed to acknowledge message: ${error.message}`);
        // Continue with other messages
      }
    }

    // Log acknowledged handles
    await this.fileService.logProcessedHandles(handles);
    logger.info(`Acknowledged ${handles.length} messages`);
  }

  /**
   * Poll all available messages
   * @returns {Promise<Object>} Summary of polling operation
   */
  async pollAll() {
    logger.info('Starting poll operation...');
    logger.info(`Configuration: ${JSON.stringify(this.config.toJSON(), null, 2)}`);

    const startTime = Date.now();
    let hasMore = true;
    let emptyPollCount = 0;
    const maxEmptyPolls = 3; // Stop after 3 consecutive empty polls

    while (hasMore) {
      try {
        logger.info(`Polling batch ${this.totalBatches + 1} (page size: ${this.config.pageSize})...`);

        const messages = await this.client.pollMessages(this.config.pageSize);

        if (messages.length === 0) {
          emptyPollCount++;
          logger.info(`Empty poll ${emptyPollCount}/${maxEmptyPolls}`);

          if (emptyPollCount >= maxEmptyPolls) {
            logger.info('No more messages available');
            hasMore = false;
          }
          continue;
        }

        // Reset empty poll counter when we get messages
        emptyPollCount = 0;

        const batchInfo = await this.processBatch(messages);
        this.totalProcessed += batchInfo.processed;

        logger.info(`Batch complete: ${batchInfo.processed} messages processed`);

        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        logger.error(`Error during polling: ${error.message}`);

        if (error.response?.status === 429) {
          logger.warn('Rate limited. Waiting 5 seconds...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        } else {
          throw error;
        }
      }
    }

    const duration = (Date.now() - startTime) / 1000;

    const summary = {
      method: 'poll',
      totalProcessed: this.totalProcessed,
      totalBatches: this.totalBatches,
      duration: `${duration.toFixed(2)}s`,
      completedAt: new Date().toISOString()
    };

    await this.fileService.writeSummary(summary);

    logger.info('Poll operation complete');
    logger.info(`Total processed: ${this.totalProcessed} reservations in ${this.totalBatches} batches`);
    logger.info(`Duration: ${duration.toFixed(2)}s`);

    return summary;
  }
}

module.exports = PollService;
