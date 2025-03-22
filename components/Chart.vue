<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { Bar } from "vue-chartjs";
import { getCookie } from '@/utils/auth';
import { useRouter } from 'vue-router';
import { useUserState } from '../composables/useUserState';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from "chart.js";

// Регистрируем компоненты Chart.js
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const router = useRouter();
const transactions = ref([]);
const loading = ref(true);
const error = ref(null);

// Use the shared user state
const { onExchangeRecorded } = useUserState();

// Функция для форматирования даты из ISO формата в нужный формат
const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

// Function to fetch transaction data
const fetchTransactions = async () => {
  try {
    loading.value = true;
    
    // Get the token from cookie using the utility function
    let token = getCookie('jwt_token');

    // If token not found with getCookie, try to get it directly from document.cookie
    if (!token) {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'jwt_token') {
          token = value;
          break;
        }
      }
    }

    if (!token) {
      error.value = 'Authentication required';
      loading.value = false;
      // Redirect to login page if not authenticated
      router.push('/');
      return;
    }
    
    // Запрашиваем данные с сервера, запрашиваем последние 7 транзакций
    const response = await fetch('/api/get-transactions?limit=7', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Получаем и форматируем данные из ответа API
    transactions.value = data.transactions.map(tx => ({
      tokenAmount: tx.tokenAmount,
      date: formatDate(tx.createdAt)
    }));
    
    loading.value = false;
  } catch (err) {
    console.error('Failed to fetch transactions:', err);
    error.value = 'Failed to load transactions';
    
    // If unauthorized error (401), redirect to login
    if (err.response && err.response.status === 401) {
      router.push('/');
    }
    
    loading.value = false;
  }
};

// Загружаем данные при монтировании компонента
onMounted(async () => {
  await fetchTransactions();
  
  // Set up listener for exchange events to refresh the chart data
  const unsubscribe = onExchangeRecorded(() => {
    // Wait a short delay to ensure the transaction is processed on the server
    setTimeout(() => {
      fetchTransactions();
    }, 1000);
  });
  
  // Store the unsubscribe function to clean up later
  return () => {
    unsubscribe();
  };
});

// Формируем данные для графика, данные уже отсортированы на сервере
const chartData = computed(() => ({
  labels: transactions.value.map(tx => tx.date),
  datasets: [
    {
      label: "Transaction Amount",
      data: transactions.value.map(tx => tx.tokenAmount),
      backgroundColor: "#38008a", // Ещё более темный цвет для столбцов
      borderColor: "#ffffff",
      borderWidth: 1,
      borderRadius: 5,
      hoverBackgroundColor: "#4700a0" // Ещё более темный цвет при наведении
    }
  ]
}));

// Опции графика (чтобы был тёмный фон)
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: 0
  },
  plugins: {
    legend: { display: false }
  },
  scales: {
    x: {
      ticks: { color: "#ffffff" },
      grid: { display: false }
    },
    y: {
      ticks: { color: "#ffffff" },
      grid: { color: "rgba(255, 255, 255, 0.1)" },
      beginAtZero: true
    }
  }
};
</script>

<template>
  <div class="chart-container">
    <div v-if="loading" class="loading">Loading transactions...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="transactions.length === 0" class="empty">No transactions found</div>
    <Bar v-else :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
.chart-container {
  width: calc(100% - 45px);
  height: 310px;
  margin: 0 auto;
  padding: 20px;
  margin-top: 20px;
  background-color: #0a0818;
  font-family: Monstserrat;
  border-radius: 10px;
  @media (max-width: 1100px) {
    margin-top: 0;
  }
}

.loading, .error, .empty {
  text-align: center;
  padding: 20px;
  color: white;
}
.error {
  color: #ff6b6b;
}
</style>