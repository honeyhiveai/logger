const { start, log, update } = require('../index');

describe('Environment Variable Support', () => {
    const mockSessionId = 'test-session-id';
    const mockEventId = 'test-event-id';
    
    beforeEach(() => {
        fetch.resetMocks();
        console.error = jest.fn(); // Mock console.error
        
        delete process.env.HH_API_KEY;
        delete process.env.HH_PROJECT;
        delete process.env.HH_SOURCE;
        delete process.env.HH_API_URL;
    });
    
    describe('start function', () => {
        it('should read API key from environment variable', async () => {
            process.env.HH_API_KEY = 'env-api-key';
            fetch.mockResponseOnce(JSON.stringify({ session_id: mockSessionId }));
            
            const sessionId = await start({
                project: 'test-project'
            });
            
            expect(sessionId).toBe(mockSessionId);
            expect(fetch).toHaveBeenCalledTimes(1);
            expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer env-api-key');
        });
        
        it('should read project from environment variable', async () => {
            process.env.HH_PROJECT = 'env-project';
            process.env.HH_API_KEY = 'env-api-key';
            fetch.mockResponseOnce(JSON.stringify({ session_id: mockSessionId }));
            
            const sessionId = await start({});
            
            expect(sessionId).toBe(mockSessionId);
            expect(fetch).toHaveBeenCalledTimes(1);
            const requestBody = JSON.parse(fetch.mock.calls[0][1].body);
            expect(requestBody.session.project).toBe('env-project');
        });
        
        it('should read source from environment variable', async () => {
            process.env.HH_SOURCE = 'env-source';
            process.env.HH_API_KEY = 'env-api-key';
            process.env.HH_PROJECT = 'env-project';
            fetch.mockResponseOnce(JSON.stringify({ session_id: mockSessionId }));
            
            const sessionId = await start({});
            
            expect(sessionId).toBe(mockSessionId);
            expect(fetch).toHaveBeenCalledTimes(1);
            const requestBody = JSON.parse(fetch.mock.calls[0][1].body);
            expect(requestBody.session.source).toBe('env-source');
        });
        
        it('should read server URL from environment variable', async () => {
            process.env.HH_API_URL = 'https://custom-api.example.com';
            process.env.HH_API_KEY = 'env-api-key';
            process.env.HH_PROJECT = 'env-project';
            fetch.mockResponseOnce(JSON.stringify({ session_id: mockSessionId }));
            
            const sessionId = await start({});
            
            expect(sessionId).toBe(mockSessionId);
            expect(fetch).toHaveBeenCalledTimes(1);
            expect(fetch.mock.calls[0][0]).toBe('https://custom-api.example.com/session/start');
        });
        
        it('should make project optional when API key starts with hh_', async () => {
            fetch.mockResponseOnce(JSON.stringify({ session_id: mockSessionId }));
            
            const sessionId = await start({
                apiKey: 'hh_test_key'
            });
            
            expect(sessionId).toBe(mockSessionId);
            expect(fetch).toHaveBeenCalledTimes(1);
        });
        
        it('should still require project when API key does not start with hh_', async () => {
            const result = await start({
                apiKey: 'test_key'
            });
            
            expect(result).toBeNull();
            expect(console.error).toHaveBeenCalledWith('Project name is required');
        });
    });
    
    describe('log function', () => {
        it('should read API key from environment variable', async () => {
            process.env.HH_API_KEY = 'env-api-key';
            fetch.mockResponseOnce(JSON.stringify({ event_id: mockEventId }));
            
            const eventId = await log({
                project: 'test-project',
                sessionId: 'test-session',
                eventName: 'test-event'
            });
            
            expect(eventId).toBe(mockEventId);
            expect(fetch).toHaveBeenCalledTimes(1);
            expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer env-api-key');
        });
        
        it('should make project optional when API key starts with hh_', async () => {
            fetch.mockResponseOnce(JSON.stringify({ event_id: mockEventId }));
            
            const eventId = await log({
                apiKey: 'hh_test_key',
                sessionId: 'test-session',
                eventName: 'test-event'
            });
            
            expect(eventId).toBe(mockEventId);
            expect(fetch).toHaveBeenCalledTimes(1);
        });
        
        it('should allow eventName to be optional', async () => {
            fetch.mockResponseOnce(JSON.stringify({ event_id: mockEventId }));
            
            const eventId = await log({
                apiKey: 'hh_test_key',
                sessionId: 'test-session'
            });
            
            expect(eventId).toBe(mockEventId);
            expect(fetch).toHaveBeenCalledTimes(1);
        });
    });
    
    describe('update function', () => {
        it('should read API key from environment variable', async () => {
            process.env.HH_API_KEY = 'env-api-key';
            fetch.mockResponseOnce('', { status: 200 });
            
            await update({
                eventId: 'test-event-id'
            });
            
            expect(fetch).toHaveBeenCalledTimes(1);
            expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer env-api-key');
        });
        
        it('should read server URL from environment variable', async () => {
            process.env.HH_API_URL = 'https://custom-api.example.com';
            process.env.HH_API_KEY = 'env-api-key';
            fetch.mockResponseOnce('', { status: 200 });
            
            await update({
                eventId: 'test-event-id'
            });
            
            expect(fetch).toHaveBeenCalledTimes(1);
            expect(fetch.mock.calls[0][0]).toBe('https://custom-api.example.com/events');
        });
    });
});
