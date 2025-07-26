'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useFarcaster } from './FarcasterContext';

// Airdrop tracking interface
interface AirdropData {
  id: string;
  name: string;
  protocol: string;
  network: string;
  dateAdded: Date;
  eligibilityStatus: 'eligible' | 'claimed' | 'ineligible' | 'pending';
  claimAmount?: string;
  claimToken?: string;
  claimDate?: Date;
  estimatedValue?: string;
  interactionCount: number;
  totalVolume: string;
  claimUrl?: string;
  claimTxHash?: string;
  requirements: string[];
  trackingId: string; // From Farcaster identity
  launchContext?: string; // How user discovered the airdrop
}

// Enhanced session data with identity integration
interface SessionData {
  sessionId: string;
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  startTime: Date;
  lastActivity: Date;
  activityCount: number;
  connectedApps: string[];
  transactionHistory: SessionTransaction[];
  preferences: UserPreferences;
  // Enhanced identity features
  launchContext?: {
    type: string;
    source?: string;
    referrer?: string;
  };
  airdropTracking: AirdropData[];
  personalizedGreeting?: string;
  platformType?: 'web' | 'mobile';
  isAppAdded?: boolean;
}

interface SessionTransaction {
  id: string;
  hash: string;
  network: string;
  type: 'send' | 'receive' | 'approve' | 'swap' | 'mint';
  amount?: string;
  token?: string;
  to?: string;
  from?: string;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
  dappName?: string;
  castHash?: string; // If shared to Farcaster
}

interface UserPreferences {
  autoShareTransactions: boolean;
  preferredNetworks: string[];
  theme: 'dark' | 'light' | 'auto';
  notifications: {
    transactions: boolean;
    newConnections: boolean;
    security: boolean;
  };
}

interface SessionContextType {
  currentSession: SessionData | null;
  sessionHistory: SessionData[];
  isSessionActive: boolean;
  startSession: () => void;
  endSession: () => void;
  updateActivity: () => void;
  addTransaction: (transaction: Omit<SessionTransaction, 'id' | 'timestamp'>) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  getSessionStats: () => {
    totalSessions: number;
    totalTransactions: number;
    favoriteNetworks: string[];
    mostUsedApps: string[];
  };
  // Enhanced identity and airdrop functions
  addAirdropTracking: (airdrop: Omit<AirdropData, 'trackingId'>) => void;
  updateAirdropStatus: (airdropId: string, status: AirdropData['eligibilityStatus'], claimData?: Partial<AirdropData>) => void;
  getAirdropHistory: () => AirdropData[];
  getPersonalizedInsights: () => {
    totalAirdropsEligible: number;
    totalAirdropsClaimed: number;
    favoriteDiscoveryMethods: string[];
    sessionsByContext: Record<string, number>;
  };
  shareSessionMilestone: (milestone: 'first_transaction' | 'airdrop_claimed' | 'app_added' | 'custom', customData?: any) => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const { 
    user: farcasterUser, 
    isAuthenticated, 
    getUserSessionKey, 
    getAirdropTrackingId, 
    shareToProfile, 
    getPersonalizedGreeting, 
    getLaunchContext 
  } = useFarcaster();
  const [currentSession, setCurrentSession] = useState<SessionData | null>(null);
  const [sessionHistory, setSessionHistory] = useState<SessionData[]>([]);

  // Load session data from localStorage on mount
  useEffect(() => {
    if (farcasterUser?.fid) {
      loadSessionHistory(farcasterUser.fid);
    }
  }, [farcasterUser?.fid]);

  // Auto-start session when Farcaster user is authenticated
  useEffect(() => {
    if (isAuthenticated && farcasterUser && !currentSession) {
      startSession();
    } else if (!isAuthenticated && currentSession) {
      endSession();
    }
  }, [isAuthenticated, farcasterUser, currentSession]);

  // Auto-save session data
  useEffect(() => {
    if (currentSession) {
      saveSessionData();
    }
  }, [currentSession]);

  const loadSessionHistory = (fid: number) => {
    try {
      const stored = localStorage.getItem(`warpkey_sessions_${fid}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSessionHistory(parsed.map((session: any) => ({
          ...session,
          startTime: new Date(session.startTime),
          lastActivity: new Date(session.lastActivity),
          transactionHistory: session.transactionHistory.map((tx: any) => ({
            ...tx,
            timestamp: new Date(tx.timestamp)
          }))
        })));
      }
    } catch (error) {
      console.error('Failed to load session history:', error);
    }
  };

  const saveSessionData = () => {
    if (currentSession && farcasterUser?.fid) {
      try {
        const allSessions = [...sessionHistory];
        const existingIndex = allSessions.findIndex(s => s.sessionId === currentSession.sessionId);
        
        if (existingIndex >= 0) {
          allSessions[existingIndex] = currentSession;
        } else {
          allSessions.push(currentSession);
        }
        
        // Keep only last 50 sessions
        const recentSessions = allSessions
          .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())
          .slice(0, 50);
        
        localStorage.setItem(`warpkey_sessions_${farcasterUser.fid}`, JSON.stringify(recentSessions));
        setSessionHistory(recentSessions);
      } catch (error) {
        console.error('Failed to save session data:', error);
      }
    }
  };

  const startSession = () => {
    if (!farcasterUser) return;

    // Get enhanced identity data
    const sessionKey = getUserSessionKey();
    const launchContext = getLaunchContext();
    const personalizedGreeting = getPersonalizedGreeting();

    const newSession: SessionData = {
      sessionId: sessionKey || `session_${farcasterUser.fid}_${Date.now()}`,
      fid: farcasterUser.fid,
      username: farcasterUser.username,
      displayName: farcasterUser.displayName,
      pfpUrl: farcasterUser.pfpUrl,
      startTime: new Date(),
      lastActivity: new Date(),
      activityCount: 0,
      connectedApps: [],
      transactionHistory: [],
      preferences: {
        autoShareTransactions: false,
        preferredNetworks: ['base', 'ethereum'],
        theme: 'dark',
        notifications: {
          transactions: true,
          newConnections: true,
          security: true
        }
      },
      // Enhanced identity features
      launchContext: launchContext ? {
        type: launchContext.type,
        source: launchContext.cast?.author?.username || launchContext.channel?.name,
        referrer: launchContext.referrerDomain
      } : undefined,
      airdropTracking: [],
      personalizedGreeting,
      platformType: farcasterUser.platformType,
      isAppAdded: farcasterUser.isAppAdded
    };

    setCurrentSession(newSession);
    
    // Log session start with context
    console.log('Enhanced session started:', {
      fid: farcasterUser.fid,
      username: farcasterUser.username,
      launchContext: newSession.launchContext,
      platformType: newSession.platformType
    });
  };

  const endSession = () => {
    if (currentSession) {
      saveSessionData();
      setCurrentSession(null);
    }
  };

  const updateActivity = () => {
    if (currentSession) {
      setCurrentSession(prev => prev ? {
        ...prev,
        lastActivity: new Date(),
        activityCount: prev.activityCount + 1
      } : null);
    }
  };

  const addTransaction = (transaction: Omit<SessionTransaction, 'id' | 'timestamp'>) => {
    if (currentSession) {
      const newTransaction: SessionTransaction = {
        ...transaction,
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date()
      };

      setCurrentSession(prev => prev ? {
        ...prev,
        transactionHistory: [newTransaction, ...prev.transactionHistory].slice(0, 100), // Keep last 100 transactions
        lastActivity: new Date(),
        activityCount: prev.activityCount + 1
      } : null);
    }
  };

  const updatePreferences = (preferences: Partial<UserPreferences>) => {
    if (currentSession) {
      setCurrentSession(prev => prev ? {
        ...prev,
        preferences: { ...prev.preferences, ...preferences }
      } : null);
    }
  };

  const getSessionStats = () => {
    const allTransactions = sessionHistory.flatMap(session => session.transactionHistory);
    const allApps = sessionHistory.flatMap(session => session.connectedApps);
    
    const networkCounts = allTransactions.reduce((acc, tx) => {
      acc[tx.network] = (acc[tx.network] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const appCounts = allApps.reduce((acc, app) => {
      acc[app] = (acc[app] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalSessions: sessionHistory.length,
      totalTransactions: allTransactions.length,
      favoriteNetworks: Object.entries(networkCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([network]) => network),
      mostUsedApps: Object.entries(appCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([app]) => app)
    };
  };

  // Enhanced identity and airdrop functions
  const addAirdropTracking = (airdrop: Omit<AirdropData, 'trackingId'>) => {
    if (!currentSession) return;
    
    const trackingId = getAirdropTrackingId() || `airdrop_${farcasterUser?.fid}_${Date.now()}`;
    const newAirdrop: AirdropData = {
      ...airdrop,
      trackingId,
      launchContext: currentSession.launchContext?.type
    };

    setCurrentSession(prev => prev ? {
      ...prev,
      airdropTracking: [newAirdrop, ...prev.airdropTracking],
      lastActivity: new Date(),
      activityCount: prev.activityCount + 1
    } : null);
  };

  const updateAirdropStatus = (airdropId: string, status: AirdropData['eligibilityStatus'], claimData?: Partial<AirdropData>) => {
    if (!currentSession) return;

    setCurrentSession(prev => prev ? {
      ...prev,
      airdropTracking: prev.airdropTracking.map(airdrop => 
        airdrop.id === airdropId 
          ? { ...airdrop, eligibilityStatus: status, ...claimData }
          : airdrop
      ),
      lastActivity: new Date()
    } : null);
  };

  const getAirdropHistory = (): AirdropData[] => {
    return sessionHistory.flatMap(session => session.airdropTracking || []);
  };

  const getPersonalizedInsights = () => {
    const allAirdrops = getAirdropHistory();
    const sessionContexts = sessionHistory.reduce((acc, session) => {
      const contextType = session.launchContext?.type || 'direct';
      acc[contextType] = (acc[contextType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const discoveryMethods = allAirdrops.reduce((acc, airdrop) => {
      const method = airdrop.launchContext || 'unknown';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalAirdropsEligible: allAirdrops.filter(a => a.eligibilityStatus === 'eligible').length,
      totalAirdropsClaimed: allAirdrops.filter(a => a.eligibilityStatus === 'claimed').length,
      favoriteDiscoveryMethods: Object.entries(discoveryMethods)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([method]) => method),
      sessionsByContext: sessionContexts
    };
  };

  const shareSessionMilestone = async (milestone: 'first_transaction' | 'airdrop_claimed' | 'app_added' | 'custom', customData?: any) => {
    try {
      let content;
      
      switch (milestone) {
        case 'first_transaction':
          content = {
            type: 'achievement' as const,
            title: 'First Transaction on WarpKey! 🎉',
            description: `Just completed my first transaction using WarpKey. The future of wallet interactions is here!`,
            actionUrl: 'https://warpkey.app'
          };
          break;
        case 'airdrop_claimed':
          content = {
            type: 'achievement' as const,
            title: 'Airdrop Claimed! 💰',
            description: `Successfully claimed an airdrop through WarpKey. Smart wallet management pays off!`,
            actionUrl: 'https://warpkey.app'
          };
          break;
        case 'app_added':
          content = {
            type: 'milestone' as const,
            title: 'Added WarpKey to Collection! ⭐',
            description: `WarpKey is now part of my Farcaster app collection. Ready for seamless wallet interactions!`,
            actionUrl: 'https://warpkey.app'
          };
          break;
        case 'custom':
          content = customData;
          break;
        default:
          return;
      }

      await shareToProfile(content);
    } catch (error) {
      console.error('Failed to share session milestone:', error);
    }
  };

  const value: SessionContextType = {
    currentSession,
    sessionHistory,
    isSessionActive: !!currentSession,
    startSession,
    endSession,
    updateActivity,
    addTransaction,
    updatePreferences,
    getSessionStats,
    // Enhanced identity and airdrop functions
    addAirdropTracking,
    updateAirdropStatus,
    getAirdropHistory,
    getPersonalizedInsights,
    shareSessionMilestone
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

export default SessionProvider;