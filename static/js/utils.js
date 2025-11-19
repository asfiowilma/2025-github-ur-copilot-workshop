/**
 * Utility Functions
 * Helper functions for time formatting and calculations
 */

/**
 * Formats seconds into MM:SS format
 * @param {number} seconds - Number of seconds
 * @returns {string} Formatted time string (MM:SS)
 */
function formatTimeDisplay(seconds) {
    if (seconds < 0) seconds = 0;
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    const minutesStr = String(minutes).padStart(2, '0');
    const secondsStr = String(remainingSeconds).padStart(2, '0');
    
    return `${minutesStr}:${secondsStr}`;
}

/**
 * Calculates remaining time based on start time and duration
 * @param {number} startTime - Start timestamp in milliseconds
 * @param {number} duration - Duration in seconds
 * @returns {number} Remaining time in seconds
 */
function calculateRemainingTime(startTime, duration) {
    const now = Date.now();
    const elapsedMs = now - startTime;
    const elapsedSeconds = Math.floor(elapsedMs / 1000);
    const remaining = duration - elapsedSeconds;
    
    return Math.max(0, remaining);
}

/**
 * Gets current timestamp in ISO 8601 format
 * @returns {string} ISO 8601 timestamp
 */
function getCurrentTimestamp() {
    return new Date().toISOString();
}

/**
 * Converts minutes to seconds
 * @param {number} minutes - Number of minutes
 * @returns {number} Number of seconds
 */
function minutesToSeconds(minutes) {
    return minutes * 60;
}

/**
 * Converts seconds to minutes (rounded)
 * @param {number} seconds - Number of seconds
 * @returns {number} Number of minutes
 */
function secondsToMinutes(seconds) {
    return Math.round(seconds / 60);
}

/**
 * Plays a beep sound
 */
function playBeep() {
    // Create an audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

/**
 * Requests notification permission from the browser
 * @returns {Promise<string>} Permission status
 */
async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return 'denied';
    }
    
    if (Notification.permission === 'granted') {
        return 'granted';
    }
    
    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission;
    }
    
    return Notification.permission;
}

/**
 * Shows a browser notification
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {string} icon - Notification icon URL (optional)
 */
function showNotification(title, body, icon = null) {
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return;
    }
    
    if (Notification.permission === 'granted') {
        const options = {
            body: body,
            icon: icon,
            badge: icon,
            tag: 'pomodoro-timer',
            requireInteraction: false
        };
        
        new Notification(title, options);
    }
}
