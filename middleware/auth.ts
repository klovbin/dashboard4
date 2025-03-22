export default defineNuxtRouteMiddleware((to, from) => {
  const token = getCookie('jwt_token');
  
  // Если нет токена и пользователь пытается попасть на защищенный роут
  if (!token && to.path === '/dashboard') {
    return navigateTo('/login');
  }
}) 