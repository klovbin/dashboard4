import { ref } from 'vue';

// Создаем глобальное состояние для меню
const isMenuOpen = ref(false);

export function useMenu() {
  // Функция для переключения состояния меню
  const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value;
  };

  // Добавляем функцию для закрытия меню
  const closeMenu = () => {
    isMenuOpen.value = false;
  };

  return {
    isMenuOpen,
    toggleMenu,
    closeMenu,
  };
} 