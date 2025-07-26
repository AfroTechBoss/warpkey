'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { useSession } from '@/contexts/SessionContext';
import { useFarcaster } from '@/contexts/FarcasterContext';
import { 
  Clock, 
  Activity, 
  Zap, 
  ExternalLink, 
  Calendar,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Coins,
  Palette,
  Filter,
  ChevronDown,
  ChevronUp,
  Share
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface SessionHistoryProps {
  theme: 'dark' | 'light';
}

type FilterType = 'all' | 'today' | 'week' | 'month';
type TransactionFilter = 'all' | 'send' | 'receive' | 'approve' | 'swap' | 'mint';

export const SessionHistory: React.FC<SessionHistoryProps> = ({ theme }) => {
  const { 
    sessionHistory, 
    currentSession, 
    getAirdropHistory, 
    getPersonalizedInsights,
    shareSessionMilestone 
  } = useSession();
  const { user: farcasterUser } = useFarcaster();
  const [sessionFilter, setSessionFilter] = useState<FilterType>('all');
  const [transactionFilter, setTransactionFilter] = useState<TransactionFilter>('all');
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [showTransactions, setShowTransactions] = useState(false);
  const [showAirdrops, setShowAirdrops] = useState(false);

  const themeClasses = {
    card: theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200',
    cardSecondary: theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200',
    text: theme === 'dark' ? 'text-white' : 'text-gray-900',
    textSecondary: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
    textMuted: theme === 'dark' ? 'text-gray-400' : 'text-gray-500',
    accent: theme === 'dark' ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700',
    button: theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200',
    buttonText: theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send': return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'receive': return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case 'approve': return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case 'swap': return <RefreshCw className="h-4 w-4 text-purple-500" />;
      case 'mint': return <Coins className="h-4 w-4 text-yellow-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const filterSessions = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return sessionHistory.filter(session => {
      switch (sessionFilter) {
        case 'today': return session.startTime >= today;
        case 'week': return session.startTime >= weekAgo;
        case 'month': return session.startTime >= monthAgo;
        default: return true;
      }
    });
  };

  const getAllTransactions = () => {
    const allTransactions = sessionHistory.flatMap(session => 
      session.transactionHistory.map(tx => ({ ...tx, sessionId: session.sessionId }))
    );
    
    if (currentSession) {
      allTransactions.unshift(...currentSession.transactionHistory.map(tx => ({ 
        ...tx, 
        sessionId: currentSession.sessionId 
      })));
    }

    return allTransactions
      .filter(tx => transactionFilter === 'all' || tx.type === transactionFilter)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 50); // Show last 50 transactions
  };

  const toggleSessionExpansion = (sessionId: string) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedSessions(newExpanded);
  };

  const filteredSessions = filterSessions();
  const allTransactions = getAllTransactions();

  if (!farcasterUser) {
    return (
      <Card className={themeClasses.card}>
        <CardContent className="p-6 text-center">
          <p className={themeClasses.textMuted}>Connect with Farcaster to view session history</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Filters */}
      <Card className={themeClasses.card}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className={`text-lg ${themeClasses.text} flex items-center gap-2`}>
              <Calendar className="h-5 w-5" />
              Session History
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={!showTransactions && !showAirdrops ? 'default' : 'outline'}
                size="sm"
                onClick={() => { setShowTransactions(false); setShowAirdrops(false); }}
                className="text-xs"
              >
                Sessions
              </Button>
              <Button
                variant={showTransactions ? 'default' : 'outline'}
                size="sm"
                onClick={() => { setShowTransactions(true); setShowAirdrops(false); }}
                className="text-xs"
              >
                Transactions
              </Button>
              <Button
                variant={showAirdrops ? 'default' : 'outline'}
                size="sm"
                onClick={() => { setShowAirdrops(true); setShowTransactions(false); }}
                className="text-xs"
              >
                Airdrops
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2 flex-wrap">
            {showAirdrops ? (
              // Airdrop filters
              ['all', 'claimed', 'pending', 'eligible'].map((filter) => (
                <Button
                  key={filter}
                  variant={sessionFilter === filter ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSessionFilter(filter as FilterType)}
                  className="text-xs capitalize"
                >
                  {filter}
                </Button>
              ))
            ) : showTransactions ? (
              // Transaction filters
              ['all', 'send', 'receive', 'approve', 'swap', 'mint'].map((filter) => (
                <Button
                  key={filter}
                  variant={transactionFilter === filter ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTransactionFilter(filter as TransactionFilter)}
                  className="text-xs capitalize"
                >
                  {filter}
                </Button>
              ))
            ) : (
              // Session filters
              ['all', 'today', 'week', 'month'].map((filter) => (
                <Button
                  key={filter}
                  variant={sessionFilter === filter ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSessionFilter(filter as FilterType)}
                  className="text-xs capitalize"
                >
                  {filter}
                </Button>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {showAirdrops ? (
        /* Airdrop History View */
        <Card className={themeClasses.card}>
          <CardHeader className="pb-3">
            <CardTitle className={`text-lg ${themeClasses.text} flex items-center gap-2`}>
              <Coins className="h-5 w-5" />
              Airdrop Tracking ({getAirdropHistory().length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {getAirdropHistory().length === 0 ? (
              <div className="text-center py-8">
                <Coins className={`h-12 w-12 ${themeClasses.textMuted} mx-auto mb-3`} />
                <p className={themeClasses.textMuted}>No airdrops tracked yet</p>
                <p className={`text-xs ${themeClasses.textMuted} mt-2`}>
                  Connect to dApps and complete transactions to become eligible for airdrops
                </p>
              </div>
            ) : (
              getAirdropHistory().map((airdrop) => (
                <div key={airdrop.id} className={`p-4 rounded-lg border ${themeClasses.cardSecondary}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        airdrop.eligibilityStatus === 'claimed' ? 'bg-green-500/20 text-green-400' :
                        airdrop.eligibilityStatus === 'eligible' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        <Coins className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className={`font-medium ${themeClasses.text}`}>{airdrop.protocol}</h4>
                        <p className={`text-sm ${themeClasses.textMuted}`}>
                          {airdrop.network} • {formatDistanceToNow(airdrop.dateAdded, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`text-xs ${
                        airdrop.eligibilityStatus === 'claimed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        airdrop.eligibilityStatus === 'eligible' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                        'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      }`}>
                        {airdrop.eligibilityStatus}
                      </Badge>
                      {airdrop.estimatedValue && (
                        <p className={`text-sm font-medium ${themeClasses.text} mt-1`}>
                          ~${airdrop.estimatedValue}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className={themeClasses.textMuted}>Interactions:</span>
                      <span className={`ml-2 ${themeClasses.text}`}>{airdrop.interactionCount}</span>
                    </div>
                    <div>
                      <span className={themeClasses.textMuted}>Volume:</span>
                      <span className={`ml-2 ${themeClasses.text}`}>${airdrop.totalVolume}</span>
                    </div>
                  </div>
                  
                  {airdrop.claimUrl && airdrop.eligibilityStatus === 'eligible' && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <Button 
                        size="sm" 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => window.open(airdrop.claimUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Claim Airdrop
                      </Button>
                    </div>
                  )}
                  
                  {airdrop.eligibilityStatus === 'claimed' && airdrop.claimTxHash && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${themeClasses.textMuted}`}>Claim Tx:</span>
                        <span className={`text-xs font-mono ${themeClasses.textSecondary}`}>
                          {airdrop.claimTxHash.slice(0, 10)}...{airdrop.claimTxHash.slice(-8)}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={() => shareSessionMilestone('airdrop_claimed', {
                            protocol: airdrop.protocol,
                            value: airdrop.estimatedValue,
                            network: airdrop.network
                          })}
                        >
                          <Share className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      ) : showTransactions ? (
        /* Transaction History View */
        <Card className={themeClasses.card}>
          <CardHeader className="pb-3">
            <CardTitle className={`text-lg ${themeClasses.text} flex items-center gap-2`}>
              <Zap className="h-5 w-5" />
              Transaction History ({allTransactions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {allTransactions.length === 0 ? (
              <div className="text-center py-8">
                <Zap className={`h-12 w-12 ${themeClasses.textMuted} mx-auto mb-3`} />
                <p className={themeClasses.textMuted}>No transactions found</p>
              </div>
            ) : (
              allTransactions.map((transaction) => (
                <div key={transaction.id} className={`p-3 rounded-lg border ${themeClasses.cardSecondary}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${themeClasses.text} capitalize`}>
                            {transaction.type}
                          </span>
                          <Badge className={`text-xs ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </Badge>
                        </div>
                        <p className={`text-sm ${themeClasses.textMuted}`}>
                          {formatDistanceToNow(transaction.timestamp, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {transaction.amount && (
                        <p className={`font-medium ${themeClasses.text}`}>
                          {transaction.amount} {transaction.token || 'ETH'}
                        </p>
                      )}
                      <p className={`text-xs ${themeClasses.textMuted} capitalize`}>
                        {transaction.network}
                      </p>
                    </div>
                  </div>
                  
                  {transaction.dappName && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs ${themeClasses.textMuted}`}>via</span>
                      <Badge variant="outline" className="text-xs">
                        {transaction.dappName}
                      </Badge>
                      {transaction.castHash && (
                        <Badge variant="outline" className="text-xs text-purple-500">
                          Shared to Farcaster
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {transaction.hash && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs font-mono ${themeClasses.textMuted}`}>
                        {transaction.hash.slice(0, 10)}...{transaction.hash.slice(-8)}
                      </span>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      ) : (
        /* Session History View */
        <div className="space-y-3">
          {filteredSessions.length === 0 ? (
            <Card className={themeClasses.card}>
              <CardContent className="p-6 text-center">
                <Clock className={`h-12 w-12 ${themeClasses.textMuted} mx-auto mb-3`} />
                <p className={themeClasses.textMuted}>No sessions found for the selected period</p>
              </CardContent>
            </Card>
          ) : (
            filteredSessions.map((session) => {
              const isExpanded = expandedSessions.has(session.sessionId);
              const sessionDuration = Math.floor(
                (session.lastActivity.getTime() - session.startTime.getTime()) / (1000 * 60)
              );
              
              return (
                <Card key={session.sessionId} className={themeClasses.card}>
                  <CardContent className="p-4">
                    <div 
                      className="cursor-pointer"
                      onClick={() => toggleSessionExpansion(session.sessionId)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={session.pfpUrl} alt={session.displayName} />
                            <AvatarFallback className={themeClasses.accent}>
                              {session.displayName?.charAt(0) || session.username?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className={`font-medium ${themeClasses.text}`}>
                              {format(session.startTime, 'MMM d, yyyy')}
                            </p>
                            <p className={`text-sm ${themeClasses.textMuted}`}>
                              {format(session.startTime, 'h:mm a')} - {format(session.lastActivity, 'h:mm a')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {sessionDuration < 60 ? `${sessionDuration}m` : `${Math.floor(sessionDuration / 60)}h ${sessionDuration % 60}m`}
                          </Badge>
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className={`text-lg font-semibold ${themeClasses.text}`}>
                            {session.activityCount}
                          </p>
                          <p className={`text-xs ${themeClasses.textMuted}`}>Actions</p>
                        </div>
                        <div>
                          <p className={`text-lg font-semibold ${themeClasses.text}`}>
                            {session.transactionHistory.length}
                          </p>
                          <p className={`text-xs ${themeClasses.textMuted}`}>Transactions</p>
                        </div>
                        <div>
                          <p className={`text-lg font-semibold ${themeClasses.text}`}>
                            {session.connectedApps.length}
                          </p>
                          <p className={`text-xs ${themeClasses.textMuted}`}>Apps</p>
                        </div>
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                        {session.transactionHistory.length > 0 && (
                          <div>
                            <h4 className={`text-sm font-medium ${themeClasses.text} mb-2`}>Recent Transactions</h4>
                            <div className="space-y-2">
                              {session.transactionHistory.slice(0, 3).map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    {getTransactionIcon(tx.type)}
                                    <span className={`capitalize ${themeClasses.textSecondary}`}>{tx.type}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={themeClasses.text}>{tx.amount} {tx.token || 'ETH'}</span>
                                    <Badge className={`text-xs ${getStatusColor(tx.status)}`}>
                                      {tx.status}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {session.connectedApps.length > 0 && (
                          <div>
                            <h4 className={`text-sm font-medium ${themeClasses.text} mb-2`}>Connected Apps</h4>
                            <div className="flex gap-2 flex-wrap">
                              {session.connectedApps.map((app, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {app}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default SessionHistory;