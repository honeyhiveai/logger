const { v4: uuidv4 } = require('uuid');

/**
 * Retry a function with exponential backoff and jitter
 * @param {Function} httpRequestFunc - The function that makes the HTTP request to retry
 * @param {Object} options - Retry options
 * @param {number} [options.maxRetries=3] - Maximum number of retry attempts
 * @param {number} [options.baseDelay=1.0] - Base delay in seconds for exponential backoff
 * @param {number} [options.maxDelay=5.0] - Maximum delay in seconds
 * @param {number} [options.timeout=5.0] - Socket timeout in seconds
 * @param {boolean} [options.verbose=false] - Whether to print debug information
 * @param {boolean} [options.verify=true] - Whether to verify SSL certificates
 * @returns {Promise<any>} The result of the function call
 */
async function _retry_with_backoff(httpRequestFunc, options = {}) {
    const {
        maxRetries = 3,
        baseDelay = 1.0,
        maxDelay = 5.0,
        timeout = 5.0,
        verbose = false,
        verify = true
    } = options;

    let lastException = null;
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout * 1000);

            const result = await httpRequestFunc(controller.signal, verify);
            clearTimeout(timeoutId);
            return result;
        } catch (error) {
            lastException = error;
            attempt++;

            // Check if error is retryable
            const isRetryableError = 
                // Network errors
                (error instanceof TypeError && error.message === 'Network error') ||
                (error instanceof Error && error.message === 'Network error') ||
                error.name === 'AbortError' ||
                // HTTP errors that should be retried
                (error.status >= 500 && error.status < 600) || // Server errors
                error.status === 429 || // Rate limiting
                error.status === 408; // Request timeout
            
            if (verbose) {
                console.error("retry attempt", attempt, "error", error);
            }

            if (!isRetryableError || attempt === maxRetries) {
                if (verbose) {
                    throw error;
                } else {
                    console.error(error.message);
                    return null;
                }
            }

            // Calculate delay with exponential backoff and jitter
            const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
            const jitter = Math.random() * delay * 0.1; // Add up to 10% jitter
            const totalDelay = delay + jitter;

            await new Promise(resolve => setTimeout(resolve, totalDelay * 1000));
        }
    }

    if (verbose) {
        throw lastException;
    } else {
        console.error(lastException.message);
        return null;
    }
}

/**
 * Start a new session with HoneyHive
 * @param {Object} params
 * @param {string} [params.apiKey] - Your HoneyHive API key. Must be provided or set via HH_API_KEY env var.
 * @param {string} [params.project] - The project name. Must be provided or set via HH_PROJECT env var.
 * @param {string} [params.sessionName] - Optional tag to filter sessions on "v1", "au1i249c" (commit hash), etc. Defaults to project name.
 * @param {string} [params.source="dev"] - Environment where the code is running. Defaults to "dev" or HH_SOURCE env var.
 * @param {Object} [params.config] - Configuration details for the session like experiment versions, model names, etc.
 * @param {Object} [params.inputs] - Input parameters for the session.
 * @param {Object} [params.metadata] - Additional metadata for the session.
 * @param {Object} [params.userProperties] - User-defined properties for the session.
 * @param {string} [params.sessionId] - A valid UUIDv4 for the session to correlate with your logs. If not provided, one will be generated.
 * @param {string} [params.serverUrl="https://api.honeyhive.ai"] - HoneyHive API server URL. Defaults to "https://api.honeyhive.ai" or HH_API_URL env var.
 * @param {boolean} [params.verbose=false] - Print detailed error messages for debugging. Defaults to false.
 * @param {boolean} [params.verify=true] - Whether to verify SSL certificates. Defaults to true.
 * @returns {Promise<string>} The session ID (UUIDv4)
 */
async function start(params) {
    const {
        apiKey,
        project,
        sessionName,
        source = "dev",
        config = {},
        inputs = {},
        metadata = {},
        userProperties = {},
        sessionId,
        serverUrl = "https://api.honeyhive.ai",
        verbose = false,
        verify = true
    } = params;

    try {
        if (!apiKey) {
            const error = "API key is required";
            console.error(error);
            throw new Error(error);
        }
        if (!project) {
            const error = "Project name is required";
            console.error(error);
            throw new Error(error);
        }

        const makeRequest = async (signal, verify) => {
            const response = await fetch(`${serverUrl}/session/start`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    session: {
                        project,
                        session_name: sessionName || project,
                        source,
                        session_id: sessionId,
                        config,
                        inputs,
                        metadata,
                        user_properties: userProperties,
                        start_time: Date.now()
                    }
                }),
                signal,
                // @ts-ignore - agent is a valid option in Node.js
                agent: verify ? undefined : new (require('https').Agent)({ rejectUnauthorized: false })
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error);
            }

            const data = await response.json();
            if (!data.session_id) {
                throw new Error('Invalid response from server: session_id not found');
            }

            return data.session_id;
        };

        return await _retry_with_backoff(makeRequest, { verbose, verify });
    } catch (error) {
        if (verbose) {
            throw error;
        }
        console.error(error.message);
        return null;
    }
}

/**
 * Log an event to HoneyHive
 * @param {Object} params
 * @param {string} [params.apiKey] - Your HoneyHive API key. Must be provided or set via HH_API_KEY env var.
 * @param {string} [params.project] - The project name. Must be provided or set via HH_PROJECT env var.
 * @param {string} [params.source="dev"] - Environment where the code is running. Defaults to "dev" or HH_SOURCE env var.
 * @param {string} params.eventName - Name of the event being logged. Required.
 * @param {string} [params.eventType="tool"] - Type of event - "model", "tool", or "chain". Defaults to "tool".
 * @param {Object} [params.config] - Configuration details for the event like model name, vector index name, etc.
 * @param {Object} [params.inputs] - Input parameters for the event.
 * @param {Object} [params.outputs] - Output data from the event.
 * @param {Object} [params.metadata] - Additional metadata for the event.
 * @param {string} params.sessionId - The ID of the session to log the event under. If not provided, a session is automatically created.
 * @param {number} [params.durationMs=10] - Duration of the event in milliseconds. If not provided, will be set to 10.
 * @param {string} [params.serverUrl="https://api.honeyhive.ai"] - HoneyHive API server URL. Defaults to "https://api.honeyhive.ai" or HH_API_URL env var.
 * @param {boolean} [params.verbose=false] - Print detailed error messages for debugging. Defaults to false.
 * @param {boolean} [params.verify=true] - Whether to verify SSL certificates. Defaults to true.
 * @returns {Promise<string>} The event ID (UUIDv4)
 */
async function log(params) {
    const {
        apiKey,
        project,
        sessionId: providedSessionId,
        eventName,
        eventType = "tool",
        source = "dev",
        durationMs = 10,
        config = {},
        inputs = {},
        outputs = {},
        metadata = {},
        serverUrl = "https://api.honeyhive.ai",
        verbose = false,
        verify = true
    } = params;

    try {
        if (!apiKey) {
            const error = "API key is required";
            console.error(error);
            throw new Error(error);
        }
        if (!project) {
            const error = "Project name is required";
            console.error(error);
            throw new Error(error);
        }
        if (!eventName) {
            const error = "Event name is required";
            console.error(error);
            throw new Error(error);
        }

        const sessionId = providedSessionId || uuidv4();

        const makeRequest = async (signal, verify) => {
            const response = await fetch(`${serverUrl}/events`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    event: {
                        session_id: sessionId,
                        project,
                        event_name: eventName,
                        event_type: eventType,
                        config,
                        inputs,
                        outputs,
                        metadata,
                        source,
                        start_time: Date.now(),
                        duration: durationMs
                    }
                }),
                signal,
                // @ts-ignore - agent is a valid option in Node.js
                agent: verify ? undefined : new (require('https').Agent)({ rejectUnauthorized: false })
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error);
            }

            const data = await response.json();
            if (!data.event_id) {
                throw new Error('Invalid response from server: event_id not found');
            }

            return data.event_id;
        };

        return await _retry_with_backoff(makeRequest, { verbose, verify });
    } catch (error) {
        if (verbose) {
            throw error;
        }
        console.error(error.message);
        return null;
    }
}

/**
 * Update an event or session with additional data
 * @param {Object} params
 * @param {string} [params.apiKey] - Your HoneyHive API key. Must be provided or set via HH_API_KEY env var.
 * @param {string} params.eventId - The ID to update. This can be either:
 *   - A session_id returned from start()
 *   - An event_id returned from log()
 * @param {Object} [params.metadata] - Additional metadata for the event/session.
 * @param {Object} [params.feedback] - User feedback for the event/session.
 * @param {Object} [params.metrics] - Metrics computed for the event/session.
 * @param {Object} [params.config] - Configuration used in the event/session.
 * @param {Object} [params.outputs] - Output data from the event/session.
 * @param {Object} [params.userProperties] - User-defined properties for the event/session.
 * @param {number} [params.durationMs] - Duration of the event in milliseconds.
 * @param {string} [params.serverUrl="https://api.honeyhive.ai"] - HoneyHive API server URL. Defaults to "https://api.honeyhive.ai" or HH_API_URL env var.
 * @param {boolean} [params.verbose=false] - Print detailed error messages for debugging. Defaults to false.
 * @param {boolean} [params.verify=true] - Whether to verify SSL certificates. Defaults to true.
 * @returns {Promise<void>}
 */
async function update(params) {
    const {
        apiKey,
        eventId,
        feedback,
        metrics,
        metadata,
        config,
        outputs,
        userProperties,
        durationMs,
        serverUrl = "https://api.honeyhive.ai",
        verbose = false,
        verify = true
    } = params;

    try {
        if (!apiKey) {
            const error = "API key is required";
            console.error(error);
            throw new Error(error);
        }
        if (!eventId) {
            const error = "Event ID is required";
            console.error(error);
            throw new Error(error);
        }

        const updateRequest = {
            url: `${serverUrl}/events`,
            event_id: eventId,
            metadata: metadata ?? null,
            feedback: feedback ?? null,
            metrics: metrics ?? null,
            outputs: outputs ?? null,
            duration: durationMs ?? null,
            config: config ?? null,
        };

        if (verbose) {
            console.log("update request", updateRequest);
        }

        const makeRequest = async (signal, verify) => {
            const response = await fetch(`${serverUrl}/events`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    event_id: eventId,
                    metadata: metadata ?? null,
                    feedback: feedback ?? null,
                    metrics: metrics ?? null,
                    outputs: outputs ?? null,
                    duration: durationMs ?? null,
                    config: config ?? null,
                    user_properties: userProperties ?? null
                }),
                signal,
                // @ts-ignore - agent is a valid option in Node.js
                agent: verify ? undefined : new (require('https').Agent)({ rejectUnauthorized: false })
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error);
            }
        };

        await _retry_with_backoff(makeRequest, { verbose, verify });
    } catch (error) {
        if (verbose) {
            throw error;
        }
        console.error(error.message);
    }
}

module.exports = {
    start,
    log,
    update
}; 