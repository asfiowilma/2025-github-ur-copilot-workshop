// Pomodoro Timer JavaScript Implementation

class PomodoroTimer {
    constructor() {
        // Timer state
        this.isRunning = false;
        this.isPaused = false;
        this.currentTime = 0; // in seconds
        this.intervalId = null;
        
        // Session management
        this.currentSession = 1;
        this.maxSessions = 4;
        this.sessionType = 'work'; // 'work', 'short_break', 'long_break'
        
        // Duration settings (in seconds)
        this.settings = {
            workDuration: 25 * 60,
            shortBreakDuration: 5 * 60,
            longBreakDuration: 15 * 60
        };
        
        // Visual feedback
        this.progressCircle = null;
        this.progressCircleRadius = 100;
        this.progressCircleCircumference = 0;
        this.particleSystem = null;
        
        // DOM elements
        this.initializeElements();
        this.loadSettings();
        this.initializeProgressCircle();
        this.initializeParticleSystem();
        this.resetTimer();
        this.bindEvents();
    }
    
    initializeElements() {
        this.timerTimeEl = document.getElementById('timer-time');
        this.timerStatusEl = document.getElementById('timer-status');
        this.sessionTypeEl = document.getElementById('session-type');
        this.sessionCountEl = document.getElementById('session-count');
        this.timerCircleEl = document.querySelector('.timer-circle');
        this.progressDotsEl = document.getElementById('progress-dots');
        this.particlesCanvas = document.getElementById('particles-canvas');
        
        // Buttons
        this.startBtn = document.getElementById('start-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.skipBtn = document.getElementById('skip-btn');
        this.settingsBtn = document.getElementById('settings-btn');
        
        // Settings panel
        this.settingsPanel = document.getElementById('settings-panel');
        this.workDurationInput = document.getElementById('work-duration');
        this.shortBreakInput = document.getElementById('short-break-duration');
        this.longBreakInput = document.getElementById('long-break-duration');
        this.saveSettingsBtn = document.getElementById('save-settings-btn');
        this.cancelSettingsBtn = document.getElementById('cancel-settings-btn');
    }
    
    initializeProgressCircle() {
        this.progressCircle = document.getElementById('progress-circle');
        if (!this.progressCircle) {
            console.error('Progress circle element not found');
            return;
        }
        this.progressCircleCircumference = 2 * Math.PI * this.progressCircleRadius;
        
        this.progressCircle.style.strokeDasharray = `${this.progressCircleCircumference} ${this.progressCircleCircumference}`;
        this.progressCircle.style.strokeDashoffset = '0';
    }
    
    initializeParticleSystem() {
        if (!this.particlesCanvas) return;
        
        this.particleSystem = new ParticleSystem(this.particlesCanvas);
    }
    
    updateProgressCircle(percentage) {
        if (!this.progressCircle) return;
        
        const offset = this.progressCircleCircumference - (percentage / 100) * this.progressCircleCircumference;
        this.progressCircle.style.strokeDashoffset = offset;
        
        // Update color based on time remaining (blue -> yellow -> red)
        const color = this.getColorForPercentage(percentage);
        const gradient = document.getElementById('progressGradient');
        if (gradient) {
            const stops = gradient.querySelectorAll('stop');
            stops[0].setAttribute('style', `stop-color:${color.start};stop-opacity:1`);
            stops[1].setAttribute('style', `stop-color:${color.end};stop-opacity:1`);
        }
        
        // Update body background color
        this.updateBodyBackground(percentage);
    }
    
    getColorForPercentage(percentage) {
        if (this.sessionType !== 'work') {
            // Break sessions use green color
            return { start: '#48bb78', end: '#38a169' };
        }
        
        // Work sessions: blue -> yellow -> red
        if (percentage > 66) {
            // Blue zone (100% - 66%)
            return { start: '#667eea', end: '#764ba2' };
        } else if (percentage > 33) {
            // Yellow zone (66% - 33%)
            return { start: '#f6ad55', end: '#ed8936' };
        } else {
            // Red zone (33% - 0%)
            return { start: '#fc8181', end: '#f56565' };
        }
    }
    
    updateBodyBackground(percentage) {
        const body = document.body;
        
        if (this.sessionType !== 'work') {
            // Break sessions
            body.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
            return;
        }
        
        // Work sessions: transition background color
        if (percentage > 66) {
            body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        } else if (percentage > 33) {
            body.style.background = 'linear-gradient(135deg, #f6ad55 0%, #ed8936 100%)';
        } else {
            body.style.background = 'linear-gradient(135deg, #fc8181 0%, #f56565 100%)';
        }
    }
    
    loadSettings() {
        // Load settings from localStorage if available
        const saved = localStorage.getItem('pomodoroSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            this.settings.workDuration = settings.workDuration * 60;
            this.settings.shortBreakDuration = settings.shortBreakDuration * 60;
            this.settings.longBreakDuration = settings.longBreakDuration * 60;
        }
        
        // Update input fields
        this.workDurationInput.value = Math.floor(this.settings.workDuration / 60);
        this.shortBreakInput.value = Math.floor(this.settings.shortBreakDuration / 60);
        this.longBreakInput.value = Math.floor(this.settings.longBreakDuration / 60);
    }
    
    saveSettings() {
        const settings = {
            workDuration: parseInt(this.workDurationInput.value),
            shortBreakDuration: parseInt(this.shortBreakInput.value),
            longBreakDuration: parseInt(this.longBreakInput.value)
        };
        
        this.settings.workDuration = settings.workDuration * 60;
        this.settings.shortBreakDuration = settings.shortBreakDuration * 60;
        this.settings.longBreakDuration = settings.longBreakDuration * 60;
        
        localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
        this.hideSettings();
        this.resetTimer();
    }
    
    bindEvents() {
        this.startBtn.addEventListener('click', () => this.toggleTimer());
        this.resetBtn.addEventListener('click', () => this.resetTimer());
        this.skipBtn.addEventListener('click', () => this.skipSession());
        this.settingsBtn.addEventListener('click', () => this.showSettings());
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        this.cancelSettingsBtn.addEventListener('click', () => this.hideSettings());
    }
    
    getCurrentDuration() {
        if (this.sessionType === 'work') {
            return this.settings.workDuration;
        } else if (this.sessionType === 'short_break') {
            return this.settings.shortBreakDuration;
        } else {
            return this.settings.longBreakDuration;
        }
    }
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    updateDisplay() {
        this.timerTimeEl.textContent = this.formatTime(this.currentTime);
        
        // Update progress circle
        const totalDuration = this.getCurrentDuration();
        const percentage = (this.currentTime / totalDuration) * 100;
        this.updateProgressCircle(percentage);
        
        // Update session info
        if (this.sessionType === 'work') {
            this.sessionTypeEl.textContent = 'Work Session';
            this.sessionCountEl.textContent = `Session ${this.currentSession} of ${this.maxSessions}`;
        } else if (this.sessionType === 'short_break') {
            this.sessionTypeEl.textContent = 'Short Break';
            this.sessionCountEl.textContent = `After Session ${this.currentSession - 1}`;
        } else {
            this.sessionTypeEl.textContent = 'Long Break';
            this.sessionCountEl.textContent = `After ${this.maxSessions} Sessions`;
        }
        
        // Update status
        if (!this.isRunning && this.currentTime === this.getCurrentDuration()) {
            this.timerStatusEl.textContent = 'Ready to start';
        } else if (this.isRunning) {
            this.timerStatusEl.textContent = 'Focus time';
        } else if (this.isPaused) {
            this.timerStatusEl.textContent = 'Paused';
        } else {
            this.timerStatusEl.textContent = 'Ready';
        }
        
        // Update progress dots
        this.updateProgressDots();
    }
    
    updateProgressDots() {
        const dots = this.progressDotsEl.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            const sessionNum = index + 1;
            if (sessionNum < this.currentSession) {
                dot.className = 'dot completed';
            } else if (sessionNum === this.currentSession && this.sessionType === 'work') {
                dot.className = 'dot active';
            } else {
                dot.className = 'dot';
            }
        });
    }
    
    toggleTimer() {
        if (this.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }
    
    startTimer() {
        this.isRunning = true;
        this.isPaused = false;
        this.startBtn.textContent = 'Pause';
        
        // Start particle system
        if (this.particleSystem && this.sessionType === 'work') {
            this.particleSystem.start();
        }
        
        this.intervalId = setInterval(() => {
            if (this.currentTime > 0) {
                this.currentTime--;
                this.updateDisplay();
            } else {
                this.completeSession();
            }
        }, 1000);
        
        this.updateDisplay();
    }
    
    pauseTimer() {
        this.isRunning = false;
        this.isPaused = true;
        this.startBtn.textContent = 'Start';
        
        // Pause particle system
        if (this.particleSystem) {
            this.particleSystem.stop();
        }
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        this.updateDisplay();
    }
    
    resetTimer() {
        this.isRunning = false;
        this.isPaused = false;
        this.startBtn.textContent = 'Start';
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        this.currentTime = this.getCurrentDuration();
        this.updateDisplay();
    }
    
    async completeSession() {
        this.pauseTimer();
        
        // Log the completed session
        await this.logSession('completed');
        
        // Play notification sound (optional - browser notification)
        this.showNotification(`${this.sessionType === 'work' ? 'Work session' : 'Break'} completed!`);
        
        // Move to next session
        this.nextSession();
    }
    
    async skipSession() {
        if (this.isRunning || this.isPaused) {
            this.pauseTimer();
            
            // Log the skipped session
            await this.logSession('skipped');
            
            // Move to next session
            this.nextSession();
        }
    }
    
    nextSession() {
        if (this.sessionType === 'work') {
            // After work session
            if (this.currentSession >= this.maxSessions) {
                // Long break after 4 sessions
                this.sessionType = 'long_break';
            } else {
                // Short break
                this.sessionType = 'short_break';
            }
        } else {
            // After break, start next work session
            if (this.sessionType === 'short_break') {
                this.currentSession++;
            } else if (this.sessionType === 'long_break') {
                this.currentSession = 1; // Reset for next cycle
            }
            this.sessionType = 'work';
        }
        
        this.resetTimer();
    }
    
    async logSession(action) {
        try {
            const sessionData = {
                session_type: this.sessionType,
                action: action,
                session_number: this.currentSession
            };
            
            const response = await fetch('/log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sessionData)
            });
            
            if (!response.ok) {
                console.error('Failed to log session:', response.statusText);
            }
        } catch (error) {
            console.error('Error logging session:', error);
        }
    }
    
    showNotification(message) {
        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Pomodoro Timer', {
                body: message,
                icon: '/static/favicon.ico' // Optional
            });
        } else if ('Notification' in window && Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification('Pomodoro Timer', {
                        body: message,
                        icon: '/static/favicon.ico'
                    });
                }
            });
        }
        
        // Visual notification (simple alert for now)
        // You could replace this with a custom modal
        setTimeout(() => {
            alert(message);
        }, 100);
    }
    
    showSettings() {
        this.settingsPanel.style.display = 'block';
    }
    
    hideSettings() {
        this.settingsPanel.style.display = 'none';
    }
}

// Initialize the timer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
});

// Particle System for immersive background effects
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.animationId = null;
        this.isRunning = false;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        const parent = this.canvas.parentElement;
        this.canvas.width = parent.offsetWidth;
        this.canvas.height = parent.offsetHeight;
    }
    
    createParticle() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.5 + 0.2;
        
        return {
            x: centerX,
            y: centerY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: Math.random() * 2 + 1,
            opacity: Math.random() * 0.5 + 0.2,
            life: 1.0,
            decay: Math.random() * 0.005 + 0.002
        };
    }
    
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.animate();
    }
    
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.particles = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    animate() {
        if (!this.isRunning) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Create new particles
        if (this.particles.length < 50) {
            this.particles.push(this.createParticle());
        }
        
        // Update and draw particles
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= particle.decay;
            
            if (particle.life <= 0) return false;
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity * particle.life})`;
            this.ctx.fill();
            
            return true;
        });
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
}