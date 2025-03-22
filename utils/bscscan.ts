import { ref } from 'vue';

// BscScan API key - should be stored in environment variables in production
const BSCSCAN_API_KEY = import.meta.env.VITE_BSCSCAN_API_KEY || '';

// USDT contract address on BSC
const USDT_CONTRACT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955'; // BSC USDT (USDT-BEP20)

// Interface for token balance response
interface TokenBalanceResponse {
  status: string;
  message: string;
  result: string; // Balance in wei format
}

// Cache to store balance data
const balanceCache = new Map<string, { balance: number, timestamp: number }>();
const CACHE_DURATION = 60 * 1000; // 1 minute cache

/**
 * Fetches the BNB balance for a given wallet address from BscScan
 * @param walletAddress The wallet address to check
 * @returns The balance in BNB (decimal format)
 */
export async function fetchBnbBalance(walletAddress: string): Promise<number> {
  if (!walletAddress) {
    console.error('No wallet address provided');
    return 0;
  }
  
  // Check cache first
  const cacheKey = `bnb_${walletAddress}`;
  const now = Date.now();
  const cachedData = balanceCache.get(cacheKey);
  if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
    console.log('Using cached BNB balance for', walletAddress);
    return cachedData.balance;
  }
  
  try {
    // Construct the BscScan API URL for BNB balance
    const apiUrl = `https://api.bscscan.com/api?module=account&action=balance&address=${walletAddress}&tag=latest&apikey=${BSCSCAN_API_KEY}`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`BscScan API error: ${response.statusText}`);
    }
    
    const data: TokenBalanceResponse = await response.json();
    
    if (data.status !== '1') {
      console.error('BscScan API error:', data.message);
      return 0;
    }
    
    // Convert from wei to BNB (18 decimals)
    const balance = parseFloat(data.result) / 10**18;
    
    // Cache the result
    balanceCache.set(cacheKey, { balance, timestamp: now });
    
    return balance;
  } catch (error) {
    console.error('Error fetching BNB balance:', error);
    return 0;
  }
}

/**
 * Fetches the USDT balance for a given wallet address from BscScan
 * @param walletAddress The wallet address to check
 * @returns The balance in USDT (decimal format)
 */
export async function fetchUsdtBalance(walletAddress: string): Promise<number> {
  if (!walletAddress) {
    console.error('No wallet address provided');
    return 0;
  }
  
  // Check cache first
  const cacheKey = `usdt_${walletAddress}`;
  const now = Date.now();
  const cachedData = balanceCache.get(cacheKey);
  if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
    console.log('Using cached USDT balance for', walletAddress);
    return cachedData.balance;
  }
  
  try {
    // Construct the BscScan API URL for token balance
    const apiUrl = `https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=${USDT_CONTRACT_ADDRESS}&address=${walletAddress}&tag=latest&apikey=${BSCSCAN_API_KEY}`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`BscScan API error: ${response.statusText}`);
    }
    
    const data: TokenBalanceResponse = await response.json();
    
    if (data.status !== '1') {
      console.error('BscScan API error:', data.message);
      return 0;
    }
    
    // Convert from wei to USDT (18 decimals)
    const balance = parseFloat(data.result) / 10**18;
    
    // Cache the result
    balanceCache.set(cacheKey, { balance, timestamp: now });
    
    return balance;
  } catch (error) {
    console.error('Error fetching USDT balance:', error);
    return 0;
  }
}

// Reactive reference for the current USDT balance
export const currentUsdtBalance = ref<number>(0);

// Reactive reference for the current BNB balance
export const currentBnbBalance = ref<number>(0);

/**
 * Updates the current USDT balance for a given wallet address
 * @param walletAddress The wallet address to check
 */
export async function updateCurrentUsdtBalance(walletAddress: string): Promise<void> {
  if (!walletAddress) {
    currentUsdtBalance.value = 0;
    return;
  }
  
  try {
    const balance = await fetchUsdtBalance(walletAddress);
    currentUsdtBalance.value = balance;
  } catch (error) {
    console.error('Error updating USDT balance:', error);
    currentUsdtBalance.value = 0;
  }
}

/**
 * Updates the current BNB balance for a given wallet address
 * @param walletAddress The wallet address to check
 */
export async function updateCurrentBnbBalance(walletAddress: string): Promise<void> {
  if (!walletAddress) {
    currentBnbBalance.value = 0;
    return;
  }
  
  try {
    const balance = await fetchBnbBalance(walletAddress);
    currentBnbBalance.value = balance;
  } catch (error) {
    console.error('Error updating BNB balance:', error);
    currentBnbBalance.value = 0;
  }
}

/**
 * Updates both BNB and USDT balances for a given wallet address
 * @param walletAddress The wallet address to check
 */
export async function updateAllBalances(walletAddress: string): Promise<void> {
  await Promise.all([
    updateCurrentBnbBalance(walletAddress),
    updateCurrentUsdtBalance(walletAddress)
  ]);
} 