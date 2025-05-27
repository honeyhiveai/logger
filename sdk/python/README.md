# HoneyHive Logger

A Python logger for HoneyHive that helps you track and monitor your AI applications.

## Installation

```bash
pip install honeyhive-logger
```

## Usage

```python
from honeyhive_logger import start, log, update

# Start a new session
session_id = start(
    api_key="your-api-key",
    project="your-project"
)

# Log an event
event_id = log(
    session_id=session_id,
    event_name="model_inference",
    event_type="model",
    inputs={"prompt": "Hello world"},
    outputs={"response": "Hi there!"}
)

# Update an event with additional data
update(
    event_id=event_id, # Can also pass session_id to update a session
    feedback={"rating": 5},
    metrics={"latency": 100}
)
```

## API Reference

### `start()`

Starts a new session with HoneyHive.

**Parameters:**
- `api_key` (str, optional): Your HoneyHive API key. Must be provided or set via HH_API_KEY env var.
- `project` (str, optional): The project name. Must be provided or set via HH_PROJECT env var.
- `session_name` (str, optional): Optional tag to filter sessions on "v1", "au1i249c" (commit hash), etc. Defaults to project name.
- `source` (str, optional): Environment where the code is running. Defaults to "dev" or HH_SOURCE env var.
- `config` (dict, optional): Configuration details for the session like experiment versions, model names, etc.
- `inputs` (dict, optional): Input parameters for the session.
- `metadata` (dict, optional): Additional metadata for the session.
- `user_properties` (dict, optional): User-defined properties for the session.
- `session_id` (str, optional): A valid UUIDv4 for the session to correlate with your logs. If not provided, one will be generated.
- `server_url` (str, optional): HoneyHive API server URL. Defaults to "https://api.honeyhive.ai" or HH_API_URL env var.
- `verbose` (bool, optional): Print detailed error messages for debugging. Defaults to False.

**Returns:**
- `str`: The session ID (UUIDv4)

**Example:**
```python
session_id = start(
    api_key="your-api-key",
    project="your-project",
    session_name="v1",
    source="prod",
    config={
        "model": "gpt-4",
        "temperature": 0.7
    }
)
```

### `log()`

Logs an event to HoneyHive.

**Parameters:**
- `api_key` (str, optional): Your HoneyHive API key. Must be provided or set via HH_API_KEY env var.
- `project` (str, optional): The project name. Must be provided or set via HH_PROJECT env var.
- `source` (str, optional): Environment where the code is running. Defaults to "dev" or HH_SOURCE env var.
- `event_name` (str): Name of the event being logged. Required.
- `event_type` (str, optional): Type of event - "model", "tool", or "chain". Defaults to "tool".
- `config` (dict, optional): Configuration details for the event like model name, vector index name, etc.
- `inputs` (dict, optional): Input parameters for the event.
- `outputs` (dict, optional): Output data from the event.
- `metadata` (dict, optional): Additional metadata for the event.
- `session_id` (str): The ID of the session to log the event under. If not provided, a session is automatically created.
- `duration_ms` (int, optional): Duration of the event in milliseconds. If not provided, will be set to 10.
- `server_url` (str, optional): HoneyHive API server URL. Defaults to "https://api.honeyhive.ai" or HH_API_URL env var.
- `verbose` (bool, optional): Print detailed error messages for debugging. Defaults to False.

**Returns:**
- `str`: The event ID (UUIDv4)

**Example:**
```python
event_id = log(
    session_id="your-session-id",
    event_name="model_inference",
    event_type="model",
    config={
        "model": "gpt-4",
        "temperature": 0.7
    },
    inputs={
        "prompt": "Hello world"
    },
    outputs={
        "response": "Hi there!"
    }
)
```

### `update()`

Updates an event or session with additional data.

**Parameters:**
- `api_key` (str, optional): Your HoneyHive API key. Must be provided or set via HH_API_KEY env var.
- `event_id` (str): The ID to update. This can be either:
  - A session_id returned from start()
  - An event_id returned from log()
- `metadata` (dict, optional): Additional metadata for the event/session.
- `feedback` (dict, optional): User feedback for the event/session.
- `metrics` (dict, optional): Metrics computed for the event/session.
- `config` (dict, optional): Configuration used in the event/session.
- `outputs` (dict, optional): Output data from the event/session.
- `user_properties` (dict, optional): User-defined properties for the event/session.
- `duration_ms` (int, optional): Duration of the event in milliseconds.
- `server_url` (str, optional): HoneyHive API server URL. Defaults to "https://api.honeyhive.ai" or HH_API_URL env var.
- `verbose` (bool, optional): Print detailed error messages for debugging. Defaults to False.

**Returns:**
- `None`

**Example:**
```python
# Update a session
update(
    event_id=session_id,
    metadata={
        "status": "completed"
    }
)

# Update an event
update(
    event_id=event_id,
    feedback={
        "rating": 5,
        "comment": "Great response!"
    },
    metrics={
        "latency": 100,
        "tokens": 50
    }
)
```

## Error Handling

Without `verbose` set to True, all errors are swallowed.

If true, the logger will raise exceptions for:
- Invalid API keys
- Network errors
- Invalid parameters
- Server errors

Each error includes detailed information about what went wrong and how to fix it. For example:
- Missing required parameters
- Invalid event types
- API key or project not found
- Network connectivity issues
- Server-side errors

## SSL Certificate Handling

The logger uses HTTPS for secure communication with the HoneyHive API. If you encounter SSL certificate verification errors, here are some solutions:

### Using a Custom CA Bundle

You can specify a custom certificate authority (CA) bundle file when making requests:

```python
start(
    api_key="your-api-key",
    project="your-project",
    ca_bundle_path="/path/to/custom/ca-bundle.crt"
)
```

This is useful when:
- You're behind a corporate proxy that uses custom certificates
- Your system's certificate store is outdated
- You need to trust specific self-signed certificates

### Other Solutions

1. **Update System Certificates**:
   - On macOS: `brew install ca-certificates`
   - On Ubuntu/Debian: `sudo apt-get install ca-certificates`
   - On CentOS/RHEL: `sudo yum install ca-certificates`

2. **Environment Variable**:
   Set the `REQUESTS_CA_BUNDLE` or `CURL_CA_BUNDLE` environment variable:
   ```bash
   export REQUESTS_CA_BUNDLE=/path/to/custom/ca-bundle.crt
   ```

3. **Corporate Proxy/VPN**:
   - Export your proxy's root certificate and add it to your system's trust store
   - Or use the custom CA bundle approach with your proxy's certificate
   - Ensure your VPN is properly configured to handle HTTPS traffic

## Development

### Testing

Run the test suite:

```bash
pytest
```

### Linting

Check code style with flake8 (if installed):

```bash
flake8 honeyhive_logger
```

## Documentation

For detailed documentation, please visit [https://docs.honeyhive.ai](https://docs.honeyhive.ai)

## License

MIT License
