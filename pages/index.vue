<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Removing token check on mount since we want to allow staying on index page
</script>

<template>
  <LoginForm />
</template>