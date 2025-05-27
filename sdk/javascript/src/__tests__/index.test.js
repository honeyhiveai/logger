const { start, log, update } = require('../index');

describe('HoneyHive Logger', () => {
  const mockApiKey = 'test-api-key';
  const mockProject = 'test-project';
  const mockSessionId = 'test-session-id';
  const mockEventId = 'test-event-id';

  beforeEach(() => {
    fetch.resetMocks();
    console.error = jest.fn(); // Mock console.error
  });

  describe('start', () => {
    it('should start a session successfully', async () => {
      fetch.mockResponseOnce(JSON.stringify({ session_id: mockSessionId }));

      const sessionId = await start({
        apiKey: mockApiKey,
        project: mockProject,
      });

      expect(sessionId).toBe(mockSessionId);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should log error and return null when apiKey is missing (verbose=false)', async () => {
      const result = await start({
        project: mockProject,
      });

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('\x1b[31mHoneyHive logging error. Pass verbose=true for details.\x1b[0m');
    });

    it('should throw error when apiKey is missing (verbose=true)', async () => {
      await expect(
        start({
          project: mockProject,
          verbose: true,
        })
      ).rejects.toThrow('API key is required');
    });

    it('should log error and return null when project is missing (verbose=false)', async () => {
      const result = await start({
        apiKey: mockApiKey,
      });

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('\x1b[31mHoneyHive logging error. Pass verbose=true for details.\x1b[0m');
    });

    it('should throw error when project is missing (verbose=true)', async () => {
      await expect(
        start({
          apiKey: mockApiKey,
          verbose: true,
        })
      ).rejects.toThrow('Project name is required');
    });

    it('should log error and return null on API errors (verbose=false)', async () => {
      fetch.mockResponseOnce('Error message', { status: 400 });

      const result = await start({
        apiKey: mockApiKey,
        project: mockProject,
      });

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Error message');
    });

    it('should throw error on API errors (verbose=true)', async () => {
      fetch.mockResponseOnce('Error message', { status: 400 });

      await expect(
        start({
          apiKey: mockApiKey,
          project: mockProject,
          verbose: true,
        })
      ).rejects.toThrow('Error message');
    });
  });

  describe('log', () => {
    it('should log an event successfully', async () => {
      fetch.mockResponseOnce(JSON.stringify({ event_id: mockEventId }));

      const eventId = await log({
        apiKey: mockApiKey,
        project: mockProject,
        sessionId: mockSessionId,
        eventName: 'test-event',
      });

      expect(eventId).toBe(mockEventId);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should log error and return null on API errors (verbose=false)', async () => {
      fetch.mockResponseOnce('Error message', { status: 400 });

      const result = await log({
        apiKey: mockApiKey,
        project: mockProject,
        sessionId: mockSessionId,
        eventName: 'test-event',
      });

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Error message');
    });

    it('should throw error on API errors (verbose=true)', async () => {
      fetch.mockResponseOnce('Error message', { status: 400 });

      await expect(
        log({
          apiKey: mockApiKey,
          project: mockProject,
          sessionId: mockSessionId,
          eventName: 'test-event',
          verbose: true,
        })
      ).rejects.toThrow('Error message');
    });
  });

  describe('update', () => {
    it('should update an event successfully', async () => {
      fetch.mockResponseOnce('', { status: 200 });

      await update({
        apiKey: mockApiKey,
        eventId: mockEventId,
        feedback: { rating: 5 },
      });

      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should log error when required parameters are missing (verbose=false)', async () => {
      await update({
        apiKey: mockApiKey,
      });

      expect(console.error).toHaveBeenCalledWith('\x1b[31mHoneyHive logging error. Pass verbose=true for details.\x1b[0m');
    });

    it('should throw error when required parameters are missing (verbose=true)', async () => {
      await expect(
        update({
          apiKey: mockApiKey,
          verbose: true,
        })
      ).rejects.toThrow('Event ID is required');
    });

    it('should log error on API errors (verbose=false)', async () => {
      fetch.mockResponseOnce('Error message', { status: 400 });

      await update({
        apiKey: mockApiKey,
        eventId: mockEventId,
      });

      expect(console.error).toHaveBeenCalledWith('Error message');
    });

    it('should throw error on API errors (verbose=true)', async () => {
      fetch.mockResponseOnce('Error message', { status: 400 });

      await expect(
        update({
          apiKey: mockApiKey,
          eventId: mockEventId,
          verbose: true,
        })
      ).rejects.toThrow('Error message');
    });
  });
});    