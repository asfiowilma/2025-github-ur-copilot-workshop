"""
Tests for Pomodoro Timer Flask Application
"""
import pytest
import os
import tempfile
from app import (
    app, 
    validate_session_data, 
    format_log_entry, 
    write_to_log, 
    parse_log_entry,
    parse_log_file
)


@pytest.fixture
def client():
    """Flask test client fixture."""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


@pytest.fixture
def temp_log_file():
    """Creates a temporary log file for testing."""
    fd, path = tempfile.mkstemp(suffix='.txt')
    os.close(fd)
    yield path
    # Cleanup
    if os.path.exists(path):
        os.remove(path)


# Tests for validate_session_data
def test_validate_session_data_valid():
    """Test validation with valid data."""
    data = {
        'timestamp': '2025-11-19T07:30:00Z',
        'session_type': 'WORK',
        'status': 'COMPLETED',
        'duration': '25:00'
    }
    result = validate_session_data(data)
    assert result == data


def test_validate_session_data_missing_field():
    """Test validation with missing required field."""
    data = {
        'timestamp': '2025-11-19T07:30:00Z',
        'session_type': 'WORK',
        'status': 'COMPLETED'
    }
    with pytest.raises(ValueError, match="Missing required field: duration"):
        validate_session_data(data)


def test_validate_session_data_invalid_session_type():
    """Test validation with invalid session type."""
    data = {
        'timestamp': '2025-11-19T07:30:00Z',
        'session_type': 'INVALID',
        'status': 'COMPLETED',
        'duration': '25:00'
    }
    with pytest.raises(ValueError, match="Invalid session_type"):
        validate_session_data(data)


def test_validate_session_data_invalid_status():
    """Test validation with invalid status."""
    data = {
        'timestamp': '2025-11-19T07:30:00Z',
        'session_type': 'WORK',
        'status': 'INVALID',
        'duration': '25:00'
    }
    with pytest.raises(ValueError, match="Invalid status"):
        validate_session_data(data)


def test_validate_session_data_not_dict():
    """Test validation with non-dictionary input."""
    with pytest.raises(ValueError, match="Data must be a dictionary"):
        validate_session_data("not a dict")


# Tests for format_log_entry
def test_format_log_entry():
    """Test log entry formatting."""
    entry = format_log_entry(
        '2025-11-19T07:30:00Z',
        'WORK',
        'COMPLETED',
        '25:00'
    )
    assert entry == '2025-11-19T07:30:00Z,WORK,COMPLETED,25:00\n'


# Tests for write_to_log
def test_write_to_log_success(temp_log_file):
    """Test successful write to log file."""
    entry = '2025-11-19T07:30:00Z,WORK,COMPLETED,25:00\n'
    result = write_to_log(entry, temp_log_file)
    assert result is True
    
    # Verify content
    with open(temp_log_file, 'r') as f:
        content = f.read()
    assert content == entry


def test_write_to_log_multiple_entries(temp_log_file):
    """Test writing multiple entries to log file."""
    entry1 = '2025-11-19T07:30:00Z,WORK,COMPLETED,25:00\n'
    entry2 = '2025-11-19T07:55:00Z,SHORT_BREAK,COMPLETED,05:00\n'
    
    write_to_log(entry1, temp_log_file)
    write_to_log(entry2, temp_log_file)
    
    # Verify both entries
    with open(temp_log_file, 'r') as f:
        content = f.read()
    assert entry1 in content
    assert entry2 in content


# Tests for parse_log_entry
def test_parse_log_entry_valid():
    """Test parsing a valid log entry."""
    line = '2025-11-19T07:30:00Z,WORK,COMPLETED,25:00\n'
    result = parse_log_entry(line)
    
    assert result == {
        'timestamp': '2025-11-19T07:30:00Z',
        'session_type': 'WORK',
        'status': 'COMPLETED',
        'duration': '25:00'
    }


def test_parse_log_entry_empty():
    """Test parsing an empty line."""
    result = parse_log_entry('')
    assert result is None


def test_parse_log_entry_invalid():
    """Test parsing an invalid line."""
    line = 'invalid,data'
    result = parse_log_entry(line)
    assert result is None


# Tests for parse_log_file
def test_parse_log_file_nonexistent():
    """Test parsing a non-existent file."""
    result = parse_log_file('nonexistent_file.txt')
    assert result == []


def test_parse_log_file_with_entries(temp_log_file):
    """Test parsing a file with multiple entries."""
    # Write test data
    with open(temp_log_file, 'w') as f:
        f.write('2025-11-19T07:30:00Z,WORK,COMPLETED,25:00\n')
        f.write('2025-11-19T07:55:00Z,SHORT_BREAK,COMPLETED,05:00\n')
        f.write('2025-11-19T08:00:00Z,WORK,SKIPPED,10:00\n')
    
    result = parse_log_file(temp_log_file)
    
    assert len(result) == 3
    assert result[0]['session_type'] == 'WORK'
    assert result[1]['session_type'] == 'SHORT_BREAK'
    assert result[2]['status'] == 'SKIPPED'


def test_parse_log_file_with_empty_lines(temp_log_file):
    """Test parsing a file with empty lines."""
    # Write test data with empty lines
    with open(temp_log_file, 'w') as f:
        f.write('2025-11-19T07:30:00Z,WORK,COMPLETED,25:00\n')
        f.write('\n')
        f.write('2025-11-19T07:55:00Z,SHORT_BREAK,COMPLETED,05:00\n')
    
    result = parse_log_file(temp_log_file)
    
    assert len(result) == 2


# Tests for Flask routes
def test_index_route(client):
    """Test the index route."""
    response = client.get('/')
    assert response.status_code == 200


def test_log_session_route_success(client, temp_log_file, monkeypatch):
    """Test successful session logging."""
    # Temporarily change the log file location
    monkeypatch.setattr('app.write_to_log', 
                       lambda entry, log_file='pomodoro_log.txt': write_to_log(entry, temp_log_file))
    
    data = {
        'timestamp': '2025-11-19T07:30:00Z',
        'session_type': 'WORK',
        'status': 'COMPLETED',
        'duration': '25:00'
    }
    
    response = client.post('/log-session',
                          json=data,
                          content_type='application/json')
    
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['success'] is True


def test_log_session_route_invalid_data(client):
    """Test session logging with invalid data."""
    data = {
        'timestamp': '2025-11-19T07:30:00Z',
        'session_type': 'INVALID',
        'status': 'COMPLETED',
        'duration': '25:00'
    }
    
    response = client.post('/log-session',
                          json=data,
                          content_type='application/json')
    
    assert response.status_code == 400
    json_data = response.get_json()
    assert json_data['success'] is False


def test_log_session_route_missing_field(client):
    """Test session logging with missing field."""
    data = {
        'timestamp': '2025-11-19T07:30:00Z',
        'session_type': 'WORK',
        'status': 'COMPLETED'
    }
    
    response = client.post('/log-session',
                          json=data,
                          content_type='application/json')
    
    assert response.status_code == 400
    json_data = response.get_json()
    assert json_data['success'] is False


def test_history_route(client, temp_log_file, monkeypatch):
    """Test the history route."""
    # Create test log file with data
    with open(temp_log_file, 'w') as f:
        f.write('2025-11-19T07:30:00Z,WORK,COMPLETED,25:00\n')
        f.write('2025-11-19T07:55:00Z,SHORT_BREAK,COMPLETED,05:00\n')
    
    # Temporarily change the log file location
    monkeypatch.setattr('app.parse_log_file',
                       lambda log_file='pomodoro_log.txt': parse_log_file(temp_log_file))
    
    response = client.get('/history')
    
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['success'] is True
    assert json_data['count'] == 2
    assert len(json_data['sessions']) == 2


def test_history_route_empty(client, monkeypatch):
    """Test the history route with no sessions."""
    monkeypatch.setattr('app.parse_log_file',
                       lambda log_file='pomodoro_log.txt': [])
    
    response = client.get('/history')
    
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['success'] is True
    assert json_data['count'] == 0
    assert json_data['sessions'] == []
