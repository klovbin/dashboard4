interface LoginResponse {
  statusCode: number;
  statusMessage: string;
  success: boolean;
  message: string;
  user?: {
    id: number;
    name: string;
    email: string;
    address: string;
    createdAt: string;
  };
}

interface LoginCredentials {
  email: string;
  password: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      
      // Если статус успешный (200-299), устанавливаем success в true
      if (response.ok) {
        return {
          ...data,
          statusCode: response.status,
          statusMessage: response.statusText,
          success: true
        };
      }

      // Если статус не успешный, возвращаем ошибку
      return {
        ...data,
        statusCode: response.status,
        statusMessage: response.statusText,
        success: false,
        message: data.message || 'Ошибка авторизации'
      };
    } catch (error) {
      return {
        statusCode: 500,
        statusMessage: 'Request failed',
        success: false,
        message: 'Произошла ошибка при попытке входа',
      };
    }
  },
}; 