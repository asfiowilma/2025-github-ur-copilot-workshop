/**
 * Settings Manager
 * Handles settings persistence and management
 */

const SETTINGS_KEY = 'pomodoro-settings';

const DEFAULT_SETTINGS = {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 20,
    sessionsUntilLongBreak: 4,
    audioAlerts: true,
    browserNotifications: true
};

class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
    }
    
    /**
     * Loads settings from localStorage or returns defaults
     * @returns {object} Settings object
     */
    loadSettings() {
        try {
            const stored = localStorage.getItem(SETTINGS_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Merge with defaults to ensure all keys exist
                return { ...DEFAULT_SETTINGS, ...parsed };
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
        return { ...DEFAULT_SETTINGS };
    }
    
    /**
     * Saves settings to localStorage
     * @param {object} settings - Settings object to save
     * @returns {boolean} Success status
     */
    saveSettings(settings) {
        try {
            this.settings = { ...this.settings, ...settings };
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    }
    
    /**
     * Resets settings to defaults
     */
    resetToDefaults() {
        this.settings = { ...DEFAULT_SETTINGS };
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
            return true;
        } catch (error) {
            console.error('Error resetting settings:', error);
            return false;
        }
    }
    
    /**
     * Gets all settings
     * @returns {object} Current settings
     */
    getSettings() {
        return { ...this.settings };
    }
    
    /**
     * Gets settings formatted for TimerState
     * @returns {object} Settings in seconds
     */
    getTimerSettings() {
        return {
            workDuration: this.settings.workDuration * 60,
            shortBreakDuration: this.settings.shortBreakDuration * 60,
            longBreakDuration: this.settings.longBreakDuration * 60,
            sessionsUntilLongBreak: this.settings.sessionsUntilLongBreak
        };
    }
    
    /**
     * Gets audio alerts enabled status
     * @returns {boolean}
     */
    getAudioAlertsEnabled() {
        return this.settings.audioAlerts;
    }
    
    /**
     * Gets browser notifications enabled status
     * @returns {boolean}
     */
    getBrowserNotificationsEnabled() {
        return this.settings.browserNotifications;
    }
    
    /**
     * Populates the settings form with current values
     */
    populateForm() {
        document.getElementById('work-duration').value = this.settings.workDuration;
        document.getElementById('short-break-duration').value = this.settings.shortBreakDuration;
        document.getElementById('long-break-duration').value = this.settings.longBreakDuration;
        document.getElementById('sessions-until-long-break').value = this.settings.sessionsUntilLongBreak;
        document.getElementById('audio-alerts').checked = this.settings.audioAlerts;
        document.getElementById('browser-notifications').checked = this.settings.browserNotifications;
    }
    
    /**
     * Reads settings from the form
     * @returns {object} Settings from form
     */
    readFromForm() {
        return {
            workDuration: parseInt(document.getElementById('work-duration').value) || 25,
            shortBreakDuration: parseInt(document.getElementById('short-break-duration').value) || 5,
            longBreakDuration: parseInt(document.getElementById('long-break-duration').value) || 20,
            sessionsUntilLongBreak: parseInt(document.getElementById('sessions-until-long-break').value) || 4,
            audioAlerts: document.getElementById('audio-alerts').checked,
            browserNotifications: document.getElementById('browser-notifications').checked
        };
    }
}
