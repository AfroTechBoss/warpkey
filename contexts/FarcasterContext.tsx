'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

// Enhanced user interface with additional identity fields
interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  custodyAddress?: string;
  verifiedAddresses?: string[];
  // Additional context from Mini App SDK
  platformType?: 'web' | 'mobile';
  clientFid?: number;
  isAppAdded?: boolean;
  launchContext?: {
    type: 'cast_embed' | 'cast_share' | 'notification' | 'launcher' | 'channel' | 'open_miniapp';
    cast?: {
      hash: string;
      author: {
        fid: number;
        username?: string;
        displayName?: string;
        pfpUrl?: string;
      };
      text: string;
      embeds?: string[];
      channelKey?: string;
    };
    channel?: {
      key: string;
      name: string;
      imageUrl?: string;
    };
    referrerDomain?: string;
  };
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
  addMiniApp: () => Promise<void>;
  isInFarcaster: boolean;
  // Enhanced identity and personalization functions
  getUserSessionKey: () => string | null;
  getAirdropTrackingId: () => string | null;
  shareToProfile: (content: ShareContent) => Promise<void>;
  getPersonalizedGreeting: () => string;
  getLaunchContext: () => FarcasterUser['launchContext'] | null;
}

interface ShareContent {
  type: 'achievement' | 'transaction' | 'milestone' | 'custom';
  title: string;
  description: string;
  imageUrl?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
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
  const [isInFarcaster, setIsInFarcaster] = useState(false);

  useEffect(() => {
    initializeFarcaster();
  }, []);

  const initializeFarcaster = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if running inside Farcaster and get full context
      const context = await sdk.context;
      setIsInFarcaster(!!context);
      
      // Check if user is already authenticated and load enhanced context
      if (context?.user) {
        await loadUserData(context.user, context);
      }
    } catch (err) {
      console.error('Failed to initialize Farcaster SDK:', err);
      setError('Failed to initialize Farcaster connection');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserData = async (contextUser: any, fullContext?: any) => {
    try {
      // Extract enhanced user data from Mini App context
      const userData: FarcasterUser = {
        fid: contextUser.fid,
        username: contextUser.username,
        displayName: contextUser.displayName,
        pfpUrl: contextUser.pfpUrl,
        custodyAddress: contextUser.custodyAddress,
        verifiedAddresses: contextUser.verifiedAddresses || [],
        // Enhanced context from Mini App SDK
        platformType: fullContext?.client?.platformType,
        clientFid: fullContext?.client?.clientFid,
        isAppAdded: fullContext?.client?.added,
        launchContext: fullContext?.location ? {
          type: fullContext.location.type,
          cast: fullContext.location.cast ? {
            hash: fullContext.location.cast.hash,
            author: fullContext.location.cast.author,
            text: fullContext.location.cast.text,
            embeds: fullContext.location.cast.embeds,
            channelKey: fullContext.location.cast.channelKey,
          } : undefined,
          channel: fullContext.location.channel,
          referrerDomain: fullContext.location.referrerDomain,
        } : undefined,
      };

      setUser(userData);
      setIsAuthenticated(true);
      
      // Log enhanced context for debugging
      console.log('Enhanced Farcaster context loaded:', {
        fid: userData.fid,
        username: userData.username,
        platformType: userData.platformType,
        launchContext: userData.launchContext,
        isAppAdded: userData.isAppAdded,
      });
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
      if (!isInFarcaster) {
        throw new Error('Cast composer is only available within Farcaster');
      }

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

  const addMiniApp = async () => {
    try {
      if (!isInFarcaster) {
        throw new Error('Add to collection is only available within Farcaster');
      }

      // Prompt user to add WarpKey to their Farcaster app collection
      await sdk.actions.addMiniApp();
    } catch (err) {
      console.error('Failed to add mini app:', err);
      setError('Failed to add WarpKey to your collection');
      throw err;
    }
  };

  // Enhanced identity and personalization functions
  const getUserSessionKey = (): string | null => {
    if (!user?.fid) return null;
    return `warpkey_session_${user.fid}_${Date.now().toString(36)}`;
  };

  const getAirdropTrackingId = (): string | null => {
    if (!user?.fid) return null;
    // Create a unique tracking ID based on FID and app context
    const baseId = `airdrop_${user.fid}`;
    const contextSuffix = user.launchContext?.type ? `_${user.launchContext.type}` : '';
    return `${baseId}${contextSuffix}`;
  };

  const shareToProfile = async (content: ShareContent): Promise<void> => {
    try {
      if (!isInFarcaster || !isAuthenticated) {
        throw new Error('Profile sharing requires Farcaster authentication');
      }

      // Construct personalized cast text based on content type
      let castText = '';
      switch (content.type) {
        case 'achievement':
          castText = `🎉 Just achieved: ${content.title}\n\n${content.description}`;
          break;
        case 'transaction':
          castText = `💫 Transaction completed: ${content.title}\n\n${content.description}`;
          break;
        case 'milestone':
          castText = `🚀 Milestone reached: ${content.title}\n\n${content.description}`;
          break;
        default:
          castText = `${content.title}\n\n${content.description}`;
      }

      // Add personalized signature
      if (user?.username) {
        castText += `\n\n— Shared via @${user.username} on WarpKey`;
      } else {
        castText += '\n\n— Shared via WarpKey';
      }

      const embeds = [];
      if (content.imageUrl) embeds.push(content.imageUrl);
      if (content.actionUrl) embeds.push(content.actionUrl);

      await openCastComposer({
        text: castText,
        embeds: embeds.slice(0, 2) as [] | [string] | [string, string],
      });
    } catch (err) {
      console.error('Failed to share to profile:', err);
      setError('Failed to share to your Farcaster profile');
      throw err;
    }
  };

  const getPersonalizedGreeting = (): string => {
    if (!user) return 'Welcome to WarpKey!';
    
    const name = user.displayName || user.username || `User ${user.fid}`;
    const timeOfDay = new Date().getHours();
    let greeting = 'Hello';
    
    if (timeOfDay < 12) greeting = 'Good morning';
    else if (timeOfDay < 18) greeting = 'Good afternoon';
    else greeting = 'Good evening';
    
    // Add context-aware messaging
    let contextMessage = '';
    if (user.launchContext?.type === 'cast_embed') {
      contextMessage = ' Ready to interact with that cast?';
    } else if (user.launchContext?.type === 'channel') {
      contextMessage = ` Welcome from /${user.launchContext.channel?.key}!`;
    } else if (user.isAppAdded) {
      contextMessage = ' Thanks for adding WarpKey to your collection!';
    }
    
    return `${greeting}, ${name}!${contextMessage}`;
  };

  const getLaunchContext = (): FarcasterUser['launchContext'] | null => {
    return user?.launchContext || null;
  };

  const value: FarcasterContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    error,
    openCastComposer,
    addMiniApp,
    isInFarcaster,
    // Enhanced identity and personalization functions
    getUserSessionKey,
    getAirdropTrackingId,
    shareToProfile,
    getPersonalizedGreeting,
    getLaunchContext,
  };

  return (
    <FarcasterContext.Provider value={value}>
      {children}
    </FarcasterContext.Provider>
  );
};

export default FarcasterProvider;