// Configuration for the Aptos Liquid Restaking Frontend

export const CONFIG = {
  // Aptos Network Configuration
  APTOS_NODE_URL: import.meta.env.VITE_APTOS_NODE_URL || 'https://fullnode.mainnet.aptoslabs.com/v1',
  CONTRACT_ADDRESS: import.meta.env.VITE_CONTRACT_ADDRESS || '0xliq_restaking',
  
  // App Configuration
  APP_NAME: 'Aptos Liquid Restaking Protocol',
  APP_VERSION: '1.0.0',
  
  // UI Configuration
  REFRESH_INTERVAL: 10000, // 10 seconds
  MAX_DECIMALS: 6,
  
  // Network Configuration
  NETWORKS: {
    MAINNET: {
      name: 'Mainnet',
      nodeUrl: 'https://fullnode.mainnet.aptoslabs.com/v1',
      faucetUrl: null,
    },
    TESTNET: {
      name: 'Testnet',
      nodeUrl: 'https://fullnode.testnet.aptoslabs.com/v1',
      faucetUrl: 'https://faucet.testnet.aptoslabs.com',
    },
    DEVNET: {
      name: 'Devnet',
      nodeUrl: 'https://fullnode.devnet.aptoslabs.com/v1',
      faucetUrl: 'https://faucet.devnet.aptoslabs.com',
    },
  },
  
  // Token Configuration
  TOKENS: {
    APT: {
      symbol: 'APT',
      name: 'Aptos Coin',
      decimals: 8,
      color: '#10b981',
    },
    STAKED: {
      symbol: 'sTKN',
      name: 'Staked Token',
      decimals: 8,
      color: '#6366f1',
    },
    RESTAKED: {
      symbol: 'rsTKN',
      name: 'Restaked Token',
      decimals: 8,
      color: '#ec4899',
    },
  },
  
  // Exchange Rate Configuration
  EXCHANGE_RATES: {
    DEFAULT_STAKING_RATE: 100000000, // 1:1 ratio (scaled by 10^8)
    DEFAULT_RESTAKING_RATE: 100000000, // 1:1 ratio (scaled by 10^8)
    SCALE_FACTOR: 100000000, // 10^8 for precision
  },
}

// Helper function to get current network
export const getCurrentNetwork = () => {
  const nodeUrl = CONFIG.APTOS_NODE_URL
  if (nodeUrl.includes('mainnet')) return CONFIG.NETWORKS.MAINNET
  if (nodeUrl.includes('testnet')) return CONFIG.NETWORKS.TESTNET
  if (nodeUrl.includes('devnet')) return CONFIG.NETWORKS.DEVNET
  return CONFIG.NETWORKS.MAINNET
}

// Helper function to format exchange rate
export const formatExchangeRate = (rate: number): string => {
  return (rate / CONFIG.EXCHANGE_RATES.SCALE_FACTOR).toFixed(6)
}

// Helper function to parse exchange rate
export const parseExchangeRate = (rate: number): number => {
  return Math.floor(rate * CONFIG.EXCHANGE_RATES.SCALE_FACTOR)
} 