'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { PrivyProvider as BasePrivyProvider, usePrivy, useWallets } from '@privy-io/react-auth';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

interface WalletInfo {
  address: string;
  ensName?: string;
  ensAvatar?: string;
  balance?: string;
  chainId?: number;
}

interface PrivyContextType {
  walletInfo: WalletInfo | null;
  isLoading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshWalletInfo: () => Promise<void>;
  error: string | null;
}

const PrivyContext = createContext<PrivyContextType | undefined>(undefined);

export const usePrivyWallet = () => {
  const context = useContext(PrivyContext);
  if (context === undefined) {
    throw new Error('usePrivyWallet must be used within a PrivyWalletProvider');
  }
  return context;
};

// Create a public client for ENS resolution
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

interface PrivyWalletProviderProps {
  children: ReactNode;
}

const PrivyWalletProviderInner: React.FC<PrivyWalletProviderProps> = ({ children }) => {
  const { ready, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && authenticated && wallets.length > 0) {
      refreshWalletInfo();
    }
  }, [ready, authenticated, wallets]);

  const enrichWithENS = async (address: string): Promise<{ ensName?: string; ensAvatar?: string }> => {
    try {
      // Get ENS name
      const ensName = await publicClient.getEnsName({
        address: address as `0x${string}`,
      });

      let ensAvatar;
      if (ensName) {
        // Get ENS avatar if name exists
        ensAvatar = await publicClient.getEnsAvatar({
          name: ensName,
        });
      }

      return { ensName: ensName || undefined, ensAvatar: ensAvatar || undefined };
    } catch (err) {
      console.warn('Failed to resolve ENS for address:', address, err);
      return {};
    }
  };

  const getWalletBalance = async (address: string): Promise<string> => {
    try {
      const balance = await publicClient.getBalance({
        address: address as `0x${string}`,
      });
      
      // Convert from wei to ETH with 4 decimal places
      const ethBalance = Number(balance) / 1e18;
      return ethBalance.toFixed(4);
    } catch (err) {
      console.warn('Failed to get balance for address:', address, err);
      return '0.0000';
    }
  };

  const refreshWalletInfo = async () => {
    if (!authenticated || wallets.length === 0) {
      setWalletInfo(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const primaryWallet = wallets[0];
      const address = primaryWallet.address;

      // Enrich with ENS data
      const ensData = await enrichWithENS(address);
      
      // Get wallet balance
      const balance = await getWalletBalance(address);

      const enrichedWalletInfo: WalletInfo = {
        address,
        ensName: ensData.ensName,
        ensAvatar: ensData.ensAvatar,
        balance,
        chainId: primaryWallet.chainId?.split(':')[1] ? parseInt(primaryWallet.chainId.split(':')[1]) : 1,
      };

      setWalletInfo(enrichedWalletInfo);
    } catch (err) {
      console.error('Failed to refresh wallet info:', err);
      setError('Failed to load wallet information');
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Privy handles wallet connection through its built-in UI
      // The useEffect will automatically refresh wallet info when connection is established
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      setError('Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setWalletInfo(null);
    setError(null);
  };

  const value: PrivyContextType = {
    walletInfo,
    isLoading,
    connectWallet,
    disconnectWallet,
    refreshWalletInfo,
    error,
  };

  return (
    <PrivyContext.Provider value={value}>
      {children}
    </PrivyContext.Provider>
  );
};

interface PrivyWalletProviderProps {
  children: ReactNode;
  appId: string;
}

export const PrivyWalletProvider: React.FC<PrivyWalletProviderProps> = ({ children, appId }) => {
  return (
    <BasePrivyProvider
      appId={appId}
      config={{
        loginMethods: ['wallet', 'email', 'sms'],
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
          logo: undefined,
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      <PrivyWalletProviderInner>
        {children}
      </PrivyWalletProviderInner>
    </BasePrivyProvider>
  );
};

export default PrivyWalletProvider;