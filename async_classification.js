/**
 * Sends batch transactions to the backend for asynchronous classification
 * @param {Array} transactions - Array of transaction objects
 * @returns {Promise<string>} - Job ID for polling
 */
async function sendBatchForClassification(transactions) {
  try {
    const response = await fetch('/api/batch-classify-async', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to submit batch: ${response.status}`);
    }
    
    const { jobId } = await response.json();
    return jobId;
  } catch (error) {
    console.error('Error sending batch for classification:', error);
    throw error;
  }
}