# Quick Start Guide

## Start the Application (3 Steps)

1. **Activate virtual environment**:
   ```bash
   source .venv/bin/activate
   ```

2. **Start the server**:
   ```bash
   python app.py
   ```

3. **Open browser**:
   Go to `http://localhost:5000`

## Keyboard Shortcuts

- `Space` - Start/Pause
- `R` - Reset
- `S` - Skip
- `Esc` - Close settings

## Default Pomodoro Settings

- Work: 25 minutes
- Short Break: 5 minutes
- Long Break: 20 minutes
- Long break after: 4 work sessions

## Running Tests

```bash
source .venv/bin/activate
pytest test_app.py -v
```

Expected: **20 passed**

## Troubleshooting

**Port 5000 already in use?**
```bash
# Kill the process using port 5000
lsof -ti:5000 | xargs kill -9
```

**Dependencies issue?**
```bash
pip install -r requirements.txt
```

**Tests failing?**
```bash
# Ensure virtual environment is activated
source .venv/bin/activate
# Reinstall dependencies
pip install -r requirements.txt
```

## Project Files

- `app.py` - Flask backend
- `test_app.py` - Tests
- `templates/index.html` - UI
- `static/js/` - JavaScript modules
- `static/css/style.css` - Styling
- `pomodoro_log.txt` - Session log (auto-created)

For complete documentation, see `PROJECT_README.md`
