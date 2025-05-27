import os
import uuid
import json
import pytest
from unittest.mock import patch, MagicMock
from honeyhive_logger import start, log, update
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Mock UUID for consistent testing
@pytest.fixture(autouse=True)
def mock_uuid():
    with patch('uuid.uuid4', return_value=uuid.UUID('12345678-1234-5678-1234-567812345678')):
        yield

# Mock response for HTTP requests
class MockResponse:
    def __init__(self, data, status=200):
        self.data = data
        self.status = status
        
    def read(self):
        return self.data
        
    def getcode(self):
        return self.status

# Mock urlopen to avoid actual HTTP requests
@pytest.fixture
def mock_urlopen():
    with patch('urllib.request.urlopen') as mock:
        def side_effect(req, data=None, **kwargs):
            # Parse the request data
            if data:
                request_data = json.loads(data.decode('utf-8'))
                
                # Determine response based on request URL
                if '/session/start' in req.get_full_url():
                    return MockResponse(json.dumps({
                        "session_id": "12345678-1234-5678-1234-567812345678"
                    }).encode(), 200)
                elif '/events' in req.get_full_url() and req.get_method() == 'POST':
                    return MockResponse(json.dumps({
                        "event_id": "87654321-4321-8765-4321-876543210987"
                    }).encode(), 200)
                elif '/events' in req.get_full_url() and req.get_method() == 'PUT':
                    return MockResponse(b'{}', 200)
            
            # Default response
            return MockResponse(b'{}', 200)
            
        mock.side_effect = side_effect
        yield mock

def test_start_session(mock_urlopen):
    # Start a new session
    session_id = start(
        api_key="hh_test_key",
        project="test_project",
        source="sdk_test",
        session_name="test_session",
        verbose=True
    )
    
    # Verify session_id is returned correctly
    assert session_id == "12345678-1234-5678-1234-567812345678"
    
def test_log_event(mock_urlopen):
    # Log an event
    event_id = log(
        api_key="hh_test_key",
        project="test_project",
        session_id="12345678-1234-5678-1234-567812345678",
        event_name="test_event",
        event_type="model",
        inputs={"query": "test query"},
        outputs={"result": "test result"},
        verbose=True
    )
    
    # Verify event_id is returned correctly
    assert event_id == "87654321-4321-8765-4321-876543210987"

def test_update_event(mock_urlopen):
    # Update an event
    with patch('uuid.UUID'):  # Mock UUID validation
        update(
            api_key="hh_test_key",
            event_id="87654321-4321-8765-4321-876543210987",
            feedback={"rating": 5},
            verbose=True
        )
    
    # If no exception is raised, the test passes
    assert True

def test_environment_variables(mock_urlopen):
    # Set environment variables
    os.environ["HH_API_KEY"] = "hh_env_test_key"
    os.environ["HH_PROJECT"] = "env_test_project"
    
    # Start a session without providing api_key and project
    session_id = start(
        source="sdk_test",
        verbose=True
    )
    
    # Verify session_id is returned correctly
    assert session_id == "12345678-1234-5678-1234-567812345678"
    
    # Reset environment variables
    del os.environ["HH_API_KEY"]
    del os.environ["HH_PROJECT"]
