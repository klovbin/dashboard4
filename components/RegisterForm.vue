<script>
export default {
  emits: ['close', 'registration-success'],
  data() {
    return {
      email: '',
      password: '',
      confirmPassword: '',
      referralCode: '',
      validReferralCodes: ['REF923', 'BONUS21', 'WELCOME45', 'START2024', 'FRIEND99'],
      passwordsMatch: false,
      error: '',
      successMessage: '',
      referralError: ''
    }
  },
  watch: {
    confirmPassword(newVal) {
      this.passwordsMatch = newVal === this.password
    },
    password(newVal) {
      this.passwordsMatch = newVal === this.confirmPassword
    }
  },
  methods: {
    closeModal() {
      // Reset form
      this.email = ''
      this.password = ''
      this.confirmPassword = ''
      this.referralCode = ''
      this.$emit('close') // Emit close event to parent
    },
    async submitRegister() {
      this.error = ''
      this.referralError = ''
      
      if (!this.email || !this.password || !this.confirmPassword) {
        const errorMsg = 'Пожалуйста, заполните все поля'
        console.error('Validation error:', errorMsg)
        this.error = errorMsg
        return
      }

      if (!this.passwordsMatch) {
        const errorMsg = 'Пароли не совпадают'
        console.error('Validation error:', errorMsg)
        this.error = errorMsg
        return
      }

      // Проверка реферального кода если он введен
      if (this.referralCode && !this.validReferralCodes.includes(this.referralCode)) {
        const errorMsg = 'Invalid referral code'
        console.error('Validation error:', errorMsg)
        this.referralError = errorMsg
        return
      }
      
      try {
        console.log('Sending registration data:', {
          email: this.email,
          password: this.password
        })

        const response = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: this.email,
            password: this.password
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.statusMessage || 'Registration failed')
        }

        const result = await response.json()
        console.log('Registration response:', result)
        
        // Emit success event with message
        this.$emit('registration-success', result.message || 'Registration successful!')
        
        // Reset form and close modal after successful registration
        setTimeout(() => {
          this.email = ''
          this.password = ''
          this.confirmPassword = ''
          this.referralCode = ''
          this.closeModal()
        }, 1000)
        
      } catch (error) {
        console.error('Registration error:', error)
        this.error = error.message || 'Registration failed. Please try again.'
      }
    },
    handleLoginClick() {
      this.closeModal() // This will trigger the parent's handleRegisterClose method
    }
  }
}
</script>

<template>
<section class="register-section">
  <!-- Modal backdrop and container -->
  <dialog 
    open 
    aria-labelledby="register-title" 
    aria-modal="true"
    class="modal-dialog"
  >
    <div role="document" class="modal-content">
      <!-- Modal header -->
      <header class="modal-header">
        <h2 id="register-title">Create your account</h2>
        <button 
          type="button" 
          @click="closeModal" 
          aria-label="Close registration form" 
          class="close-button"
        >
          ×
        </button>
      </header>
      
      <!-- Modal body with registration form -->
      <main class="modal-body">
        <form @submit.prevent="submitRegister" aria-describedby="register-title">
          <fieldset>
            <legend class="visually-hidden">Registration details</legend>
            
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
                autocomplete="new-password"
                required
              />
            </div>

            <div class="form-group" :class="{ 'password-confirm': true, 'mismatch': !passwordsMatch && confirmPassword }">
              <label for="confirm-password">Confirm Password</label>
              <input 
                type="password" 
                id="confirm-password" 
                v-model="confirmPassword" 
                placeholder="Confirm your password" 
                autocomplete="new-password"
                required
              />
              <div v-if="!passwordsMatch && confirmPassword" class="validation-message error-message">
                Пароли не совпадают
              </div>
            </div>

            <div class="form-group">
              <label for="referral-code">Referral Code (optional)</label>
              <input 
                type="text" 
                id="referral-code" 
                v-model="referralCode" 
                placeholder="Enter referral code if you have one"
                :class="{ 'error': referralError }"
              />
              <div v-if="referralError" class="validation-message error-message">
                {{ referralError }}
              </div>
            </div>
          </fieldset>
          
          <div class="form-actions">
            <button type="button" @click="closeModal">Cancel</button>
            <button type="submit" :disabled="!passwordsMatch">Register</button>
          </div>
        </form>
      </main>
      
      <footer class="modal-footer">
        <p>Already have an account? <a href="#" @click.prevent="handleLoginClick">Login</a></p>
      </footer>
    </div>
  </dialog>
</section>
</template>

<style scoped>
.success-message {
  background-color: rgba(76, 69, 165, 0.15);
  color: #4C45A5;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  border: 1px solid rgba(76, 69, 165, 0.3);
  font-size: 14px;
  animation: fadeIn 0.3s ease-in-out;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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

.error-message {
  color: #dc3545;
  font-size: 12px;
  margin-top: 5px;
}

.password-confirm.mismatch input {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}

.password-mismatch-message {
  color: #dc3545;
  font-size: 12px;
  margin-top: 5px;
}

.validation-message {
  font-size: 12px;
  margin-top: 5px;
}

input.error {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}

/* Удаляем класс match для подсветки зеленым при совпадении паролей */
.password-confirm.match input {
  /* Удаляем эти стили */
  display: none;
}
</style>
