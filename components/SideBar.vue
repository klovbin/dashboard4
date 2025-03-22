<script setup lang="ts">
import { menuItems } from "@/utils/menuItems";
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useMenu } from '~/composables/useMenu';
import { useRoute } from 'vue-router';

const { isMenuOpen, closeMenu } = useMenu();

const route = useRoute();

const shouldShowSidebar = computed(() => {
  return route.path !== '/';
});

// Отслеживание размера экрана
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

// Добавляем наблюдение за изменением маршрута
watch(() => route.path, () => {
  if (isMobile.value) {
    closeMenu();
  }
});
</script>

<template>
  <div v-if="shouldShowSidebar && isMobile && isMenuOpen" class="sidebar-overlay" @click="closeMenu"></div>
  <div v-if="shouldShowSidebar" class="sidebar__wrapper" :class="{ 'sidebar--open': isMenuOpen, 'sidebar--mobile': isMobile }">
    <button v-if="isMobile" class="close-btn" @click="closeMenu">
      <span class="close-icon"></span>
    </button>
    <div class="sidebar__content">
      <div class="logo-container">
        <h1 class="logo__title">MarsX</h1>
      </div>
      <nav class="sidebar__nav">
        <ul class="sidebar__items">
          <li class="sidebar__item item" 
              :class="{ 'item__active': $route.path === item.link }" 
              v-for="item in menuItems" 
              :key="item.id">
            <NuxtLink class="item__link" :class="{ 'item__link__active': $route.path === item.link }" :to="item.link">
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<style scoped>
.sidebar__wrapper {
  background-color: rgba(16, 13, 34, 0.95);
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35), 0 0 20px rgba(137, 126, 255, 0.2);
  backdrop-filter: blur(8px);
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  overflow: hidden;
  border: 1px solid rgba(76, 69, 165, 0.15);
  padding: 0 30px;
}

.sidebar__content {
  display: flex;
  align-items: center;
  height: 80px;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  position: relative;
  margin-right: 50px;
}

.logo-container:after {
  content: none;
}

.logo__title {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 1px;
  background: linear-gradient(to right, rgb(76, 69, 165), rgb(137, 126, 255), rgb(99, 91, 199));
  -webkit-text-fill-color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  text-shadow: 0 0 15px rgba(137, 126, 255, 0.4);
}

.sidebar__nav {
  display: flex;
  height: 100%;
  align-items: center;
}

.sidebar__items {
  display: flex;
  flex-direction: row;
  gap: 32px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.sidebar__item {
  position: relative;
  border-radius: 12px;
  transition: all 0.3s ease;
  overflow: hidden;
  display: flex;
  justify-content: center;
}

.item__link {
  display: block;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s ease;
  white-space: nowrap;
  text-align: center;
}

.item__link:hover {
  color: rgba(255, 255, 255, 1);
}

.item__link__active {
  color: rgb(155, 146, 255);
  font-weight: 600;
}

.item__active {
  background: linear-gradient(to bottom, rgba(33, 28, 66, 0.8), rgba(40, 35, 75, 0.6));
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.item__active:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(to right, rgb(76, 69, 165), rgb(155, 146, 255));
  border-radius: 3px;
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  background: rgba(33, 28, 66, 0.7);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  z-index: 102;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(40, 35, 75, 0.9);
  box-shadow: 0 0 10px rgba(137, 126, 255, 0.3);
}

.close-icon {
  position: relative;
  width: 16px;
  height: 16px;
}

.close-icon:before, .close-icon:after {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(to right, rgb(137, 126, 255), rgb(155, 146, 255));
  border-radius: 2px;
}

.close-icon:before {
  transform: rotate(45deg);
}

.close-icon:after {
  transform: rotate(-45deg);
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 8, 20, 0.8);
  backdrop-filter: blur(4px);
  z-index: 99;
  transition: all 0.3s ease;
}

/* Mobile specific styles */
@media (max-width: 550px) {
  .sidebar__wrapper {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 280px;
    height: auto;
    padding: 25px 10px 40px;
    z-index: 100;
    opacity: 0;
    visibility: hidden;
    transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
  }
  
  .sidebar__content {
    flex-direction: column;
    height: auto;
  }

  .sidebar--open {
    opacity: 1 !important;
    visibility: visible !important;
    transform: translate(-50%, -50%) !important;
  }

  .logo-container {
    padding: 25px 0 15px;
    margin-right: 0;
  }

  .logo-container:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 15%;
    right: 15%;
    height: 1px;
    background: linear-gradient(to right, 
      rgba(76, 69, 165, 0), 
      rgba(99, 91, 199, 0.3), 
      rgba(76, 69, 165, 0));
  }

  .sidebar__nav {
    justify-content: center;
    width: 100%;
  }

  .sidebar__items {
    flex-direction: column;
    gap: 15px;
    margin: 35px 0 15px;
    width: 100%;
    justify-content: center;
  }

  .sidebar__item {
    width: 85%;
    margin: 0 auto;
  }

  .item__link {
    text-align: center;
    padding: 12px 20px;
    width: 100%;
    border-radius: 12px;
    font-size: 16px;
    position: relative;
    z-index: 1;
  }

  .item__active {
    position: relative;
    background: linear-gradient(135deg, rgba(48, 41, 95, 0.5), rgba(40, 35, 75, 0.3));
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    overflow: visible;
  }

  .item__link__active {
    color: rgb(155, 146, 255);
    text-shadow: 0 0 10px rgba(155, 146, 255, 0.3);
  }

  .item__active:before {
    content: '';
    position: absolute;
    width: 3px;
    height: 70%;
    top: 15%;
    left: 0;
    border-radius: 0 2px 2px 0;
    box-shadow: 0 0 8px rgba(137, 126, 255, 0.6);
    background: linear-gradient(to bottom, rgb(76, 69, 165), rgb(155, 146, 255));
  }
  
  .item__active:after {
    content: '';
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgb(155, 146, 255);
    left: -1.5px;
    top: calc(15% - 3px);
    box-shadow: 0 0 10px rgba(155, 146, 255, 0.8);
  }
}
</style>
