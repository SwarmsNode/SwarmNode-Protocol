// SwarmNode Protocol SDK - Main Entry Point
// Export all public interfaces and classes

export { SwarmNodeSDK } from './sdk';

// Export all types
export * from './types';

// Export utility classes and functions
export {
  SwarmNodeError,
  ContractError,
  ApiError,
  ValidationError
} from './types';

// Export ABIs for advanced users
export * from './abis';

// Version and metadata
export const SDK_VERSION = '1.0.0';
export const PROTOCOL_VERSION = '0.3.2';

/**
 * Quick start helper function
 * Creates a SwarmNodeSDK instance with sensible defaults
 */
export function createSwarmNodeSDK(config: {
  network?: 'mainnet' | 'testnet' | 'fuji' | 'localhost';
  privateKey?: string;
  apiKey?: string;
}) {
  const { SwarmNodeSDK } = require('./sdk');
  return new SwarmNodeSDK({
    network: config.network || 'fuji',
    privateKey: config.privateKey,
    apiKey: config.apiKey
  });
}

/**
 * Network configuration presets
 */
export const NETWORK_CONFIGS = {
  mainnet: {
    name: 'Avalanche C-Chain',
    chainId: 43114,
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    explorerUrl: 'https://snowtrace.io'
  },
  fuji: {
    name: 'Avalanche Fuji Testnet',
    chainId: 43113,
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    explorerUrl: 'https://testnet.snowtrace.io'
  },
  localhost: {
    name: 'Local Development',
    chainId: 31337,
    rpcUrl: 'http://localhost:8545',
    explorerUrl: 'http://localhost:8545'
  }
};

// Default export
export { SwarmNodeSDK as default } from './sdk';
