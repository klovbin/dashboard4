<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import { getCookie } from '@/utils/auth';
import { useRouter } from 'vue-router';

// Transaction interface based on MongoDB structure
interface Transaction {
  _id: string;
  userEmail: string;
  tokenAmount: number;
  usdtAmount: number;
  address: string;
  status: string;
  createdAt: string;
  __v: number;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface ApiResponse {
  transactions: Transaction[];
  pagination: PaginationInfo;
}

const router = useRouter();
const transactions = ref<Transaction[]>([]);
const loading = ref(true);
const error = ref('');

// Pagination
const currentPage = ref(1);
const totalPages = ref(1);
const itemsPerPage = ref(5);

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${day}.${month}.${year} ${hours}.${minutes}`;
};

// Fetch transactions from API
const fetchTransactions = async (page = 1) => {
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

    // Call the API with pagination
    const response = await axios.get<ApiResponse>(`/api/get-transactions?page=${page}&limit=${itemsPerPage.value}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Transactions from API:', response.data.transactions);

    // Update the data
    transactions.value = response.data.transactions;
    totalPages.value = response.data.pagination.pages || 1;
    currentPage.value = response.data.pagination.page || 1;

  } catch (err: any) {
    error.value = 'Failed to load transactions';
    // If unauthorized error (401), redirect to login
    if (err.response && err.response.status === 401) {
      router.push('/');
    }
  } finally {
    loading.value = false;
  }
};

const nextPage = async () => {
  if (currentPage.value < totalPages.value) {
    await fetchTransactions(currentPage.value + 1);
  }
};

const prevPage = async () => {
  if (currentPage.value > 1) {
    await fetchTransactions(currentPage.value - 1);
  }
};

// Добавим слушатель изменения размера окна
const handleResize = () => {
  itemsPerPage.value = window.innerWidth <= 580 ? 3 : 5;
  fetchTransactions(1); // Перезагружаем с первой страницы при изменении размера
};

onMounted(() => {
  itemsPerPage.value = window.innerWidth <= 580 ? 3 : 5;
  fetchTransactions();
  window.addEventListener('resize', handleResize);
});

// Добавим очистку слушателя
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <table class="table__wrapper">
    <thead class="table__header">
      <tr class="table__titles title">
        <th class="title__token">Token Almount</th>
        <th class="title__usdt">Usdt Almount</th>
        <th class="title__address">Address</th>
        <th class="title__status">Status</th>
        <th class="title__date">Date</th>
      </tr>
    </thead>
    <tbody class="table__body">
      <tr v-for="transaction in transactions" :key="transaction._id">
        <td data-label="Token Amount">{{ transaction.tokenAmount }}</td>
        <td data-label="USDT Amount">{{ transaction.usdtAmount }}</td>
        <td data-label="Address">{{ transaction.address }}</td>
        <td data-label="Status">
          <span class="status-badge" :class="transaction.status">
            {{ transaction.status }}
          </span>
        </td>
        <td data-label="Date">{{ formatDate(transaction.createdAt) }}</td>
      </tr>
    </tbody>
  </table>
  
  <!-- Pagination controls -->
  <div v-if="totalPages > 1" class="pagination">
    <button 
      :disabled="currentPage === 1" 
      @click="prevPage" 
      class="pagination__button pagination__button--prev"
    >
      &laquo; Last
    </button>
    
    <span class="pagination__info">Page {{ currentPage }} из {{ totalPages }}</span>
    
    <button 
      :disabled="currentPage === totalPages" 
      @click="nextPage" 
      class="pagination__button pagination__button--next"
    >
      Next &raquo;
    </button>
  </div>
</template>