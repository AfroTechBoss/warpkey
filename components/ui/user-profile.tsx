'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { useFarcaster } from '@/contexts/FarcasterContext';
import { useSession } from '@/contexts/SessionContext';
import { Clock, Activity, Zap, Users, TrendingUp } from 'lucide-react';

interface UserProfileProps {
  theme: 'dark' | 'light';
  compact?: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({ theme, compact = false }) => {
  const { user: farcasterUser, isAuthenticated } = useFarcaster();
  const { currentSession, getSessionStats } = useSession();

  if (!isAuthenticated || !farcasterUser || !currentSession) {
    return null;
  }

  const stats = getSessionStats();
  const sessionDuration = currentSession ? 
    Math.floor((new Date().getTime() - currentSession.startTime.getTime()) / (1000 * 60)) : 0;

  const themeClasses = {
    card: theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200',
    text: theme === 'dark' ? 'text-white' : 'text-gray-900',
    textSecondary: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
    textMuted: theme === 'dark' ? 'text-gray-400' : 'text-gray-500',
    accent: theme === 'dark' ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700',
    statCard: theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'
  };

  if (compact) {
    return (
      <Card className={`${themeClasses.card} mb-4`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={farcasterUser.pfpUrl} alt={farcasterUser.displayName} />
              <AvatarFallback className={themeClasses.accent}>
                {farcasterUser.displayName?.charAt(0) || farcasterUser.username?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={`font-medium ${themeClasses.text} truncate`}>
                  {farcasterUser.displayName || farcasterUser.username}
                </p>
                <Badge variant="secondary" className="text-xs">
                  FID {farcasterUser.fid}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-green-500" />
                  <span className={`text-xs ${themeClasses.textMuted}`}>
                    {sessionDuration}m active
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3 text-blue-500" />
                  <span className={`text-xs ${themeClasses.textMuted}`}>
                    {currentSession.activityCount} actions
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Profile Card */}
      <Card className={themeClasses.card}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={farcasterUser.pfpUrl} alt={farcasterUser.displayName} />
              <AvatarFallback className={`${themeClasses.accent} text-lg`}>
                {farcasterUser.displayName?.charAt(0) || farcasterUser.username?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className={`text-xl font-semibold ${themeClasses.text}`}>
                  {farcasterUser.displayName || farcasterUser.username}
                </h2>
                <Badge variant="secondary" className="text-sm">
                  FID {farcasterUser.fid}
                </Badge>
              </div>
              {farcasterUser.username && farcasterUser.displayName && (
                <p className={`${themeClasses.textMuted} text-sm`}>@{farcasterUser.username}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className={`text-sm ${themeClasses.textSecondary}`}>Active Session</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Session Stats */}
      <Card className={themeClasses.card}>
        <CardHeader className="pb-3">
          <CardTitle className={`text-lg ${themeClasses.text} flex items-center gap-2`}>
            <TrendingUp className="h-5 w-5" />
            Session Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-3 rounded-lg ${themeClasses.statCard}`}>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-green-500" />
                <span className={`text-sm font-medium ${themeClasses.text}`}>Duration</span>
              </div>
              <p className={`text-lg font-semibold ${themeClasses.text}`}>
                {sessionDuration < 60 ? `${sessionDuration}m` : `${Math.floor(sessionDuration / 60)}h ${sessionDuration % 60}m`}
              </p>
            </div>
            
            <div className={`p-3 rounded-lg ${themeClasses.statCard}`}>
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-4 w-4 text-blue-500" />
                <span className={`text-sm font-medium ${themeClasses.text}`}>Actions</span>
              </div>
              <p className={`text-lg font-semibold ${themeClasses.text}`}>
                {currentSession.activityCount}
              </p>
            </div>
            
            <div className={`p-3 rounded-lg ${themeClasses.statCard}`}>
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className={`text-sm font-medium ${themeClasses.text}`}>Transactions</span>
              </div>
              <p className={`text-lg font-semibold ${themeClasses.text}`}>
                {currentSession.transactionHistory.length}
              </p>
            </div>
            
            <div className={`p-3 rounded-lg ${themeClasses.statCard}`}>
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-purple-500" />
                <span className={`text-sm font-medium ${themeClasses.text}`}>Connected Apps</span>
              </div>
              <p className={`text-lg font-semibold ${themeClasses.text}`}>
                {currentSession.connectedApps.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historical Stats */}
      {stats.totalSessions > 1 && (
        <Card className={themeClasses.card}>
          <CardHeader className="pb-3">
            <CardTitle className={`text-lg ${themeClasses.text}`}>Your WarpKey Journey</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className={`text-sm ${themeClasses.textSecondary}`}>Total Sessions</span>
              <span className={`font-semibold ${themeClasses.text}`}>{stats.totalSessions}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className={`text-sm ${themeClasses.textSecondary}`}>Total Transactions</span>
              <span className={`font-semibold ${themeClasses.text}`}>{stats.totalTransactions}</span>
            </div>
            
            {stats.favoriteNetworks.length > 0 && (
              <div>
                <span className={`text-sm ${themeClasses.textSecondary} block mb-2`}>Favorite Networks</span>
                <div className="flex gap-2 flex-wrap">
                  {stats.favoriteNetworks.map((network) => (
                    <Badge key={network} variant="outline" className="text-xs capitalize">
                      {network}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {stats.mostUsedApps.length > 0 && (
              <div>
                <span className={`text-sm ${themeClasses.textSecondary} block mb-2`}>Most Used Apps</span>
                <div className="flex gap-2 flex-wrap">
                  {stats.mostUsedApps.slice(0, 3).map((app) => (
                    <Badge key={app} variant="outline" className="text-xs">
                      {app}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserProfile;