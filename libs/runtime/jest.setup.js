import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';
import { WebSocket } from 'mock-socket';

enableFetchMocks();
fetchMock.dontMock();

process.env.DECI_API_URL = 'http://localhost:3333';
process.env.DECI_MAX_RETRY_INTERVAL_MS = 3000;
process.env.DECI_MAX_RECONNECT_MS = 3000;
process.env.DECI_SEND_CHANGES_DEBOUNCE_MS = 50;
process.env.DECI_DEBOUNCE_PROCESS_SLATE_OPS = 50;

window.WebSocket = WebSocket;
