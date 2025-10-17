const { format, eachDayOfInterval, parseISO, isValid } = require('date-fns');

/**
 * Generate an array of dates between start and end (inclusive)
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Array<string>} Array of dates in YYYY-MM-DD format
 */
function generateDateRange(startDate, endDate) {
  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    if (!isValid(start) || !isValid(end)) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }

    if (start > end) {
      throw new Error('Start date must be before or equal to end date');
    }

    const dates = eachDayOfInterval({ start, end });
    return dates.map(date => format(date, 'yyyy-MM-dd'));
  } catch (error) {
    throw new Error(`Date range generation failed: ${error.message}`);
  }
}

/**
 * Validate date format (YYYY-MM-DD)
 * @param {string} dateStr - Date string to validate
 * @returns {boolean} True if valid
 */
function isValidDateFormat(dateStr) {
  if (!dateStr) return false;

  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;

  const date = parseISO(dateStr);
  return isValid(date);
}

/**
 * Get current timestamp for file naming
 * @returns {string} Formatted timestamp
 */
function getTimestamp() {
  return format(new Date(), 'yyyyMMdd_HHmmss');
}

module.exports = {
  generateDateRange,
  isValidDateFormat,
  getTimestamp
};
