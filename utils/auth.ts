import { useRouter } from 'vue-router'
import { ref } from 'vue'

export const userExists = ref(true)

export const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

export const checkAuthToken = async () => {
  const router = useRouter()
  const token = getCookie('jwt_token')
  if (!token) {
    console.log('No JWT token found, redirecting to login page')
    router.push('/')
    return
  }
  
  try {
    const response = await fetch('/api/validate-user', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      console.log('User no longer exists in database, clearing token and redirecting to login')
      // Clear the invalid token
      document.cookie = 'jwt_token=; path=/; max-age=0; SameSite=Strict'
      userExists.value = false
      router.push('/')
    }
  } catch (error) {
    console.error('Error validating user:', error)
    router.push('/')
  }
} 