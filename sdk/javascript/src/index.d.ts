/**
 * Configuration options for retry mechanism
 */
export interface RetryOptions {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    timeout?: number;
    verbose?: boolean;
}

/**
 * Session configuration parameters
 */
export interface SessionParams {
    apiKey?: string;
    project?: string;
    sessionName?: string;
    source?: string;
    config?: Record<string, any>;
    inputs?: Record<string, any>;
    metadata?: Record<string, any>;
    userProperties?: Record<string, any>;
    sessionId?: string;
    serverUrl?: string;
    verbose?: boolean;
}

/**
 * Event logging parameters
 */
export interface LogParams {
    apiKey?: string;
    project?: string;
    sessionId?: string;
    eventName: string;
    eventType?: 'model' | 'tool' | 'chain';
    source?: string;
    durationMs?: number;
    config?: Record<string, any>;
    inputs?: Record<string, any>;
    outputs?: Record<string, any>;
    metadata?: Record<string, any>;
    serverUrl?: string;
    verbose?: boolean;
}

/**
 * Event update parameters
 */
export interface UpdateParams {
    apiKey?: string;
    eventId: string;
    metadata?: Record<string, any>;
    feedback?: Record<string, any>;
    metrics?: Record<string, any>;
    config?: Record<string, any>;
    outputs?: Record<string, any>;
    userProperties?: Record<string, any>;
    durationMs?: number;
    serverUrl?: string;
    verbose?: boolean;
}

/**
 * Start a new session with HoneyHive
 * @param params Session configuration parameters
 * @returns Promise resolving to the session ID (UUIDv4) or undefined if failed
 */
declare function start(params: SessionParams): Promise<string | undefined>;

/**
 * Log an event to HoneyHive
 * @param params Event logging parameters
 * @returns Promise resolving to the event ID (UUIDv4) or undefined if failed
 */
declare function log(params: LogParams): Promise<string | undefined>;

/**
 * Update an event or session with additional data
 * @param params Event update parameters
 * @returns Promise that resolves when the update is complete
 */
declare function update(params: UpdateParams): Promise<void>;

export { start, log, update }; 