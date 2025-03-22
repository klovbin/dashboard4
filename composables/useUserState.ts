import { ref } from 'vue';
import { useEventBus } from './useEventBus';

// Define types for user data
interface UserDataUpdate {
  balance: number;
  email: string;
}

interface ExchangeRecord {
  timestamp: number;
}

// Get the event bus
const eventBus = useEventBus();

// Storage key for last exchange time
const LAST_EXCHANGE_TIME_KEY = 'last_exchange_time';

// Helper to safely access localStorage (handles SSR)
const getFromStorage = (key: string, defaultValue: any) => {
  if (typeof window !== 'undefined') {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
      try {
        return JSON.parse(storedValue);
      } catch (e) {
        console.error('Error parsing stored value:', e);
      }
    }
  }
  return defaultValue;
};

const saveToStorage = (key: string, value: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// Create a singleton state that will be shared across all components
const tokenBalance = ref(0);
const walletBalance = ref(0);
const userEmail = ref('');

// Initialize lastExchangeTime from localStorage
const lastExchangeTime = ref(getFromStorage(LAST_EXCHANGE_TIME_KEY, 0));

// Create a reactive state that can be shared between components
export const useUserState = () => {
  // Method to update the balance
  const updateUserData = (data: { balance?: number, email?: string }) => {
    let updated = false;
    
    if (data.balance !== undefined && tokenBalance.value !== data.balance) {
      tokenBalance.value = data.balance;
      updated = true;
    }
    
    if (data.email !== undefined && userEmail.value !== data.email) {
      userEmail.value = data.email;
      updated = true;
    }
    
    // Emit an event if data was updated
    if (updated) {
      eventBus.emit('user-data-updated', { 
        balance: tokenBalance.value,
        email: userEmail.value
      });
    }
  };

  // Record an exchange
  const recordExchange = () => {
    lastExchangeTime.value = Date.now();
    // Save to localStorage
    saveToStorage(LAST_EXCHANGE_TIME_KEY, lastExchangeTime.value);
    eventBus.emit('exchange-recorded', { timestamp: lastExchangeTime.value });
  };

  // Check if exchange is allowed (1 minute cooldown)
  const canExchange = (): { allowed: boolean, remainingSeconds: number } => {
    const now = Date.now();
    const elapsedMs = now - lastExchangeTime.value;
    const cooldownMs = 60 * 1000; // 1 minute in milliseconds
    
    if (elapsedMs >= cooldownMs || lastExchangeTime.value === 0) {
      return { allowed: true, remainingSeconds: 0 };
    } else {
      const remainingMs = cooldownMs - elapsedMs;
      return { 
        allowed: false, 
        remainingSeconds: Math.ceil(remainingMs / 1000)
      };
    }
  };

  return {
    tokenBalance,
    walletBalance,
    userEmail,
    lastExchangeTime,
    updateUserData,
    recordExchange,
    canExchange,
    onUserDataUpdated: (callback: (data: UserDataUpdate) => void) => 
      eventBus.on('user-data-updated', callback),
    onExchangeRecorded: (callback: (data: ExchangeRecord) => void) => 
      eventBus.on('exchange-recorded', callback)
  };
}; 