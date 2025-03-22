import { ref, onMounted } from 'vue';

interface CryptoPrices {
    bitcoin: string;
    ethereum: string;
    binancecoin: string;
}

export const useCryptoPrices = () => {
    const prices = ref<CryptoPrices>({
        bitcoin: 'Загрузка...',
        ethereum: 'Загрузка...',
        binancecoin: 'Загрузка...',
    });

    const fetchPrices = async () => {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana&vs_currencies=usd');
            const data = await response.json();

            prices.value = {
                bitcoin: data.bitcoin?.usd ? `$${data.bitcoin.usd.toFixed(2)}` : 'Ошибка',
                ethereum: data.ethereum?.usd ? `$${data.ethereum.usd.toFixed(2)}` : 'Ошибка',
                binancecoin: data.binancecoin?.usd ? `$${data.binancecoin.usd.toFixed(2)}` : 'Ошибка',
            };
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            prices.value = {
                bitcoin: 'Ошибка',
                ethereum: 'Ошибка',
                binancecoin: 'Ошибка',
            };
        }
    };

    onMounted(fetchPrices);

    return { prices };
};