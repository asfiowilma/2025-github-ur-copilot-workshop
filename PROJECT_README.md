# Pomodoro Timer Web Application

A modern, feature-rich Pomodoro Timer web application built with Flask backend and vanilla JavaScript frontend. This application helps you manage your time using the Pomodoro Technique with customizable work and break intervals.

![Pomodoro Timer](ui-mockup.png)

## Features

### Core Functionality
- ⏱️ **Customizable Timer**: Set your own work, short break, and long break durations
- 🎯 **Session Tracking**: Automatically tracks completed work sessions
- 🔄 **Auto-Transitions**: Seamlessly switches between work and break sessions
- 📊 **Session Logging**: All sessions are logged to a file for historical tracking
- 💾 **Persistent Settings**: Your preferences are saved in browser localStorage

### User Experience
- 🎨 **Modern Dark Theme**: Eye-friendly dark interface with smooth animations
- 🔔 **Browser Notifications**: Get notified when sessions complete (with permission)
- 🔊 **Audio Alerts**: Optional sound notification at session completion
- ⌨️ **Keyboard Shortcuts**: 
  - `Space` - Start/Pause timer
  - `R` - Reset timer
  - `S` - Skip session
  - `Esc` - Close settings modal
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

### Technical Features
- ✅ **Test Coverage**: Comprehensive pytest suite with 20 tests
- 🏗️ **Modular Architecture**: Clean separation of concerns
- 🔄 **RESTful API**: Well-structured endpoints for session logging
- 📝 **Session History**: Retrieve historical session data via API

## Project Structure

```
.
├── app.py                          # Flask backend application
├── test_app.py                     # Backend test suite
├── requirements.txt                # Python dependencies
├── templates/
│   └── index.html                  # Main HTML template
├── static/
│   ├── css/
│   │   └── style.css              # Application styling
│   └── js/
│       ├── app.js                 # Main application entry point
│       ├── timer-state.js         # Timer state management
│       ├── timer-controller.js    # Timer control logic
│       ├── api-client.js          # Backend API communication
│       ├── settings.js            # Settings management
│       └── utils.js               # Utility functions
├── pomodoro_log.txt               # Session log file (auto-generated)
├── architecture.md                # Architecture documentation
├── plan.md                        # Development plan
└── README.md                      # This file
```

## Installation

### Prerequisites
- Python 3.11 or higher
- Modern web browser (Chrome, Firefox, Safari, or Edge)

### Setup

1. **Clone the repository**:
   ```bash
   cd /workspaces/2025-github-ur-copilot-workshop
   ```

2. **Create virtual environment**:
   ```bash
   python3 -m venv .venv
   ```

3. **Activate virtual environment**:
   ```bash
   source .venv/bin/activate
   ```

4. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

### Running the Application

1. **Start the Flask server**:
   ```bash
   source .venv/bin/activate
   python app.py
   ```

2. **Open your browser**:
   Navigate to `http://localhost:5000`

3. **Grant permissions** (optional but recommended):
   - Allow browser notifications for session alerts
   - Enable audio for sound notifications

### Using the Timer

1. **Start a work session**: Click "Start" or press `Space`
2. **Pause if needed**: Click "Pause" or press `Space` again
3. **Reset timer**: Click "Reset" or press `R`
4. **Skip session**: Click "Skip" or press `S`
5. **Customize settings**: Click "Settings" to adjust durations

### Customizing Settings

Click the "Settings" button to customize:
- **Work Duration**: 1-60 minutes (default: 25)
- **Short Break Duration**: 1-30 minutes (default: 5)
- **Long Break Duration**: 1-60 minutes (default: 20)
- **Sessions Until Long Break**: 2-10 sessions (default: 4)
- **Audio Alerts**: Enable/disable sound notifications
- **Browser Notifications**: Enable/disable browser notifications

All settings are automatically saved to localStorage.

## Running Tests

Run the test suite to verify everything is working:

```bash
source .venv/bin/activate
pytest test_app.py -v
```

Expected output: **20 passed**

### Test Coverage

The test suite covers:
- ✅ Session data validation
- ✅ Log entry formatting
- ✅ File I/O operations
- ✅ Log parsing
- ✅ Flask routes (GET /, POST /log-session, GET /history)
- ✅ Error handling

## API Documentation

### Endpoints

#### `GET /`
Serves the main HTML page.

**Response**: HTML page

---

#### `POST /log-session`
Logs a session event to the log file.

**Request Body**:
```json
{
  "timestamp": "2025-11-19T07:30:00Z",
  "session_type": "WORK",
  "status": "COMPLETED",
  "duration": "25:00"
}
```

**Valid Values**:
- `session_type`: `WORK`, `SHORT_BREAK`, `LONG_BREAK`
- `status`: `COMPLETED`, `SKIPPED`, `RESET`

**Response**:
```json
{
  "success": true,
  "message": "Session logged successfully"
}
```

---

#### `GET /history`
Retrieves session log history.

**Response**:
```json
{
  "success": true,
  "sessions": [
    {
      "timestamp": "2025-11-19T07:30:00Z",
      "session_type": "WORK",
      "status": "COMPLETED",
      "duration": "25:00"
    }
  ],
  "count": 1
}
```

## Session Log Format

Sessions are logged to `pomodoro_log.txt` in CSV format:

```csv
2025-11-19T07:30:00Z,WORK,COMPLETED,25:00
2025-11-19T07:55:00Z,SHORT_BREAK,COMPLETED,05:00
2025-11-19T08:00:00Z,WORK,SKIPPED,10:00
```

## Architecture

The application follows a clean architecture pattern:

- **Frontend**: Vanilla JavaScript with modular design
- **Backend**: Flask with RESTful API
- **State Management**: Client-side state with localStorage persistence
- **Data Persistence**: Plain text CSV log file
- **Testing**: Pytest with Flask test client

For detailed architecture information, see [architecture.md](architecture.md).

## Development

### Following the Development Plan

This project was built following a structured development plan. See [plan.md](plan.md) for:
- Step-by-step implementation guide
- Function granularity recommendations
- Testing strategies
- Timeline estimates

### Adding Features

The modular architecture makes it easy to add features:

1. **Backend features**: Add new routes in `app.py` with tests in `test_app.py`
2. **Frontend features**: Create new modules in `static/js/` and import in `index.html`
3. **Styling changes**: Modify `static/css/style.css`

## Browser Compatibility

Tested and working on:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Known Limitations

- Session logs are stored in a plain text file (not suitable for multi-user scenarios)
- No user authentication or multi-user support
- Timer accuracy depends on JavaScript `setInterval` (typically within 1 second)
- Browser notifications require user permission

## Future Enhancements

Potential features for future versions:
- 📊 Session analytics dashboard
- 👥 Multi-user support with authentication
- 💾 Database storage for session history
- 📈 Progress charts and statistics
- 🎯 Daily/weekly goals
- 🔗 Calendar integration
- 🌐 PWA support for offline usage
- 🎵 Custom notification sounds

## Troubleshooting

### Timer not starting
- Check browser console for JavaScript errors
- Ensure all JS files are loaded correctly

### Notifications not working
- Grant notification permissions in browser settings
- Check that notifications are enabled in app settings

### Sessions not logging
- Verify Flask server is running
- Check `pomodoro_log.txt` file permissions
- Review browser console for API errors

### Tests failing
- Ensure virtual environment is activated
- Verify all dependencies are installed
- Check Python version (3.11+ required)

## Contributing

This is a workshop project, but contributions are welcome! Please:
1. Follow the existing code style
2. Add tests for new features
3. Update documentation as needed

## License

This project is created for educational purposes as part of a GitHub Copilot workshop.

## Acknowledgments

- Built following the [Pomodoro Technique](Pomodoro_Technique.md)
- Designed based on architecture specification in [architecture.md](architecture.md)
- Developed using [plan.md](plan.md) as a guide

## Contact

For questions or feedback, please open an issue in the repository.

---

**Happy Pomodoro-ing! 🍅⏱️**
