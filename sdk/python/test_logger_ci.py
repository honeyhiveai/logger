import os
import honeyhive
from honeyhive_logger import start, log, update
import uuid
import time
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def test_start_session():
    # Start a new session
    session_id = start(
        api_key=os.environ["HH_API_KEY"],
        project=os.environ["HH_PROJECT"],
        source="sdk_test",
        session_name="test_session",
        server_url=os.environ["HH_API_URL"]
    )
    
    # Verify session_id is a valid UUID
    assert session_id is not None
    try:
        uuid.UUID(session_id)
    except ValueError:
        assert False, "session_id is not a valid UUID"

def test_start_session_with_metadata():
    # Test starting session with additional metadata
    metadata = {
        "test_key": "test_value",
        "version": "1.0.0"
    }
    
    session_id = start(
        api_key=os.environ["HH_API_KEY"],
        project=os.environ["HH_PROJECT"],
        source="sdk_test",
        session_name="test_session_with_metadata",
        metadata=metadata,
        server_url=os.environ["HH_API_URL"]
    )
    
    # Verify session_id is a valid UUID
    assert session_id is not None
    try:
        uuid.UUID(session_id)
    except ValueError:
        assert False, "session_id is not a valid UUID"

def test_log_event():
    # First start a session
    session_id = start(
        source="sdk_test",
        session_name="test_log_event"
    )
    
    # Log an event
    event_name = "test_event"
    inputs = {"query": "test query"}
    outputs = {"result": "test result"}
    metadata = {"test_meta": "test_value"}
    
    event_id = log(
        session_id=session_id,
        event_name=event_name,
        event_type="model",
        config={"model": "test-model"},
        inputs=inputs,
        outputs=outputs,
        metadata=metadata,
        duration_ms=100
    )
    
    # Verify event_id is a valid UUID
    assert event_id is not None
    try:
        uuid.UUID(event_id)
    except ValueError:
        assert False, "event_id is not a valid UUID"

def test_log_event_with_metrics():
    # Start a session
    session_id = start(
        source="sdk_test",
        session_name="test_log_event_with_metrics"
    )
    
    # Log an event
    event_id = log(
        session_id=session_id,
        event_name="test_event_with_metrics",
        event_type="model",
        config={"model": "test-model"},
    )
    
    # Update event with metrics
    update(
        event_id=event_id,
        metrics={
            "latency": 0.5,
            "tokens_used": 100
        }
    )
    
    # Verify event_id is a valid UUID
    assert event_id is not None
    try:
        uuid.UUID(event_id)
    except ValueError:
        assert False, "event_id is not a valid UUID"
