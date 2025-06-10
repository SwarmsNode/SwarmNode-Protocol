// Test setup file
import 'jest';

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidAddress(): R;
      toBeValidTransactionHash(): R;
      toHaveValidSwarmBalance(): R;
    }
  }
}

// Custom Jest matchers for blockchain testing
expect.extend({
  toBeValidAddress(received: string) {
    const isValid = /^0x[a-fA-F0-9]{40}$/.test(received);
    return {
      message: () => `expected ${received} to be a valid Ethereum address`,
      pass: isValid,
    };
  },
  
  toBeValidTransactionHash(received: string) {
    const isValid = /^0x[a-fA-F0-9]{64}$/.test(received);
    return {
      message: () => `expected ${received} to be a valid transaction hash`,
      pass: isValid,
    };
  },
  
  toHaveValidSwarmBalance(received: string) {
    const isValid = !isNaN(parseFloat(received)) && parseFloat(received) >= 0;
    return {
      message: () => `expected ${received} to be a valid SWARM balance`,
      pass: isValid,
    };
  },
});

// Global test configuration
process.env.NODE_ENV = 'test';

// Mock console for cleaner test output
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    originalError(...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Global timeout for async operations
jest.setTimeout(30000);
