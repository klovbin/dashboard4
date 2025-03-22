<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useMenu } from '~/composables/useMenu';
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const { isMenuOpen, toggleMenu } = useMenu();
const route = useRoute();

// Локальное состояние для отображения кнопки
const isMobile = ref(false);

const checkScreenSize = () => {
  isMobile.value = window.innerWidth <= 550;
};

onMounted(() => {
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize);
});

const shouldShowBurger = computed(() => {
  return route.path !== '/';
});
</script>

<template>
  <div 
    v-if="shouldShowBurger && isMobile"
    class="burger-container" 
    :class="{ 'is-open': isMenuOpen }" 
  >
    <button 
      class="burger-menu" 
      @click="toggleMenu" 
      aria-label="Menu"
    >
      <div class="burger-icon">
        <span class="burger-line"></span>
        <span class="burger-line"></span>
        <span class="burger-line"></span>
      </div>
    </button>
  </div>
</template>

<style scoped>
.burger-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 101;
  display: none;
  
  @media (max-width: 550px) {
    display: block;
  }
}

.burger-menu {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 50px;
  background: rgba(30, 26, 58, 0.9);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  padding: 0;
  box-shadow: 0 0 15px rgba(137, 126, 255, 0.2);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.burger-menu:before {
  content: '';
  position: absolute;
  top: 1px;
  left: 1px;
  right: 1px;
  bottom: 1px;
  border-radius: 11px;
  background: linear-gradient(45deg, rgba(76, 69, 165, 0.1), rgba(99, 91, 199, 0.1));
  z-index: -1;
}

.burger-container.is-open .burger-menu {
  box-shadow: 0 0 20px rgba(137, 126, 255, 0.4);
  background: rgba(40, 35, 75, 0.95);
}

.burger-icon {
  width: 24px;
  height: 18px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.burger-line {
  width: 100%;
  height: 2px;
  background: linear-gradient(to right, rgb(137, 126, 255), rgb(155, 146, 255));
  border-radius: 4px;
  transition: all 0.4s cubic-bezier(0.68, -0.6, 0.32, 1.6);
}

.is-open .burger-line:nth-child(1) {
  transform: rotate(45deg) translate(5px, 6px);
  width: 100%;
}

.is-open .burger-line:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}

.is-open .burger-line:nth-child(3) {
  transform: rotate(-45deg) translate(5px, -6px);
  width: 100%;
}

/* Not active state adjustments */
.burger-line:nth-child(2) {
  width: 70%;
  align-self: flex-end;
  transition: all 0.3s ease;
}

.burger-menu:hover .burger-line:nth-child(2) {
  width: 100%;
}

.burger-menu:active {
  transform: scale(0.95);
}
</style>