import { ref, onMounted } from 'vue';

export const useCustomCoinPrice = () => {
    const customPrice = ref('Загрузка...');

    const fetchCustomPrice = async () => {
        try {
            const response = await fetch('/api/get_course');
            const data = await response.json();
            
            if (data.course) {
                customPrice.value = `$${data.course.toFixed(2)}`;
            } else {
                throw new Error('Курс не найден');
            }
        } catch (error) {
            console.error('Ошибка загрузки курса:', error);
            customPrice.value = 'Ошибка';
        }
    };

    onMounted(fetchCustomPrice);

    return { customPrice };
};