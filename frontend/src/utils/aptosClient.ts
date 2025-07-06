// Contract addresses and module names
export const CONTRACT_ADDRESS = '0xc7a1e9b157d5facbb3fbc9b890b1ac059d0e5f31c9e31f4dd41c2ae600aab25b';

export const MODULE_NAMES = {
  MOCK_STAKING: `${CONTRACT_ADDRESS}::mock_staking_protocol`,
  RESTAKING_ENGINE: `${CONTRACT_ADDRESS}::restaking_engine`,
  STAKED_TOKEN: `${CONTRACT_ADDRESS}::staked_token`,
  RESTAKED_TOKEN: `${CONTRACT_ADDRESS}::restaked_token`
} as const;

// Simple HTTP client for Aptos API calls
const APTOS_NODE_URL = 'https://fullnode.mainnet.aptoslabs.com/v1';

async function makeAptosRequest(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${APTOS_NODE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Aptos API request failed:', error);
    throw error;
  }
}

// Helper functions for formatting amounts
export const APT_DECIMALS = 8;
export const TOKEN_DECIMALS = 8;

export function formatAptAmount(amount: number): number {
  return amount / Math.pow(10, APT_DECIMALS);
}

export function parseAptAmount(amount: number): number {
  return Math.floor(amount * Math.pow(10, APT_DECIMALS));
}

export function formatTokenAmount(amount: number): number {
  return amount / Math.pow(10, TOKEN_DECIMALS);
}

export function parseTokenAmount(amount: number): number {
  return Math.floor(amount * Math.pow(10, TOKEN_DECIMALS));
}

// Helper function to ensure proper address formatting
export function formatAddress(address: string): string {
  if (!address) return '';
  // Remove 0x prefix if present, then add it back
  const cleanAddress = address.replace(/^0x/, '');
  return `0x${cleanAddress}`;
}

// Helper function to create transaction payload
export function createTransactionPayload(
  functionName: string,
  typeArguments: string[] = [],
  args: any[] = []
) {
  return {
    function: functionName,
    type_arguments: typeArguments,
    arguments: args
  };
}

// Get user's APT balance
export async function getAptBalance(address: string): Promise<number> {
  try {
    const resource = await makeAptosRequest(`/accounts/${address}/resource/0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>`);
    return formatAptAmount(Number(resource.data.coin.value));
  } catch (error) {
    console.error('Error fetching APT balance:', error);
    return 0;
  }
}

// Get user's staked token balance
export async function getStakedTokenBalance(address: string): Promise<number> {
  try {
    const resource = await makeAptosRequest(`/accounts/${address}/resource/0x1::coin::CoinStore<${CONTRACT_ADDRESS}::staked_token::SToken>`);
    return formatTokenAmount(Number(resource.data.coin.value));
  } catch (error) {
    console.error('Error fetching staked token balance:', error);
    return 0;
  }
}

// Get user's restaked token balance
export async function getRestakedTokenBalance(address: string): Promise<number> {
  try {
    const resource = await makeAptosRequest(`/accounts/${address}/resource/0x1::coin::CoinStore<${CONTRACT_ADDRESS}::restaked_token::RSToken>`);
    return formatTokenAmount(Number(resource.data.coin.value));
  } catch (error) {
    console.error('Error fetching restaked token balance:', error);
    return 0;
  }
}

// Get staking protocol data
export async function getStakingProtocolData(): Promise<{
  totalStaked: number;
  exchangeRate: number;
}> {
  try {
    const [totalStaked, exchangeRate] = await Promise.all([
      makeAptosRequest('/view', {
        method: 'POST',
        body: JSON.stringify({
          function: `${CONTRACT_ADDRESS}::mock_staking_protocol::get_total_staked`,
          type_arguments: [],
          arguments: []
        })
      }),
      makeAptosRequest('/view', {
        method: 'POST',
        body: JSON.stringify({
          function: `${CONTRACT_ADDRESS}::mock_staking_protocol::get_exchange_rate`,
          type_arguments: [],
          arguments: []
        })
      })
    ]);

    return {
      totalStaked: formatAptAmount(Number(totalStaked[0])),
      exchangeRate: Number(exchangeRate[0]) / Math.pow(10, 8)
    };
  } catch (error) {
    console.error('Error fetching staking protocol data:', error);
    return { totalStaked: 0, exchangeRate: 1.0 };
  }
}

// Get user's stake amount
export async function getUserStake(address: string): Promise<number> {
  try {
    const result = await makeAptosRequest('/view', {
      method: 'POST',
      body: JSON.stringify({
        function: `${CONTRACT_ADDRESS}::mock_staking_protocol::get_user_stake`,
        type_arguments: [],
        arguments: [address]
      })
    });
    return formatAptAmount(Number(result[0]));
  } catch (error) {
    console.error('Error fetching user stake:', error);
    return 0;
  }
}

// Get restaking engine data
export async function getRestakingEngineData(): Promise<{
  totalRestaked: number;
  exchangeRate: number;
}> {
  try {
    const [totalRestaked, exchangeRate] = await Promise.all([
      makeAptosRequest('/view', {
        method: 'POST',
        body: JSON.stringify({
          function: `${CONTRACT_ADDRESS}::restaking_engine::get_total_restaked`,
          type_arguments: [],
          arguments: []
        })
      }),
      makeAptosRequest('/view', {
        method: 'POST',
        body: JSON.stringify({
          function: `${CONTRACT_ADDRESS}::restaking_engine::get_exchange_rate`,
          type_arguments: [],
          arguments: []
        })
      })
    ]);

    return {
      totalRestaked: formatTokenAmount(Number(totalRestaked[0])),
      exchangeRate: Number(exchangeRate[0]) / Math.pow(10, 8)
    };
  } catch (error) {
    console.error('Error fetching restaking engine data:', error);
    return { totalRestaked: 0, exchangeRate: 1.0 };
  }
}

// Get user's restake amount
export async function getUserRestake(address: string): Promise<number> {
  try {
    const result = await makeAptosRequest('/view', {
      method: 'POST',
      body: JSON.stringify({
        function: `${CONTRACT_ADDRESS}::restaking_engine::get_user_restake`,
        type_arguments: [],
        arguments: [address]
      })
    });
    return formatTokenAmount(Number(result[0]));
  } catch (error) {
    console.error('Error fetching user restake:', error);
    return 0;
  }
}

// Get comprehensive user data
export async function getUserData(address: string): Promise<{
  aptBalance: number;
  stakedBalance: number;
  restakedBalance: number;
  userStake: number;
  userRestake: number;
  stakingData: { totalStaked: number; exchangeRate: number };
  restakingData: { totalRestaked: number; exchangeRate: number };
}> {
  try {
    const [
      aptBalance,
      stakedBalance,
      restakedBalance,
      userStake,
      userRestake,
      stakingData,
      restakingData
    ] = await Promise.all([
      getAptBalance(address),
      getStakedTokenBalance(address),
      getRestakedTokenBalance(address),
      getUserStake(address),
      getUserRestake(address),
      getStakingProtocolData(),
      getRestakingEngineData()
    ]);

    return {
      aptBalance,
      stakedBalance,
      restakedBalance,
      userStake,
      userRestake,
      stakingData,
      restakingData
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return {
      aptBalance: 0,
      stakedBalance: 0,
      restakedBalance: 0,
      userStake: 0,
      userRestake: 0,
      stakingData: { totalStaked: 0, exchangeRate: 1.0 },
      restakingData: { totalRestaked: 0, exchangeRate: 1.0 }
    };
  }
}

// Check if user is registered for staking protocol
export async function isUserRegisteredForStaking(address: string): Promise<boolean> {
  try {
    await makeAptosRequest(`/accounts/${address}/resource/0x1::coin::CoinStore<${CONTRACT_ADDRESS}::staked_token::SToken>`);
    return true;
  } catch (error) {
    return false;
  }
}

// Check if user is registered for restaking engine
export async function isUserRegisteredForRestaking(address: string): Promise<boolean> {
  try {
    await makeAptosRequest(`/accounts/${address}/resource/0x1::coin::CoinStore<${CONTRACT_ADDRESS}::restaked_token::RSToken>`);
    return true;
  } catch (error) {
    return false;
  }
}

// Mock data for demo purposes (when contracts are not deployed)
export function getMockData() {
  return {
    aptBalance: 1000,
    stakedBalance: 500,
    restakedBalance: 250,
    userStake: 500,
    userRestake: 250,
    stakingData: { totalStaked: 1250000, exchangeRate: 1.0 },
    restakingData: { totalRestaked: 750000, exchangeRate: 1.0 },
    tvl: 15.2,
    apy: 8.5
  };
}

export function getMockStakingData() {
  return {
    totalStaked: 500000,
    exchangeRate: 1.0,
    totalStakers: 1250,
    userStake: 250,
    userBalance: 1000,
    userStakedTokens: 250,
    topStakers: [
      { address: '0x1234567890abcdef', amount: 5000, tokens: 5000, date: '2024-01-15' },
      { address: '0xabcdef1234567890', amount: 3000, tokens: 3000, date: '2024-01-14' },
      { address: '0x7890abcdef123456', amount: 2000, tokens: 2000, date: '2024-01-13' },
    ]
  };
}

export function getMockRestakingData() {
  return {
    totalRestaked: 750000,
    exchangeRate: 1.0,
    totalRestakers: 892,
    userRestake: 100,
    userStakedBalance: 500,
    userRestakedTokens: 100,
    topRestakers: [
      { address: '0x1234567890abcdef', amount: 3000, tokens: 3000, date: '2024-01-15' },
      { address: '0xabcdef1234567890', amount: 2000, tokens: 2000, date: '2024-01-14' },
      { address: '0x7890abcdef123456', amount: 1500, tokens: 1500, date: '2024-01-13' },
    ]
  };
}

// Get staking data for a specific user
export async function getStakingData(address: string) {
  try {
    const [stakingProtocolData, userStake, aptBalance, stakedBalance] = await Promise.all([
      getStakingProtocolData(),
      getUserStake(address),
      getAptBalance(address),
      getStakedTokenBalance(address)
    ]);

    return {
      ...stakingProtocolData,
      userStake,
      userBalance: aptBalance,
      userStakedTokens: stakedBalance,
      totalStakers: 1250, // Mock data for now
      topStakers: [
        { address: '0x1234567890abcdef', amount: 5000, tokens: 5000, date: '2024-01-15' },
        { address: '0xabcdef1234567890', amount: 3000, tokens: 3000, date: '2024-01-14' },
        { address: '0x7890abcdef123456', amount: 2000, tokens: 2000, date: '2024-01-13' },
      ]
    };
  } catch (error) {
    console.error('Error fetching staking data:', error);
    return getMockStakingData();
  }
}

// Get restaking data for a specific user
export async function getRestakingData(address: string) {
  try {
    const [restakingEngineData, userRestake, stakedBalance, restakedBalance] = await Promise.all([
      getRestakingEngineData(),
      getUserRestake(address),
      getStakedTokenBalance(address),
      getRestakedTokenBalance(address)
    ]);

    return {
      ...restakingEngineData,
      userRestake,
      userStakedBalance: stakedBalance,
      userRestakedTokens: restakedBalance,
      totalRestakers: 892, // Mock data for now
      topRestakers: [
        { address: '0x1234567890abcdef', amount: 3000, tokens: 3000, date: '2024-01-15' },
        { address: '0xabcdef1234567890', amount: 2000, tokens: 2000, date: '2024-01-14' },
        { address: '0x7890abcdef123456', amount: 1500, tokens: 1500, date: '2024-01-13' },
      ]
    };
  } catch (error) {
    console.error('Error fetching restaking data:', error);
    return getMockRestakingData();
  }
} 

// Check if staking protocol is initialized
export async function isStakingProtocolInitialized(): Promise<boolean> {
  const url = `/accounts/${CONTRACT_ADDRESS}/resource/${CONTRACT_ADDRESS}::mock_staking_protocol::MockStakingProtocol`;
  try {
    console.log("Checking protocol initialization at:", url);
    const result = await makeAptosRequest(url);
    console.log("Protocol resource found:", result);
    return true;
  } catch (error) {
    console.error('Error checking if staking protocol is initialized:', error);
    return false;
  }
}

// Initialize the staking protocol (admin only)
export function createInitializePayload(seed: string): any {
  return createTransactionPayload(
    `${CONTRACT_ADDRESS}::mock_staking_protocol::initialize`,
    [],
    [seed]
  );
} 