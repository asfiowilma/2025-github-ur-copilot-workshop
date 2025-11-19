/**
 * Main Application Entry Point
 * Initializes the Pomodoro Timer and wires up all event handlers
 */

// Global variables
let timerController;
let settingsManager;
let timerState;

/**
 * Initializes the application
 */
function initializeApp() {
    // Initialize settings manager
    settingsManager = new SettingsManager();
    
    // Initialize timer state with loaded settings
    timerState = new TimerState(settingsManager.getTimerSettings());
    
    // Initialize timer controller
    timerController = new TimerController(timerState, settingsManager);
    
    // Set up event listeners
    setupEventListeners();
    
    // Request notification permission
    requestNotificationPermission().then(permission => {
        if (permission === 'denied') {
            console.log('Notification permission denied');
        }
    });
    
    console.log('Pomodoro Timer initialized');
}

/**
 * Sets up all event listeners
 */
function setupEventListeners() {
    // Timer control buttons
    document.getElementById('start-btn').addEventListener('click', () => {
        timerController.startTimer();
    });
    
    document.getElementById('pause-btn').addEventListener('click', () => {
        timerController.pauseTimer();
    });
    
    document.getElementById('reset-btn').addEventListener('click', () => {
        timerController.resetTimer();
    });
    
    document.getElementById('skip-btn').addEventListener('click', () => {
        timerController.skipSession();
    });
    
    // Settings button
    document.getElementById('settings-btn').addEventListener('click', () => {
        openSettingsModal();
    });
    
    // Settings modal controls
    document.getElementById('close-modal').addEventListener('click', () => {
        closeSettingsModal();
    });
    
    document.getElementById('save-settings-btn').addEventListener('click', () => {
        saveSettingsFromModal();
    });
    
    document.getElementById('reset-defaults-btn').addEventListener('click', () => {
        resetSettingsToDefaults();
    });
    
    // Close modal when clicking outside
    document.getElementById('settings-modal').addEventListener('click', (e) => {
        if (e.target.id === 'settings-modal') {
            closeSettingsModal();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Space bar to start/pause
        if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
            e.preventDefault();
            if (timerState.isRunning) {
                timerController.pauseTimer();
            } else {
                timerController.startTimer();
            }
        }
        
        // R key to reset
        if (e.code === 'KeyR' && e.target.tagName !== 'INPUT') {
            e.preventDefault();
            timerController.resetTimer();
        }
        
        // S key to skip
        if (e.code === 'KeyS' && e.target.tagName !== 'INPUT') {
            e.preventDefault();
            timerController.skipSession();
        }
        
        // Escape key to close modal
        if (e.code === 'Escape') {
            closeSettingsModal();
        }
    });
}

/**
 * Opens the settings modal
 */
function openSettingsModal() {
    settingsManager.populateForm();
    document.getElementById('settings-modal').classList.add('show');
}

/**
 * Closes the settings modal
 */
function closeSettingsModal() {
    document.getElementById('settings-modal').classList.remove('show');
}

/**
 * Saves settings from the modal
 */
function saveSettingsFromModal() {
    const newSettings = settingsManager.readFromForm();
    
    // Validate settings
    if (newSettings.workDuration < 1 || newSettings.workDuration > 60) {
        alert('Work duration must be between 1 and 60 minutes');
        return;
    }
    
    if (newSettings.shortBreakDuration < 1 || newSettings.shortBreakDuration > 30) {
        alert('Short break duration must be between 1 and 30 minutes');
        return;
    }
    
    if (newSettings.longBreakDuration < 1 || newSettings.longBreakDuration > 60) {
        alert('Long break duration must be between 1 and 60 minutes');
        return;
    }
    
    if (newSettings.sessionsUntilLongBreak < 2 || newSettings.sessionsUntilLongBreak > 10) {
        alert('Sessions until long break must be between 2 and 10');
        return;
    }
    
    // Save settings
    settingsManager.saveSettings(newSettings);
    
    // Update timer with new settings
    timerController.updateSettings(settingsManager.getTimerSettings());
    
    // Close modal
    closeSettingsModal();
    
    console.log('Settings saved:', newSettings);
}

/**
 * Resets settings to defaults
 */
function resetSettingsToDefaults() {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
        settingsManager.resetToDefaults();
        settingsManager.populateForm();
        
        // Update timer with default settings
        timerController.updateSettings(settingsManager.getTimerSettings());
        
        console.log('Settings reset to defaults');
    }
}

/**
 * Page visibility change handler
 * Keeps the timer accurate when tab is hidden/shown
 */
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && timerState.isRunning) {
        // Recalculate time remaining based on start time
        if (timerState.startTime) {
            const totalDuration = getDurationForSession(timerState.currentSession, timerState.settings);
            timerState.timeRemaining = calculateRemainingTime(timerState.startTime, totalDuration);
            
            if (timerState.timeRemaining <= 0) {
                timerState.timeRemaining = 0;
                timerController.handleSessionComplete();
            } else {
                timerController.updateDisplay();
            }
        }
    }
});

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
