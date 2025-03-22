<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { getCookie } from '../utils/auth';
import { useUserState } from '../composables/useUserState';

// Get the shared user state
const { tokenBalance, userEmail, updateUserData, recordExchange, canExchange, lastExchangeTime } = useUserState();

const tokenName = ref('MRX');
const course = ref(1);
const getAmount = ref('');
const payAmount = ref('');
const address = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const isLoading = ref(false);
const cooldownMessage = ref('');
const cooldownSeconds = ref(0);
const isInCooldown = ref(false);
let cooldownTimer = null;

// Check cooldown status without showing message
const checkCooldownStatus = () => {
  const { allowed, remainingSeconds } = canExchange();
  cooldownSeconds.value = remainingSeconds;
  isInCooldown.value = !allowed;
  return allowed;
};

// Computed property to check if exchange is allowed
const exchangeAllowed = computed(() => {
  return checkCooldownStatus();
});

// Start a countdown timer (only for the button display)
const startCooldownTimer = () => {
  if (cooldownTimer) {
    clearInterval(cooldownTimer);
  }

  isInCooldown.value = true;

  cooldownTimer = setInterval(() => {
    const { allowed, remainingSeconds } = canExchange();
    cooldownSeconds.value = remainingSeconds;

    if (allowed) {
      isInCooldown.value = false;
      stopCooldownTimer();
    }
  }, 1000);
};

// Stop the countdown timer
const stopCooldownTimer = () => {
  if (cooldownTimer) {
    clearInterval(cooldownTimer);
    cooldownTimer = null;
  }
};

// Fetch token course and name from the API
const fetchCourse = async () => {
  try {
    const response = await fetch('/api/get_course');
    const data = await response.json();
    course.value = data.course;
    if (data.tokenName) {
      tokenName.value = data.tokenName;
    }
  } catch (error) {
    console.error('Error fetching course:', error);
    errorMessage.value = 'Failed to load exchange rate';
  }
};

// Fetch user data including balance
const fetchUserData = async () => {
  try {
    const token = getCookie('jwt_token');
    if (!token) {
      errorMessage.value = 'Please login to use the exchange';
      return;
    }

    const response = await fetch('/api/get-user-data', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    const data = await response.json();
    // Update the shared state
    updateUserData({
      balance: data.balance,
      email: data.email
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    errorMessage.value = 'Failed to load user data';
  }
};

// Calculate USDT amount based on token amount
const calculateUsdtAmount = () => {
  if (getAmount.value && !isNaN(getAmount.value)) {
    const tokens = parseFloat(getAmount.value);
    payAmount.value = (tokens * course.value).toFixed(2);
  } else {
    payAmount.value = '';
  }
};

// Calculate token amount based on USDT amount
const calculateTokenAmount = () => {
  if (payAmount.value && !isNaN(payAmount.value)) {
    const usdt = parseFloat(payAmount.value);
    getAmount.value = (usdt / course.value).toFixed(0);
  } else {
    getAmount.value = '';
  }
};

// Submit exchange request
const submitExchange = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  cooldownMessage.value = '';

  // Check if exchange is allowed (cooldown period)
  const { allowed, remainingSeconds } = canExchange();
  if (!allowed) {
    cooldownMessage.value = `Please wait ${remainingSeconds} seconds before making another exchange`;
    startCooldownTimer();
    return;
  }

  if (!getAmount.value || isNaN(getAmount.value) || parseFloat(getAmount.value) <= 0) {
    errorMessage.value = 'Please enter a valid token amount';
    return;
  }

  if (!address.value) {
    errorMessage.value = 'Please enter your USDT address';
    return;
  }

  const tokenAmount = parseFloat(getAmount.value);

  if (tokenAmount > tokenBalance.value) {
    errorMessage.value = `Insufficient balance. You have ${tokenBalance.value} ${tokenName.value}`;
    return;
  }

  isLoading.value = true;

  try {
    const token = getCookie('jwt_token');
    if (!token) {
      errorMessage.value = 'Please login to use the exchange';
      isLoading.value = false;
      return;
    }

    const response = await fetch('/api/create-exchange', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        tokenAmount,
        usdtAmount: parseFloat(payAmount.value),
        tokenName: tokenName.value,
        address: address.value
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create exchange request');
    }

    // Record the exchange time
    recordExchange();

    successMessage.value = 'Your exchange request has been created successfully';
    getAmount.value = '';
    payAmount.value = '';
    address.value = '';

    // Immediately update the balance in the UI before fetching from server
    // This provides instant feedback to the user
    updateUserData({
      balance: tokenBalance.value - tokenAmount
    });

    // Then refresh user balance from the server - this will update the shared state
    await fetchUserData();

    // Start the cooldown timer for the button display
    startCooldownTimer();
  } catch (error) {
    console.error('Error creating exchange request:', error);
    errorMessage.value = error.message || 'Failed to create exchange request';
  } finally {
    isLoading.value = false;
  }
};

// Initialize component
onMounted(async () => {
  // Check cooldown status and start timer if needed
  if (!checkCooldownStatus()) {
    startCooldownTimer();
  }

  await fetchCourse();
  await fetchUserData();
});

// Clean up when component is unmounted
onUnmounted(() => {
  stopCooldownTimer();
});
</script>

<template>
  <div class="exchange-container">
    <h2 class="exchange-title">Exchange</h2>

    <div class="exchange-rate">
      <span>1 {{ tokenName }}</span>
      <span class="exchange-arrow">→</span>
      <span>{{ course.toFixed(2) }} USDT</span>
    </div>

    <div class="exchange-form">
      <div class="form-group">
        <label>Get</label>
        <div class="input-with-token">
          <input
              type="number"
              v-model="getAmount"
              @input="calculateUsdtAmount"
              placeholder="0"
              :disabled="isLoading"
          />
          <div class="token-badge">
            <span>{{ tokenName }}</span>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>Pay</label>
        <div class="input-with-token">
          <input
              type="number"
              v-model="payAmount"
              @input="calculateTokenAmount"
              placeholder="0"
              :disabled="isLoading"
          />
          <div class="token-badge">
            <span>USDT</span>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>USDT Address</label>
        <div class="input-with-token">
          <input
              type="text"
              v-model="address"
              placeholder="Enter your USDT address"
              :disabled="isLoading"
          />
        </div>
      </div>

      <div v-if="cooldownMessage" class="cooldown-message">
        {{ cooldownMessage }}
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>

      <button
          class="exchange-button"
          @click="submitExchange"
          :disabled="isLoading || !getAmount || parseFloat(getAmount) <= 0 || !exchangeAllowed"
      >
        <span v-if="isLoading">Processing...</span>
        <span v-else-if="isInCooldown">Wait {{ cooldownSeconds }}s</span>
        <span v-else>Exchange</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.exchange-container {
  border-radius: 1rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex: 1;
  box-sizing: border-box;
  max-width: 100%;
  max-height: 100%;
}

.exchange-form {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.cooldown-message {
  color: #ff9800;
  margin: 10px 0;
  font-size: 14px;
}

.error-message {
  color: #f44336;
  margin: 10px 0;
}

.success-message {
  color: #4caf50;
  margin: 10px 0;
}
</style>