'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  custodyAddress?: string;
  verifiedAddresses?: string[];
}

interface ComposeCastResult {
  cast: {
    hash: string;
    channelKey?: string;
  } | null;
}

interface FarcasterContextType {
  user: FarcasterUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => void;
  error: string | null;
  openCastComposer: (options?: CastComposerOptions) => Promise<ComposeCastResult>;
}

interface CastComposerOptions {
  text?: string;
  embeds?: [] | [string] | [string, string];
  channelKey?: string;
}

const FarcasterContext = createContext<FarcasterContextType | undefined>(undefined);

export const useFarcaster = () => {
  const context = useContext(FarcasterContext);
  if (context === undefined) {
    throw new Error('useFarcaster must be used within a FarcasterProvider');
  }
  return context;
};

interface FarcasterProviderProps {
  children: ReactNode;
}

export const FarcasterProvider: React.FC<FarcasterProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeFarcaster();
  }, []);

  const initializeFarcaster = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Initialize the SDK
      await sdk.actions.ready();

      // Check if user is already authenticated
      const context = await sdk.context;
      if (context?.user) {
        await loadUserData(context.user);
      }
    } catch (err) {
      console.error('Failed to initialize Farcaster SDK:', err);
      setError('Failed to initialize Farcaster connection');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserData = async (contextUser: any) => {
    try {
      const userData: FarcasterUser = {
        fid: contextUser.fid,
        username: contextUser.username,
        displayName: contextUser.displayName,
        pfpUrl: contextUser.pfpUrl,
        custodyAddress: contextUser.custodyAddress,
        verifiedAddresses: contextUser.verifiedAddresses || [],
      };

      setUser(userData);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Failed to load user data:', err);
      setError('Failed to load user information');
    }
  };

  const login = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use Farcaster's authentication flow
      const authResult = await sdk.actions.openUrl('https://warpcast.com/~/signin');
      
      // After successful authentication, reload user data
      const context = await sdk.context;
      if (context?.user) {
        await loadUserData(context.user);
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  const openCastComposer = async (options: CastComposerOptions = {}) => {
    try {
      if (!isAuthenticated) {
        throw new Error('User must be authenticated to open cast composer');
      }

      // Use the Farcaster Mini App SDK to open the cast composer
      const result = await sdk.actions.composeCast({
        text: options.text || '',
        embeds: options.embeds || [],
        channelKey: options.channelKey,
      });
      
      return result;
    } catch (err) {
      console.error('Failed to open cast composer:', err);
      setError('Failed to open cast composer');
      throw err;
    }
  };

  const value: FarcasterContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    error,
    openCastComposer,
  };

  return (
    <FarcasterContext.Provider value={value}>
      {children}
    </FarcasterContext.Provider>
  );
};

export default FarcasterProvider;