"""
Pomodoro Timer Flask Application
"""
from flask import Flask, render_template, request, jsonify
from datetime import datetime
import os

app = Flask(__name__)


def validate_session_data(data):
    """
    Validates incoming session data.
    
    Args:
        data: Dictionary with session information
        
    Returns:
        Validated dictionary with required fields
        
    Raises:
        ValueError: If required fields are missing or invalid
    """
    required_fields = ['timestamp', 'session_type', 'status', 'duration']
    
    if not isinstance(data, dict):
        raise ValueError("Data must be a dictionary")
    
    for field in required_fields:
        if field not in data:
            raise ValueError(f"Missing required field: {field}")
    
    valid_session_types = ['WORK', 'SHORT_BREAK', 'LONG_BREAK']
    if data['session_type'] not in valid_session_types:
        raise ValueError(f"Invalid session_type. Must be one of: {valid_session_types}")
    
    valid_statuses = ['COMPLETED', 'SKIPPED', 'RESET']
    if data['status'] not in valid_statuses:
        raise ValueError(f"Invalid status. Must be one of: {valid_statuses}")
    
    return data


def format_log_entry(timestamp, session_type, status, duration):
    """
    Formats a log entry as a CSV string.
    
    Args:
        timestamp: ISO 8601 timestamp string
        session_type: Type of session (WORK, SHORT_BREAK, LONG_BREAK)
        status: Status of session (COMPLETED, SKIPPED, RESET)
        duration: Duration in MM:SS format
        
    Returns:
        CSV formatted string
    """
    return f"{timestamp},{session_type},{status},{duration}\n"


def write_to_log(entry, log_file='pomodoro_log.txt'):
    """
    Appends a log entry to the log file.
    
    Args:
        entry: Formatted log entry string
        log_file: Path to log file
        
    Returns:
        True if successful, False otherwise
    """
    try:
        with open(log_file, 'a') as f:
            f.write(entry)
        return True
    except Exception as e:
        print(f"Error writing to log: {e}")
        return False


def parse_log_entry(line):
    """
    Parses a single log line into a dictionary.
    
    Args:
        line: CSV formatted log line
        
    Returns:
        Dictionary with parsed fields or None if invalid
    """
    line = line.strip()
    if not line:
        return None
    
    parts = line.split(',')
    if len(parts) != 4:
        return None
    
    return {
        'timestamp': parts[0],
        'session_type': parts[1],
        'status': parts[2],
        'duration': parts[3]
    }


def parse_log_file(log_file='pomodoro_log.txt'):
    """
    Reads and parses the entire log file.
    
    Args:
        log_file: Path to log file
        
    Returns:
        List of dictionaries with session data
    """
    if not os.path.exists(log_file):
        return []
    
    sessions = []
    try:
        with open(log_file, 'r') as f:
            for line in f:
                entry = parse_log_entry(line)
                if entry:
                    sessions.append(entry)
    except Exception as e:
        print(f"Error reading log file: {e}")
    
    return sessions


@app.route('/')
def index():
    """Serves the main HTML page."""
    return render_template('index.html')


@app.route('/log-session', methods=['POST'])
def log_session():
    """
    Logs a session event to the log file.
    
    Expected JSON payload:
    {
        "timestamp": "2025-11-19T07:30:00Z",
        "session_type": "WORK",
        "status": "COMPLETED",
        "duration": "25:00"
    }
    """
    try:
        data = request.get_json()
        
        # Validate the incoming data
        validated_data = validate_session_data(data)
        
        # Format the log entry
        entry = format_log_entry(
            validated_data['timestamp'],
            validated_data['session_type'],
            validated_data['status'],
            validated_data['duration']
        )
        
        # Write to log file
        success = write_to_log(entry)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Session logged successfully'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to write to log file'
            }), 500
            
    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Internal server error'
        }), 500


@app.route('/history', methods=['GET'])
def get_history():
    """
    Returns the session log history as JSON.
    
    Returns:
        JSON array of session objects
    """
    try:
        sessions = parse_log_file()
        return jsonify({
            'success': True,
            'sessions': sessions,
            'count': len(sessions)
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Failed to retrieve history'
        }), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
