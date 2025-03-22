<script setup>
import { ref, provide } from 'vue';
import BurgerMenu from '~/components/BurgerMenu.vue';
import SideBar from '~/components/SideBar.vue';

const sidebarRef = ref(null);

// Предоставляем ссылку на SideBar для BurgerMenu
provide('sidebarRef', sidebarRef);
</script>

<template>
  <div>
    <BurgerMenu />
    <SideBar ref="sidebarRef" />
    
    <!-- Остальной контент вашего приложения -->
    <NuxtPage />
  </div>
</template> 