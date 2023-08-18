import React, { FC, useMemo, useState } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

export const Wallet: FC = () => {
    // this is broken, todo: fix
    const [selectedNetwork, setSelectedNetwork] = useState(WalletAdapterNetwork.Devnet);

    const handleNetworkChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedNetwork(event.target.value as WalletAdapterNetwork);
    };

    return (
                    <div className="flex w-full items-right justify-end">
                        <select
                            id="network-select"
                            value={selectedNetwork}
                            onChange={handleNetworkChange}
                            className="px-4 py-2 text-lg font-medium border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mr-4"
                        >
                            <option value={WalletAdapterNetwork.Devnet}>Devnet</option>
                            <option value={WalletAdapterNetwork.Testnet}>Testnet</option>
                            <option value={WalletAdapterNetwork.Mainnet}>Mainnet Beta</option>
                        </select>
                        <WalletMultiButton className="px-4 py-2 text-lg font-medium border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <WalletDisconnectButton className="px-4 py-2 text-lg font-medium border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>

    );
};