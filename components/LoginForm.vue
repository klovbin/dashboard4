<script>
import RegisterForm from './RegisterForm.vue'
import { authService } from '../services/authService'
import { useRouter } from 'vue-router'

export default {
  components: {
    RegisterForm
  },
  setup() {
    const router = useRouter()
    return { router }
  },
  data() {
    return {
      isModalOpen: false,
      email: '',
      password: '',
      showRegisterForm: false,
      error: '',
      isLoading: false,
      successMessage: '',
      jwtToken: ''
    }
  },
  methods: {
    openModal() {
      // Check token first when clicking login button
      const token = this.getCookie('jwt_token')
      if (token) {
        // If token exists, redirect to dashboard instead of opening modal
        console.log('JWT token found, redirecting to dashboard')
        this.router.push('/dashboard')
        return
      }
      
      // If no token, proceed with opening modal as before
      this.isModalOpen = true
      this.showRegisterForm = false
      this.error = ''
      this.$nextTick(() => {
        this.$refs.emailInput.focus()
      })
    },
    closeModal() {
      this.isModalOpen = false
      this.email = ''
      this.password = ''
      this.error = ''
    },
    async submitLogin() {
      try {
        this.isLoading = true
        this.error = ''
        this.successMessage = ''
        
        // Check for empty fields
        if (!this.email || !this.password) {
          this.error = 'Пожалуйста, заполните все поля'
          this.isLoading = false
          return
        }
        
        const response = await authService.login({
          email: this.email,
          password: this.password
        })

        console.log('Login response:', response)

        if (response.success) {
          // Try different possible token field names
          this.jwtToken = response.token || response.accessToken || response.jwt || response.data?.token || ''
          
          if (this.jwtToken) {
            // Store token in cookie
            document.cookie = `jwt_token=${this.jwtToken}; path=/; max-age=86400; SameSite=Strict` // 1 day expiration
            this.successMessage = 'Login successful'
          } else {
            this.successMessage = 'Login successful'
          }
          
          // Navigate to dashboard
          await this.router.push('/dashboard')
          this.closeModal()
          // You might want to store the user data in your app state here
          // For example: this.$store.commit('setUser', response.user)
        } else {
          // Handle login error
          this.error = response.message
        }
      } catch (error) {
        this.error = 'Произошла ошибка при входе в систему'
        console.error('Login error:', error)
      } finally {
        this.isLoading = false
      }
    },
    openRegisterForm() {
      this.closeModal() // Close login modal
      this.showRegisterForm = true // Show registration form
    },
    handleRegisterClose() {
      this.showRegisterForm = false
      this.openModal() // Reopen login form when register form is closed
    },
    handleRegistrationSuccess(message) {
      this.successMessage = 'Registration successful! You can now log in to your account.'
      this.showRegisterForm = false
      this.openModal() // Reopen login form
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        this.successMessage = ''
      }, 5000)
    },
    // Helper method to get cookie by name
    getCookie(name) {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop().split(';').shift()
      return null
    }
  }
}
</script>

<template>
<section class="login-section">
  <!-- Button to open the modal -->
  <button 
    type="button" 
    @click="openModal" 
    aria-label="Open login form"
    class="login-button"
  >
    Login
  </button>
  
  <!-- Modal backdrop and container -->
  <dialog 
    v-if="isModalOpen" 
    open 
    aria-labelledby="login-title" 
    aria-modal="true"
    class="modal-dialog"
  >
    <div role="document" class="modal-content">
      <!-- Modal header -->
      <header class="modal-header">
        <h2 id="login-title">Login to your account</h2>
        <button 
          type="button" 
          @click="closeModal" 
          aria-label="Close login form" 
          class="close-button"
        >
          ×
        </button>
      </header>
      
      <!-- Modal body with login form -->
      <main class="modal-body">
        <form @submit.prevent="submitLogin" aria-describedby="login-title">
          <fieldset :disabled="isLoading">
            <legend class="visually-hidden">Login credentials</legend>

            <div v-if="error" class="error-message" role="alert">
              {{ error }}
            </div>

            <div v-if="successMessage" class="success-message" role="alert">
              {{ successMessage }}
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                ref="emailInput"
                v-model="email" 
                placeholder="Enter your email" 
                autocomplete="email"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="password">Password</label>
              <input 
                type="password" 
                id="password" 
                v-model="password" 
                placeholder="Enter your password" 
                autocomplete="current-password"
                required
              />
            </div>
          </fieldset>
          
          <div class="form-actions">
            <button type="button" @click="closeModal">Cancel</button>
            <button type="submit">Login</button>
          </div>
        </form>
      </main>
      
      <footer class="modal-footer">
        <p>Don't have an account? <a href="#" @click.prevent="openRegisterForm">Sign up</a></p>
      </footer>
    </div>
  </dialog>

  <!-- Registration form modal -->
  <RegisterForm 
    v-if="showRegisterForm" 
    @close="handleRegisterClose"
    @registration-success="handleRegistrationSuccess" 
  />
</section>
</template>

<style scoped>
.success-message {
  background-color: rgba(76, 69, 165, 0.15);  /* Полупрозрачный фиолетовый фон */
  color: #4C45A5;                             /* Фиолетовый текст */
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  border: 1px solid rgba(76, 69, 165, 0.3);   /* Фиолетовая рамка */
  font-size: 14px;
  animation: fadeIn 0.3s ease-in-out;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>