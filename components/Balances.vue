<script setup lang="ts">
import { useUserState } from '../composables/useUserState';
import { ref, computed, onMounted, watch } from 'vue';
import { currentUsdtBalance, updateCurrentUsdtBalance } from '../utils/bscscan';
import { accountData } from '../utils/appkit';
import { gsap } from 'gsap';

const { tokenBalance, updateUserData, onUserDataUpdated } = useUserState();

const displayedTokenBalance = ref(0);

// Initialize displayed values from state
onMounted(async () => {
  displayedTokenBalance.value = tokenBalance.value;
  
  // Initialize wallet balances if account is connected
  if (accountData.value?.address) {
    await updateCurrentUsdtBalance(accountData.value.address);
  }
  
  // Animate text elements appearance
  animateTextElements();
});

// Watch for changes to token balance
watch(tokenBalance, (newValue) => {
  displayedTokenBalance.value = newValue;
});

// Watch for account changes to update USDT balance
watch(() => accountData.value?.address, async (newAddress) => {
  if (newAddress) {
    await updateCurrentUsdtBalance(newAddress);
  } else {
    // Reset balance if no address
    currentUsdtBalance.value = 0;
  }
}, { immediate: true });

// Listen for user data updates
onUserDataUpdated((data) => {
  if (data.balance !== undefined) {
    displayedTokenBalance.value = data.balance;
  }
});

const formattedTokenBalance = computed(() => {
  return displayedTokenBalance.value.toLocaleString();
});

const formattedUsdtBalance = computed(() => {
  return currentUsdtBalance.value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
});

// Function to animate text elements
const animateTextElements = () => {
  // Set initial states - using the SCSS classes
  gsap.set(['.token__balance__label', '.token__balance', '.wallet__balance__label', '.wallet__balance'], { 
    opacity: 0,
    y: 30
  });
  
  // Create animation timeline with longer durations
  gsap.timeline()
    .to('.token__balance__label', { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out', delay: 0.3 })
    .to('.token__balance', { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out' }, '-=0.7')
    .to('.wallet__balance__label', { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out' })
    .to('.wallet__balance', { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out' }, '-=0.7');
};
</script>

<template>
  <section class="balances__wrapper token wallet">
    <div class="token__wrapper">
      <p class="token__balance__label" style="opacity: 0">Token Balances</p>
      <h2 class="token__balance" style="opacity: 0">{{ formattedTokenBalance }} MRX</h2>
    </div>
    <hr class="balances__separator">
    <div class="wallet__wrapper">
      <p class="wallet__balance__label" style="opacity: 0">Wallet Balances</p>
      <h2 class="wallet__balance" style="opacity: 0">{{ formattedUsdtBalance }} USDT</h2>
    </div>
  </section>
</template>

<style scoped>
</style>