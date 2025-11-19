/**
 * API Client
 * Handles communication with the Flask backend
 */

/**
 * Logs a session event to the backend
 * @param {object} sessionData - Session data to log
 * @returns {Promise<object>} Response from the server
 */
async function logSession(sessionData) {
    try {
        const response = await fetch('/log-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sessionData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to log session');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error logging session:', error);
        throw error;
    }
}

/**
 * Retrieves session history from the backend
 * @returns {Promise<object>} History data from the server
 */
async function getHistory() {
    try {
        const response = await fetch('/history', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to retrieve history');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error retrieving history:', error);
        throw error;
    }
}

/**
 * Logs a completed session
 * @param {string} sessionType - Type of session (WORK, SHORT_BREAK, LONG_BREAK)
 * @param {number} duration - Duration in seconds
 * @returns {Promise<object>} Response from the server
 */
async function logCompletedSession(sessionType, duration) {
    const sessionData = {
        timestamp: getCurrentTimestamp(),
        session_type: sessionType,
        status: SESSION_STATUS.COMPLETED,
        duration: formatTimeDisplay(duration)
    };
    
    return await logSession(sessionData);
}

/**
 * Logs a skipped session
 * @param {string} sessionType - Type of session (WORK, SHORT_BREAK, LONG_BREAK)
 * @param {number} elapsedTime - Time elapsed before skip in seconds
 * @returns {Promise<object>} Response from the server
 */
async function logSkippedSession(sessionType, elapsedTime) {
    const sessionData = {
        timestamp: getCurrentTimestamp(),
        session_type: sessionType,
        status: SESSION_STATUS.SKIPPED,
        duration: formatTimeDisplay(elapsedTime)
    };
    
    return await logSession(sessionData);
}

/**
 * Logs a reset session
 * @param {string} sessionType - Type of session (WORK, SHORT_BREAK, LONG_BREAK)
 * @param {number} elapsedTime - Time elapsed before reset in seconds
 * @returns {Promise<object>} Response from the server
 */
async function logResetSession(sessionType, elapsedTime) {
    const sessionData = {
        timestamp: getCurrentTimestamp(),
        session_type: sessionType,
        status: SESSION_STATUS.RESET,
        duration: formatTimeDisplay(elapsedTime)
    };
    
    return await logSession(sessionData);
}
