<script setup lang="ts">

import { checkAuthToken, getCookie } from '@/utils/auth';
import { useMenu } from '~/composables/useMenu';
import {accountData, modal} from "@/utils/appkit";
import Chart from "~/components/Chart.vue";

const connected = computed(() => accountData.value.isConnected);

// Используем общий хук useMenu вместо локального состояния
const { isMenuOpen, toggleMenu } = useMenu();

// Добавляем реактивное состояние для определения размера экрана
const is1100 = ref(false);
const is550 = ref(false);

// Функция для проверки размера экрана
const checkScreenSize = () => {
  is1100.value = window.innerWidth <= 1100;
  is550.value = window.innerWidth <= 550;
};

const fetchUserData = async () => {
  try {
    const token = getCookie('jwt_token');
    if (!token) {
      console.error('No JWT token found');
      return null;
    }

    const response = await fetch('/api/get-user-data', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

// Функция для проверки и обновления адреса пользователя в БД
const checkAndUpdateUserAddress = async () => {
  if (connected.value) {
    try {
      const userData = await fetchUserData();
      
      // Проверяем, есть ли у пользователя адрес в БД
      if (!userData?.address && accountData.value.address) {
        // Если адреса нет в БД, но он есть в accountData, отправляем его в БД
        const token = getCookie('jwt_token');
        
        const response = await fetch('/api/update-user-address', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            address: accountData.value.address
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to update user address');
        }
        
        console.log('User address updated successfully');
      }
    } catch (error) {
      console.error('Error checking/updating user address:', error);
    }
  }
};

onMounted(() => {

  checkAuthToken();
  
  // Проверяем размер экрана при загрузке
  checkScreenSize();
  
  // Добавляем слушатель изменения размера экрана
  window.addEventListener('resize', checkScreenSize);
  
  // Проверяем connected и обновляем адрес пользователя в БД, если необходимо
  checkAndUpdateUserAddress();
});

// Отслеживаем изменение состояния connected
watch(connected, (newValue) => {
  if (newValue) {
    checkAndUpdateUserAddress();
  }
});

onUnmounted(() => {
  // Удаляем слушатель при размонтировании компонента
  window.removeEventListener('resize', checkScreenSize);
});

</script>

<template>
  <BurgerMenu :is-open="isMenuOpen" @toggle="toggleMenu" />
  <SideBar />
<!--  <Header v-if="connected"/>-->
  <WalletConnect v-if="!connected" />
  <div v-if="connected" class="layout">
    <div class="layout__content">
      <div class="layout__header">
        <Baner />
        <Balances />
      </div>
      <Exchange v-if="is1100" class="exchange"/>
      <Chart />
    </div>
    <div class="layout__bar" v-if="!is1100">
      <Exchange />
    </div>
  </div>
</template>