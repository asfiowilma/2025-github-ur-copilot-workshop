/**
 * Timer Controller
 * Controls the timer countdown, UI updates, and session transitions
 */

class TimerController {
    constructor(timerState, settings) {
        this.state = timerState;
        this.settings = settings;
        this.intervalId = null;
        this.totalDuration = timerState.timeRemaining;
        
        // UI Elements
        this.timerDisplay = document.getElementById('timer-display');
        this.sessionType = document.getElementById('session-type');
        this.sessionCounter = document.getElementById('session-counter');
        this.progressCircle = document.getElementById('progress-circle');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.skipBtn = document.getElementById('skip-btn');
        
        // Initial UI update
        this.updateDisplay();
    }
    
    /**
     * Starts the timer
     */
    startTimer() {
        if (this.state.isRunning) return;
        
        this.state.start();
        this.totalDuration = getDurationForSession(this.state.currentSession, this.state.settings);
        
        this.intervalId = setInterval(() => this.tick(), 1000);
        
        this.updateButtonStates();
        this.updateDisplay();
    }
    
    /**
     * Pauses the timer
     */
    pauseTimer() {
        if (!this.state.isRunning) return;
        
        this.state.pause();
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        this.updateButtonStates();
    }
    
    /**
     * Resets the timer
     */
    async resetTimer() {
        const wasRunning = this.state.isRunning;
        const elapsedTime = this.totalDuration - this.state.timeRemaining;
        const currentSession = this.state.currentSession;
        
        // Stop the timer
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        // Reset state
        this.state.reset();
        this.totalDuration = this.state.timeRemaining;
        
        // Log reset if timer was running
        if (wasRunning && elapsedTime > 0) {
            try {
                await logResetSession(currentSession, elapsedTime);
            } catch (error) {
                console.error('Failed to log reset session:', error);
            }
        }
        
        this.updateButtonStates();
        this.updateDisplay();
    }
    
    /**
     * Skips the current session
     */
    async skipSession() {
        const elapsedTime = this.totalDuration - this.state.timeRemaining;
        const currentSession = this.state.currentSession;
        
        // Stop the timer
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        // Log skipped session if any time elapsed
        if (elapsedTime > 0) {
            try {
                await logSkippedSession(currentSession, elapsedTime);
            } catch (error) {
                console.error('Failed to log skipped session:', error);
            }
        }
        
        // Move to next session
        this.state.nextSession();
        this.totalDuration = this.state.timeRemaining;
        
        this.updateButtonStates();
        this.updateDisplay();
        
        // Notify user
        this.notifyUser(`${getSessionDisplayName(this.state.currentSession)} is ready to start!`);
    }
    
    /**
     * Handles each timer tick (1 second)
     */
    tick() {
        this.state.tick();
        this.updateDisplay();
        
        // Check if session is complete
        if (this.state.isComplete()) {
            this.handleSessionComplete();
        }
    }
    
    /**
     * Handles session completion
     */
    async handleSessionComplete() {
        // Stop the timer
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        const completedSession = this.state.currentSession;
        const duration = this.totalDuration;
        
        // Play sound if enabled
        if (this.settings.getAudioAlertsEnabled()) {
            playBeep();
        }
        
        // Log completed session
        try {
            await logCompletedSession(completedSession, duration);
        } catch (error) {
            console.error('Failed to log completed session:', error);
        }
        
        // Move to next session
        this.state.nextSession();
        this.totalDuration = this.state.timeRemaining;
        
        this.updateButtonStates();
        this.updateDisplay();
        
        // Notify user
        this.notifyUser(
            `${getSessionDisplayName(completedSession)} complete!`,
            `Time to start ${getSessionDisplayName(this.state.currentSession)}`
        );
    }
    
    /**
     * Updates the timer display
     */
    updateDisplay() {
        // Update timer text
        this.timerDisplay.textContent = formatTimeDisplay(this.state.timeRemaining);
        
        // Update session type
        this.sessionType.textContent = getSessionDisplayName(this.state.currentSession);
        
        // Update session counter
        const nextSessionNum = this.state.sessionCount + 1;
        const sessionsUntilBreak = this.state.settings.sessionsUntilLongBreak;
        this.sessionCounter.textContent = `Session ${nextSessionNum} of ${sessionsUntilBreak}`;
        
        // Update progress circle
        const progress = calculateProgress(this.state.timeRemaining, this.totalDuration);
        const circumference = 2 * Math.PI * 90; // radius is 90
        const offset = circumference - (progress / 100) * circumference;
        this.progressCircle.style.strokeDashoffset = offset;
        
        // Update CSS class for session type
        document.body.className = '';
        if (this.state.currentSession === SESSION_TYPES.WORK) {
            document.body.classList.add('session-type-work');
        } else if (this.state.currentSession === SESSION_TYPES.LONG_BREAK) {
            document.body.classList.add('session-type-long-break');
        } else {
            document.body.classList.add('session-type-break');
        }
    }
    
    /**
     * Updates button states based on timer state
     */
    updateButtonStates() {
        if (this.state.isRunning) {
            this.startBtn.disabled = true;
            this.pauseBtn.disabled = false;
            this.startBtn.textContent = 'Start';
        } else if (this.state.isPaused) {
            this.startBtn.disabled = false;
            this.pauseBtn.disabled = true;
            this.startBtn.textContent = 'Resume';
        } else {
            this.startBtn.disabled = false;
            this.pauseBtn.disabled = true;
            this.startBtn.textContent = 'Start';
        }
    }
    
    /**
     * Shows a browser notification
     * @param {string} title - Notification title
     * @param {string} body - Notification body
     */
    notifyUser(title, body = '') {
        if (this.settings.getBrowserNotificationsEnabled()) {
            showNotification(title, body);
        }
    }
    
    /**
     * Updates the timer with new settings
     * @param {object} newSettings - New settings object
     */
    updateSettings(newSettings) {
        this.state.updateSettings(newSettings);
        this.totalDuration = this.state.timeRemaining;
        this.updateDisplay();
    }
}
