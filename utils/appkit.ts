import { createAppKit, useAppKit, useAppKitAccount } from '@reown/appkit/vue';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { bsc, type AppKitNetwork } from '@reown/appkit/networks';

const projectId = import.meta.env.VITE_REOWN_ID;

if (!projectId) {
    throw new Error("VITE_REOWN_ID is required in .env file");
}

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [bsc];

const wagmiAdapter = new WagmiAdapter({
    networks,
    projectId
});

createAppKit({
    adapters: [wagmiAdapter],
    networks,
    projectId,
    features: {
        connectMethodsOrder: ['wallet'],
        analytics: true // Optional - defaults to your Cloud configuration
    }
});

export const modal = useAppKit();
export const accountData = useAppKitAccount();
