# Pomodoro Timer Web Application - Development Plan

This document provides a step-by-step development plan for implementing the Pomodoro Timer web application based on the architecture specification.

---

## Development Approach

Build a Flask-based Pomodoro timer with client-side JavaScript, following test-driven development principles for backend logic and incremental frontend implementation.

---

## Implementation Steps

### Step 1: Setup Project Dependencies and Structure

**Objective:** Initialize the development environment and project structure.

**Tasks:**
- Create `requirements.txt` with Flask, pytest, and pytest-flask
- Initialize virtual environment using `uv venv`
- Activate virtual environment: `source .venv/bin/activate`
- Install dependencies using `uv pip install -r requirements.txt`
- Create directory structure:
  - `templates/` (for Jinja2 templates)
  - `static/js/` (for JavaScript files)
  - `static/css/` (for CSS files)

**Success Criteria:**
- Virtual environment is activated
- All dependencies are installed
- Directory structure is in place

---

### Step 2: Implement Core Flask Backend with Logging

**Objective:** Build the Flask backend with session logging functionality.

**Tasks:**
- Create `app.py` with Flask application initialization
- Implement three routes:
  - `GET /` — Serves the main HTML page
  - `POST /log-session` — Logs session events to file
  - `GET /history` — Returns log history as JSON
- Create helper functions (testable in isolation):
  - `validate_session_data(data)` — Validates incoming session data
  - `format_log_entry(timestamp, session_type, status, duration)` — Formats CSV entry
  - `write_to_log(entry, log_file='pomodoro_log.txt')` — Appends entry to log file
  - `parse_log_entry(line)` — Parses a single log line into a dictionary
  - `parse_log_file(log_file='pomodoro_log.txt')` — Reads and parses entire log file
- Create `test_app.py` with test cases for:
  - Each route (using Flask test client)
  - Each helper function (unit tests)
  - Log file operations (using temporary files)

**Log Format:**
```
2025-11-19T07:30:00Z,WORK,COMPLETED,25:00
```

**Success Criteria:**
- All routes respond correctly
- Session data is logged to `pomodoro_log.txt`
- All tests pass
- Functions are pure and testable

---

### Step 3: Create HTML Template and CSS Styling

**Objective:** Build the user interface matching the mockup design.

**Tasks:**
- Create `templates/index.html` with:
  - Header with title "Pomodoro Timer"
  - Subtitle with session type indication
  - Large circular timer display (MM:SS format)
  - Control buttons: Start, Pause, Reset, Skip, Settings
  - Session counter display (e.g., "Session 1 of 4")
  - Placeholder divs for dynamic content
- Create `static/css/style.css` with:
  - Dark theme matching mockup (dark background, white/light text)
  - Circular timer display styling
  - Button styling with hover effects
  - Responsive layout (mobile-friendly)
  - Clean, modern typography
  - Grid/flexbox layout for proper alignment

**Success Criteria:**
- HTML structure is complete and semantic
- UI matches the mockup design
- Layout is responsive on different screen sizes
- All interactive elements are styled appropriately

---

### Step 4: Implement Timer State Management Module

**Objective:** Create the core timer logic as a reusable, testable module.

**Tasks:**
- Create `static/js/timer-state.js` with:
  - `TimerState` class with properties:
    - `currentSession` (WORK, SHORT_BREAK, LONG_BREAK)
    - `sessionCount` (number of completed work sessions)
    - `duration` (in seconds)
    - `isRunning` (boolean)
    - `isPaused` (boolean)
  - Session constants:
    - `WORK_DURATION = 25 * 60` (25 minutes)
    - `SHORT_BREAK_DURATION = 5 * 60` (5 minutes)
    - `LONG_BREAK_DURATION = 20 * 60` (20 minutes)
    - `SESSIONS_UNTIL_LONG_BREAK = 4`
  - Pure functions (easily testable):
    - `determineNextSession(sessionCount, currentSession)` — Calculates next session type
    - `shouldTakeLongBreak(sessionCount)` — Checks if long break is due
    - `getDurationForSession(sessionType)` — Returns duration for session type
    - `incrementSessionCount(currentCount, sessionType)` — Updates session count

**Success Criteria:**
- State transitions follow Pomodoro rules correctly
- Functions are pure and return predictable results
- Session counting logic is accurate
- All state changes are explicit and traceable

---

### Step 5: Build Timer UI Controller and Backend Integration

**Objective:** Implement countdown logic, UI updates, and server communication.

**Tasks:**
- Create `static/js/timer-controller.js` with:
  - `TimerController` class managing:
    - Countdown interval
    - UI element references
    - Timer state instance
  - Functions:
    - `startTimer()` — Begins countdown
    - `pauseTimer()` — Pauses countdown
    - `resetTimer()` — Resets to initial state
    - `tick()` — Decrements time and updates UI
    - `updateDisplay(timeRemaining)` — Updates timer display
    - `handleSessionComplete()` — Triggers session end logic
    - `notifyUser(message)` — Shows browser notification
- Create `static/js/api-client.js` with:
  - `logSession(sessionData)` — POST to `/log-session`
  - `getHistory()` — GET from `/history`
  - Error handling for API requests
- Create `static/js/utils.js` with:
  - `formatTimeDisplay(seconds)` — Converts seconds to MM:SS
  - `calculateRemainingTime(startTime, duration)` — Calculates time left
  - `getCurrentTimestamp()` — Returns ISO 8601 timestamp
- Implement localStorage persistence:
  - Save timer state on state change
  - Restore state on page load (optional, see considerations)

**Success Criteria:**
- Timer counts down accurately
- UI updates every second
- Browser notifications work when permitted
- Session data is sent to backend on completion
- API communication handles errors gracefully

---

### Step 6: Wire Up User Interactions and Add Settings

**Objective:** Connect all UI elements and add customization options.

**Tasks:**
- Create `static/js/app.js` (main entry point) with:
  - DOM ready event listener
  - Initialize `TimerController` instance
  - Button event handlers:
    - Start button → `controller.startTimer()`
    - Pause button → `controller.pauseTimer()`
    - Reset button → `controller.resetTimer()`
    - Skip button → `controller.skipSession()`
    - Settings button → `openSettingsModal()`
  - Request notification permissions on first interaction
- Implement settings modal in `index.html`:
  - Input fields for custom durations (work, short break, long break)
  - Sessions until long break setting
  - Audio alert toggle
  - Save/Cancel buttons
- Add settings management in `static/js/settings.js`:
  - `loadSettings()` — Reads from localStorage
  - `saveSettings(settings)` — Writes to localStorage
  - `applySettings(settings)` — Updates timer with new durations
  - `resetToDefaults()` — Restores default Pomodoro settings
- Add audio alerts (optional):
  - Play sound on session completion
  - Different sounds for work/break transitions

**Success Criteria:**
- All buttons trigger correct actions
- Settings persist across page reloads
- Custom durations apply correctly
- Notifications appear when enabled
- Audio alerts play when enabled (if implemented)

---

## Function Granularity for Testing

### Backend (Python)

**Highly Testable Pure Functions:**
- `validate_session_data(data)` → Returns validated dict or raises exception
- `format_log_entry(timestamp, type, status, duration)` → Returns CSV string
- `parse_log_entry(line)` → Returns dict with parsed fields
- `write_to_log(entry, log_file)` → Returns success boolean
- `parse_log_file(log_file)` → Returns list of session dicts

**Integration Tests:**
- Flask routes with test client
- End-to-end logging workflow
- File I/O operations with temporary files

### Frontend (JavaScript)

**Highly Testable Pure Functions:**
- `calculateRemainingTime(startTime, duration)` → Returns seconds
- `formatTimeDisplay(seconds)` → Returns "MM:SS" string
- `determineNextSession(sessionCount, currentSession)` → Returns session type
- `shouldTakeLongBreak(sessionCount)` → Returns boolean
- `getDurationForSession(sessionType)` → Returns duration in seconds
- `incrementSessionCount(currentCount, sessionType)` → Returns new count

**Unit Tests (if using Jest):**
- All pure utility functions
- State transition logic
- Time formatting and calculations

**Manual/Browser Tests:**
- UI interactions
- Browser notifications
- Audio alerts
- localStorage persistence

---

## Additional Considerations

### 1. State Persistence Strategy

**Options:**
- **Option A (Recommended for MVP):** Fresh start on each page load
  - Simpler to implement
  - No state reconciliation issues
  - Clear user expectations
  
- **Option B (Enhancement):** Restore incomplete sessions
  - Requires localStorage + backend sync
  - Handle edge cases (stale state, long pauses)
  - Better UX for accidental page refreshes

**Recommendation:** Start with Option A, add Option B in future iteration.

### 2. Testing Approach

**Backend Testing:**
- Use pytest with fixtures for temporary log files
- Use Flask test client for route testing
- Aim for >80% code coverage
- Mock file I/O for unit tests

**Frontend Testing:**
- **MVP:** Manual browser testing + console logging
- **Future:** Add Jest for unit testing pure functions
- **Future:** Add Cypress/Playwright for E2E tests

### 3. Error Handling

**Backend:**
- Validate all incoming data
- Handle file I/O errors gracefully
- Return appropriate HTTP status codes
- Log errors for debugging

**Frontend:**
- Display user-friendly error messages
- Retry failed API requests
- Fallback gracefully if notifications are blocked
- Validate user input in settings

### 4. Accessibility Considerations

- Ensure keyboard navigation works
- Add ARIA labels for screen readers
- Provide visual feedback for all actions
- Ensure sufficient color contrast
- Support reduced motion preferences

---

## Timeline Estimate

- **Step 1:** 30 minutes
- **Step 2:** 2-3 hours (including tests)
- **Step 3:** 1-2 hours
- **Step 4:** 1-2 hours
- **Step 5:** 2-3 hours
- **Step 6:** 1-2 hours

**Total:** 8-13 hours for complete MVP implementation

---

## Success Criteria for MVP

- [ ] User can start a 25-minute work session
- [ ] Timer counts down accurately
- [ ] User can pause and resume timer
- [ ] User can skip current session
- [ ] User can reset timer
- [ ] Timer automatically transitions between work/break sessions
- [ ] Long break occurs after 4 work sessions
- [ ] Session events are logged to `pomodoro_log.txt`
- [ ] Browser notifications appear at session transitions
- [ ] Settings can be customized and persisted
- [ ] All backend tests pass
- [ ] UI is responsive and matches mockup

---

*This plan is designed to be followed by coding agents or developers to implement the Pomodoro Timer application incrementally and systematically.*
