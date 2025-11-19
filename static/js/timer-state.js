/**
 * Timer State Management Module
 * Handles session state, transitions, and Pomodoro logic
 */

// Session Type Constants
const SESSION_TYPES = {
    WORK: 'WORK',
    SHORT_BREAK: 'SHORT_BREAK',
    LONG_BREAK: 'LONG_BREAK'
};

// Session Status Constants
const SESSION_STATUS = {
    COMPLETED: 'COMPLETED',
    SKIPPED: 'SKIPPED',
    RESET: 'RESET'
};

// Default Durations (in seconds)
const DEFAULT_DURATIONS = {
    WORK_DURATION: 25 * 60,
    SHORT_BREAK_DURATION: 5 * 60,
    LONG_BREAK_DURATION: 20 * 60,
    SESSIONS_UNTIL_LONG_BREAK: 4
};

/**
 * TimerState class manages the state of the Pomodoro timer
 */
class TimerState {
    constructor(settings = {}) {
        this.currentSession = SESSION_TYPES.WORK;
        this.sessionCount = 0;
        this.timeRemaining = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.startTime = null;
        
        // Load settings or use defaults
        this.settings = {
            workDuration: settings.workDuration || DEFAULT_DURATIONS.WORK_DURATION,
            shortBreakDuration: settings.shortBreakDuration || DEFAULT_DURATIONS.SHORT_BREAK_DURATION,
            longBreakDuration: settings.longBreakDuration || DEFAULT_DURATIONS.LONG_BREAK_DURATION,
            sessionsUntilLongBreak: settings.sessionsUntilLongBreak || DEFAULT_DURATIONS.SESSIONS_UNTIL_LONG_BREAK
        };
        
        // Initialize with work duration
        this.timeRemaining = this.settings.workDuration;
    }
    
    /**
     * Starts the timer
     */
    start() {
        this.isRunning = true;
        this.isPaused = false;
        if (!this.startTime) {
            this.startTime = Date.now();
        }
    }
    
    /**
     * Pauses the timer
     */
    pause() {
        this.isPaused = true;
        this.isRunning = false;
    }
    
    /**
     * Resets the timer to the current session's initial duration
     */
    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.startTime = null;
        this.timeRemaining = getDurationForSession(this.currentSession, this.settings);
    }
    
    /**
     * Transitions to the next session
     */
    nextSession() {
        const nextSessionType = determineNextSession(this.sessionCount, this.currentSession, this.settings);
        
        // Increment session count if completing a work session
        if (this.currentSession === SESSION_TYPES.WORK) {
            this.sessionCount++;
        }
        
        this.currentSession = nextSessionType;
        this.timeRemaining = getDurationForSession(nextSessionType, this.settings);
        this.isRunning = false;
        this.isPaused = false;
        this.startTime = null;
    }
    
    /**
     * Skips the current session and moves to the next
     */
    skip() {
        this.nextSession();
    }
    
    /**
     * Decrements time remaining by one second
     */
    tick() {
        if (this.isRunning && this.timeRemaining > 0) {
            this.timeRemaining--;
            return true;
        }
        return false;
    }
    
    /**
     * Checks if the session is complete
     */
    isComplete() {
        return this.timeRemaining <= 0;
    }
    
    /**
     * Updates settings and adjusts current timer if needed
     */
    updateSettings(newSettings) {
        this.settings = {
            workDuration: newSettings.workDuration || this.settings.workDuration,
            shortBreakDuration: newSettings.shortBreakDuration || this.settings.shortBreakDuration,
            longBreakDuration: newSettings.longBreakDuration || this.settings.longBreakDuration,
            sessionsUntilLongBreak: newSettings.sessionsUntilLongBreak || this.settings.sessionsUntilLongBreak
        };
        
        // Reset to new duration if timer is not running
        if (!this.isRunning) {
            this.timeRemaining = getDurationForSession(this.currentSession, this.settings);
        }
    }
}

/**
 * Pure Functions for Session Logic
 */

/**
 * Determines the next session type based on current state
 * @param {number} sessionCount - Number of completed work sessions
 * @param {string} currentSession - Current session type
 * @param {object} settings - Timer settings
 * @returns {string} Next session type
 */
function determineNextSession(sessionCount, currentSession, settings) {
    if (currentSession === SESSION_TYPES.WORK) {
        // After work session, check if long break is due
        if (shouldTakeLongBreak(sessionCount + 1, settings)) {
            return SESSION_TYPES.LONG_BREAK;
        } else {
            return SESSION_TYPES.SHORT_BREAK;
        }
    } else {
        // After any break, return to work
        return SESSION_TYPES.WORK;
    }
}

/**
 * Checks if a long break is due based on session count
 * @param {number} sessionCount - Number of completed work sessions
 * @param {object} settings - Timer settings
 * @returns {boolean} True if long break is due
 */
function shouldTakeLongBreak(sessionCount, settings) {
    const sessionsUntilLongBreak = settings.sessionsUntilLongBreak || DEFAULT_DURATIONS.SESSIONS_UNTIL_LONG_BREAK;
    return sessionCount > 0 && sessionCount % sessionsUntilLongBreak === 0;
}

/**
 * Gets the duration for a specific session type
 * @param {string} sessionType - Type of session
 * @param {object} settings - Timer settings
 * @returns {number} Duration in seconds
 */
function getDurationForSession(sessionType, settings) {
    switch (sessionType) {
        case SESSION_TYPES.WORK:
            return settings.workDuration || DEFAULT_DURATIONS.WORK_DURATION;
        case SESSION_TYPES.SHORT_BREAK:
            return settings.shortBreakDuration || DEFAULT_DURATIONS.SHORT_BREAK_DURATION;
        case SESSION_TYPES.LONG_BREAK:
            return settings.longBreakDuration || DEFAULT_DURATIONS.LONG_BREAK_DURATION;
        default:
            return DEFAULT_DURATIONS.WORK_DURATION;
    }
}

/**
 * Gets a human-readable name for a session type
 * @param {string} sessionType - Type of session
 * @returns {string} Human-readable session name
 */
function getSessionDisplayName(sessionType) {
    switch (sessionType) {
        case SESSION_TYPES.WORK:
            return 'Work Session';
        case SESSION_TYPES.SHORT_BREAK:
            return 'Short Break';
        case SESSION_TYPES.LONG_BREAK:
            return 'Long Break';
        default:
            return 'Session';
    }
}

/**
 * Calculates the progress percentage for the circular progress indicator
 * @param {number} timeRemaining - Time remaining in seconds
 * @param {number} totalDuration - Total duration in seconds
 * @returns {number} Progress percentage (0-100)
 */
function calculateProgress(timeRemaining, totalDuration) {
    if (totalDuration === 0) return 0;
    return ((totalDuration - timeRemaining) / totalDuration) * 100;
}
