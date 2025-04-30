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

## Documentation

For detailed documentation, please visit [https://docs.honeyhive.ai](https://docs.honeyhive.ai)

## License

MIT License
