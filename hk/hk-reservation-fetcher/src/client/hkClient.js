const axios = require('axios');
const logger = require('../utils/logger');

class HKClient {
  constructor(config) {
    this.baseURL = config.apiUrl;
    this.appId = config.appId;
    this.username = config.username;
    this.password = config.password;

    this.client = axios.create({
      baseURL: this.baseURL,
      auth: {
        username: this.username,
        password: this.password
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`API Response: ${response.config.method.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
        return response;
      },
      (error) => {
        if (error.response) {
          logger.error(`API Error: ${error.response.status} - ${error.response.statusText}`, {
            url: error.config.url,
            data: error.response.data
          });
        } else {
          logger.error(`API Error: ${error.message}`);
        }
        throw error;
      }
    );
  }

  /**
   * Poll messages from the HK datastream
   * @param {number} numOfMessages - Number of messages to poll (1-10)
   * @returns {Promise<Array>} Array of messages with receipt_handle and payload
   */
  async pollMessages(numOfMessages = 10) {
    try {
      const response = await this.client.get(
        `/thirdparty/hotelbrand/stream/${this.appId}/poll`,
        {
          params: {
            num_of_messages: Math.min(Math.max(numOfMessages, 1), 10).toString()
          }
        }
      );

      const messages = response.data?.result || [];
      logger.info(`Polled ${messages.length} messages`);
      return messages;
    } catch (error) {
      if (error.response?.status === 404 || error.response?.data?.result?.length === 0) {
        logger.info('No more messages in queue');
        return [];
      }
      throw error;
    }
  }

  /**
   * Resend queue messages for a specific date and status
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} status - Status filter (ARRIVALS, IN_HOUSE, DEPARTURE, BOOKED)
   * @returns {Promise<Object>} Response data
   */
  async resendQueueMessages(date, status) {
    try {
      const response = await this.client.get(
        `/thirdparty/hotelbrand/stream/${this.appId}/resend`,
        {
          params: {
            date: date,
            status: status
          }
        }
      );

      logger.info(`Resend request successful for date: ${date}, status: ${status}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 403) {
        throw new Error('DATA STREAM RESEND IS NOT ENABLED. Please enable this feature in your HK account.');
      }
      throw error;
    }
  }

  /**
   * Acknowledge a message
   * @param {string} receiptHandle - Receipt handle from polled message
   * @returns {Promise<Object>} Acknowledgment response
   */
  async acknowledgeMessage(receiptHandle) {
    try {
      const response = await this.client.post(
        `/thirdparty/hotelbrand/stream/${this.appId}/ack`,
        {
          receipt_handle: receiptHandle
        }
      );

      logger.debug(`Message acknowledged: ${receiptHandle.substring(0, 20)}...`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to acknowledge message: ${receiptHandle.substring(0, 20)}...`);
      throw error;
    }
  }
}

module.exports = HKClient;
