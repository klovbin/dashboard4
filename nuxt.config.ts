// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: [
    "@/assets/scss/main.scss", // Убедись, что указываешь правильный путь
  ],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "@/assets/scss/common/_mixins.scss" as *;
            @use "@/assets/scss/common/_variables.scss" as *;
            @use "@/assets/scss/common/_container.scss" as *;
          `,
          quietDeps: true, // Отключает все предупреждения от зависимостей Sass
          logger: {
            warn: () => {} // Отключает все предупреждения Sass
          }
        }
      }
    }
  },
  compatibilityDate: "2025-02-11"
})