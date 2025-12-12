/**
 * Generic polling function (legacy - kept for backward compatibility)
 * @param {Function} fn - Function to call for checking condition
 * @param {number} timeout - Timeout in milliseconds
 * @param {number} interval - Polling interval in milliseconds
 * @returns {Promise} - Resolves when condition is met
 */
function poll(fn, timeout, interval) {
    var endTime = Number(new Date()) + (timeout || 2000);
    interval = interval || 100;
  
    var checkCondition = function(resolve, reject) {
      var result = fn();
      if (result) {
        resolve(result);
      } else if (Number(new Date()) < endTime) {
        setTimeout(checkCondition, interval, resolve, reject);
      } else {
        reject(new Error('timed out for ' + fn + ': ' + arguments));
      }
    };
  
    return new Promise(checkCondition);
}

/**
 * Polls job status endpoint until completion, failure, or timeout
 * @param {string} jobId - The job ID to poll for
 * @param {number} timeout - Timeout in milliseconds (default: 60000)
 * @param {number} interval - Polling interval in milliseconds (default: 2000)
 * @returns {Promise<Object>} - { success: boolean, data?: any, error?: string }
 */
async function pollJobStatus(jobId, timeout = 60000, interval = 2000) {
  const endTime = Date.now() + timeout;
  
  while (Date.now() < endTime) {
    try {
      const response = await fetch(`/api/batch-jobs/${jobId}`);
      
      if (!response.ok) {
        throw new Error(`Polling request failed with status ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status === 'completed') {
        return { success: true, data: result.transactions };
      }
      
      if (result.status === 'failed') {
        return { success: false, error: result.message || 'Classification failed' };
      }
      
      // Still processing, wait and retry
      console.log(`Job ${jobId} status: ${result.status}, polling again in ${interval}ms`);
      await new Promise(resolve => setTimeout(resolve, interval));
      
    } catch (error) {
      console.error('Error polling job status:', error);
      throw error;
    }
  }
  
  throw new Error('Polling timeout: Job did not complete within the specified time');
}