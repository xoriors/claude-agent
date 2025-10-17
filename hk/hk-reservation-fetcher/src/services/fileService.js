const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');
const { getTimestamp } = require('../utils/dateUtils');

class FileService {
  constructor(outputDir) {
    this.outputDir = outputDir;
  }

  /**
   * Ensure output directory exists
   */
  async ensureOutputDir() {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
      logger.debug(`Output directory ensured: ${this.outputDir}`);
    } catch (error) {
      logger.error(`Failed to create output directory: ${error.message}`);
      throw error;
    }
  }

  /**
   * Write reservations to a JSON file
   * @param {Array} reservations - Array of reservation data
   * @param {Object} metadata - Metadata about the fetch operation
   * @param {number} batchNumber - Batch number for file naming
   * @returns {Promise<string>} Path to the created file
   */
  async writeReservations(reservations, metadata, batchNumber) {
    await this.ensureOutputDir();

    const timestamp = getTimestamp();
    const filename = `reservations_${timestamp}_batch${batchNumber}.json`;
    const filepath = path.join(this.outputDir, filename);

    const output = {
      metadata: {
        ...metadata,
        fetchedAt: new Date().toISOString(),
        count: reservations.length,
        batchNumber
      },
      reservations
    };

    try {
      await fs.writeFile(filepath, JSON.stringify(output, null, 2), 'utf8');
      logger.info(`Written ${reservations.length} reservations to ${filename}`);
      return filepath;
    } catch (error) {
      logger.error(`Failed to write file ${filename}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Write a summary file with overall statistics
   * @param {Object} summary - Summary data
   */
  async writeSummary(summary) {
    await this.ensureOutputDir();

    const timestamp = getTimestamp();
    const filename = `summary_${timestamp}.json`;
    const filepath = path.join(this.outputDir, filename);

    try {
      await fs.writeFile(filepath, JSON.stringify(summary, null, 2), 'utf8');
      logger.info(`Written summary to ${filename}`);
      return filepath;
    } catch (error) {
      logger.error(`Failed to write summary: ${error.message}`);
      throw error;
    }
  }

  /**
   * Append to a log file for tracking processed receipt handles
   * @param {Array} receiptHandles - Array of receipt handles
   */
  async logProcessedHandles(receiptHandles) {
    await this.ensureOutputDir();

    const filepath = path.join(this.outputDir, 'processed_handles.log');
    const content = receiptHandles.map(handle =>
      `${new Date().toISOString()} - ${handle}\n`
    ).join('');

    try {
      await fs.appendFile(filepath, content, 'utf8');
      logger.debug(`Logged ${receiptHandles.length} processed handles`);
    } catch (error) {
      logger.error(`Failed to log processed handles: ${error.message}`);
      // Don't throw - this is non-critical
    }
  }
}

module.exports = FileService;
