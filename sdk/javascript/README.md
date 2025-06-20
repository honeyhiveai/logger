# HoneyHive Logger

A JavaScript logger for HoneyHive that helps you track and monitor your AI applications.

## Installation

```bash
npm install @honeyhive/logger
```

## Usage

```javascript
const { start, log, update } = require('@honeyhive/logger');

// Start a new session
// Tip: Copy paste the values from the in-platform quickstart here
const sessionId = await start({
    apiKey: "your-api-key",
    project: "your-project"
});

// Log an event
const eventId = await log({
    sessionId: sessionId,
    apiKey: "your-api-key",
    eventName: "model_inference",
    eventType: "model",
    inputs: { prompt: "Hello world" },
    outputs: { response: "Hi there!" }
});

// Update an event with additional data
await update({
    eventId: eventId, // Can also pass sessionId to update a session
    apiKey: "your-api-key",
    feedback: { rating: 5 },
    metrics: { latency: 100 }
});
```

Make sure to set `serverUrl` correctly if you are on a dedicated or on-prem deployment.

## API Reference

### `start(options)`

Starts a new session with HoneyHive.

**Parameters:**
- `options` (Object):
  - `apiKey` (string, optional): Your HoneyHive API key. Must be provided or set via HH_API_KEY env var.
  - `project` (string, optional): The project name. Must be provided or set via HH_PROJECT env var.
  - `sessionName` (string, optional): Optional tag to filter sessions on "v1", "au1i249c" (commit hash), etc. Defaults to project name.
  - `source` (string, optional): Environment where the code is running. Defaults to "dev" or HH_SOURCE env var.
  - `config` (Object, optional): Configuration details for the session like experiment versions, model names, etc.
  - `inputs` (Object, optional): Input parameters for the session.
  - `metadata` (Object, optional): Additional metadata for the session.
  - `userProperties` (Object, optional): User-defined properties for the session.
  - `sessionId` (string, optional): A valid UUIDv4 for the session to correlate with your logs. If not provided, one will be generated.
  - `serverUrl` (string, optional): HoneyHive API server URL. Defaults to "https://api.honeyhive.ai" or HH_API_URL env var.
  - `verbose` (boolean, optional): Print detailed error messages for debugging. Defaults to false.
  - `verify` (boolean, optional): Whether to verify SSL certificates. Defaults to true. Set to false to disable SSL verification (not recommended for production).

**Returns:**
- `Promise<string>`: The session ID (UUIDv4)

**Example:**
```javascript
const sessionId = await start({
    apiKey: "your-api-key",
    project: "your-project",
    sessionName: "v1",
    source: "prod",
    config: {
        model: "gpt-4",
        temperature: 0.7
    }
});
```

### `log(options)`

Logs an event to HoneyHive.

**Parameters:**
- `options` (Object):
  - `apiKey` (string, optional): Your HoneyHive API key. Must be provided or set via HH_API_KEY env var.
  - `project` (string, optional): The project name. Must be provided or set via HH_PROJECT env var.
  - `source` (string, optional): Environment where the code is running. Defaults to "dev" or HH_SOURCE env var.
  - `eventName` (string): Name of the event being logged. Required.
  - `eventType` (string, optional): Type of event - "model", "tool", or "chain". Defaults to "tool".
  - `config` (Object, optional): Configuration details for the event like model name, vector index name, etc.
  - `inputs` (Object, optional): Input parameters for the event.
  - `outputs` (Object, optional): Output data from the event.
  - `metadata` (Object, optional): Additional metadata for the event.
  - `sessionId` (string): The ID of the session to log the event under. If not provided, a session is automatically created.
  - `durationMs` (number, optional): Duration of the event in milliseconds. If not provided, will be set to 10.
  - `serverUrl` (string, optional): HoneyHive API server URL. Defaults to "https://api.honeyhive.ai" or HH_API_URL env var.
  - `verbose` (boolean, optional): Print detailed error messages for debugging. Defaults to false.
  - `verify` (boolean, optional): Whether to verify SSL certificates. Defaults to true. Set to false to disable SSL verification (not recommended for production).

**Returns:**
- `Promise<string>`: The event ID (UUIDv4)

**Example:**
```javascript
const eventId = await log({
    sessionId: "your-session-id",
    apiKey: "your-api-key",
    eventName: "model_inference",
    eventType: "model",
    config: {
        model: "gpt-4",
        temperature: 0.7
    },
    inputs: {
        prompt: "Hello world"
    },
    outputs: {
        response: "Hi there!"
    }
});
```

### `update(options)`

Updates an event or session with additional data.

**Parameters:**
- `options` (Object):
  - `apiKey` (string, optional): Your HoneyHive API key. Must be provided or set via HH_API_KEY env var.
  - `eventId` (string): The ID to update. This can be either:
    - A session_id returned from start()
    - An event_id returned from log()
  - `metadata` (Object, optional): Additional metadata for the event/session.
  - `feedback` (Object, optional): User feedback for the event/session.
  - `metrics` (Object, optional): Metrics computed for the event/session.
  - `config` (Object, optional): Configuration used in the event/session.
  - `outputs` (Object, optional): Output data from the event/session.
  - `userProperties` (Object, optional): User-defined properties for the event/session.
  - `durationMs` (number, optional): Duration of the event in milliseconds.
  - `serverUrl` (string, optional): HoneyHive API server URL. Defaults to "https://api.honeyhive.ai" or HH_API_URL env var.
  - `verbose` (boolean, optional): Print detailed error messages for debugging. Defaults to false.
  - `verify` (boolean, optional): Whether to verify SSL certificates. Defaults to true. Set to false to disable SSL verification (not recommended for production).

**Returns:**
- `Promise<void>`

**Example:**
```javascript
// Update a session
await update({
    eventId: sessionId,
    metadata: {
        status: "completed"
    }
});

// Update an event
await update({
    eventId: eventId,
    apiKey: "your-api-key",
    feedback: {
        rating: 5,
        comment: "Great response!"
    },
    metrics: {
        latency: 100,
        tokens: 50
    }
});
```

## Error Handling

The logger will throw errors for:
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

The logger uses HTTPS for secure communication with the HoneyHive API. You can control SSL certificate verification using the `verify` option:

```javascript
// Disable SSL verification (not recommended for production)
await start({
    apiKey: "your-api-key",
    project: "your-project",
    verify: false
});

// Use default SSL verification (recommended)
await start({
    apiKey: "your-api-key",
    project: "your-project",
    verify: true
});
```

⚠️ **Warning**: Disabling SSL verification is not recommended for production use as it makes your connections vulnerable to man-in-the-middle attacks. Only use this option for development or testing purposes.

## Documentation

For detailed documentation, please visit [https://docs.honeyhive.ai](https://docs.honeyhive.ai)

## License

MIT License 