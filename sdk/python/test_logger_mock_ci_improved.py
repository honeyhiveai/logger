import os
import uuid
import pytest
from unittest.mock import patch, MagicMock
from honeyhive_logger import start, log, update
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

@pytest.fixture
def mock_urlopen():
    with patch('urllib.request.urlopen') as mock:
        mock_response = MagicMock()
        mock_response.read.return_value = b'{"session_id": "test-session-id", "event_id": "test-event-id"}'
        mock_response.getcode.return_value = 200
        mock.return_value = mock_response
        yield mock

def test_start_session_mock(mock_urlopen):
    # Start a new session with verbose=True to get detailed errors
    session_id = start(
        api_key="hh_test_key",
        project="test_project",
        source="sdk_test",
        session_name="test_session",
        verbose=True
    )
    
    # Verify session_id is returned correctly
    assert session_id == "test-session-id"
    
def test_log_event_mock(mock_urlopen):
    # Log an event with verbose=True to get detailed errors
    event_id = log(
        api_key="hh_test_key",
        project="test_project",
        session_id="test-session-id",
        event_name="test_event",
        event_type="model",
        inputs={"query": "test query"},
        outputs={"result": "test result"},
        verbose=True
    )
    
    # Verify event_id is returned correctly
    assert event_id == "test-event-id"

def test_update_event_mock(mock_urlopen):
    # Update an event with verbose=True to get detailed errors
    update(
        api_key="hh_test_key",
        event_id="test-event-id",
        feedback={"rating": 5},
        verbose=True
    )
    
    # Verify update was successful (no exception means success)
    assert True

def test_environment_variables_mock(mock_urlopen):
    # Set environment variables
    os.environ["HH_API_KEY"] = "env_test_key"
    os.environ["HH_PROJECT"] = "env_test_project"
    
    # Start a session without providing api_key and project
    session_id = start(
        source="sdk_test",
        verbose=True
    )
    
    # Verify session_id is returned correctly
    assert session_id == "test-session-id"
    
    # Reset environment variables
    del os.environ["HH_API_KEY"]
    del os.environ["HH_PROJECT"]
