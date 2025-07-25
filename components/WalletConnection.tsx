'use client';

import React, { useState } from 'react';
import { useFarcaster } from '@/contexts/FarcasterContext';
import { usePrivyWallet } from '@/contexts/PrivyContext';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Loader2, Wallet, User, RefreshCw, LogOut } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WalletConnectionProps {
  className?: string;
}

export const WalletConnection: React.FC<WalletConnectionProps> = ({ className }) => {
  const { 
    user: farcasterUser, 
    isLoading: farcasterLoading, 
    isAuthenticated: farcasterAuthenticated, 
    login: farcasterLogin, 
    logout: farcasterLogout, 
    error: farcasterError 
  } = useFarcaster();
  
  const { 
    walletInfo, 
    isLoading: walletLoading, 
    refreshWalletInfo, 
    error: walletError 
  } = usePrivyWallet();
  
  const { login: privyLogin, logout: privyLogout, authenticated: privyAuthenticated } = usePrivy();
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshWallet = async () => {
    setIsRefreshing(true);
    await refreshWalletInfo();
    setIsRefreshing(false);
  };

  const handleDisconnectAll = () => {
    farcasterLogout();
    privyLogout();
  };

  const isLoading = farcasterLoading || walletLoading;
  const hasError = farcasterError || walletError;

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Connection
          </CardTitle>
          <CardDescription>
            Connect your Farcaster account and wallet to access WarpKey features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error Display */}
          {hasError && (
            <Alert variant="destructive">
              <AlertDescription>
                {farcasterError || walletError}
              </AlertDescription>
            </Alert>
          )}

          {/* Farcaster Connection Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Farcaster Account
              </h3>
              {farcasterAuthenticated && (
                <Badge variant="secondary">Connected</Badge>
              )}
            </div>
            
            {farcasterAuthenticated && farcasterUser ? (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={farcasterUser.pfpUrl} alt={farcasterUser.displayName} />
                  <AvatarFallback>
                    {farcasterUser.displayName?.charAt(0) || farcasterUser.username?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {farcasterUser.displayName || farcasterUser.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    FID: {farcasterUser.fid}
                  </p>
                  {farcasterUser.username && (
                    <p className="text-xs text-muted-foreground">
                      @{farcasterUser.username}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <Button 
                onClick={farcasterLogin} 
                disabled={isLoading}
                className="w-full"
                variant="outline"
              >
                {farcasterLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <User className="h-4 w-4 mr-2" />
                )}
                Connect Farcaster
              </Button>
            )}
          </div>

          <Separator />

          {/* Wallet Connection Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Wallet
              </h3>
              {privyAuthenticated && walletInfo && (
                <Badge variant="secondary">Connected</Badge>
              )}
            </div>
            
            {privyAuthenticated && walletInfo ? (
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Address</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRefreshWallet}
                      disabled={isRefreshing}
                    >
                      <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                  <p className="text-sm font-mono break-all">
                    {walletInfo.address}
                  </p>
                  
                  {walletInfo.ensName && (
                    <div>
                      <span className="text-xs text-muted-foreground">ENS Name</span>
                      <p className="text-sm font-medium">{walletInfo.ensName}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs text-muted-foreground">Balance</span>
                      <p className="text-sm font-medium">{walletInfo.balance} ETH</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Chain</span>
                      <p className="text-sm font-medium">{walletInfo.chainId || 1}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Button 
                onClick={privyLogin} 
                disabled={isLoading}
                className="w-full"
                variant="outline"
              >
                {walletLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Wallet className="h-4 w-4 mr-2" />
                )}
                Connect Wallet
              </Button>
            )}
          </div>

          {/* Disconnect All Button */}
          {(farcasterAuthenticated || privyAuthenticated) && (
            <>
              <Separator />
              <Button 
                onClick={handleDisconnectAll}
                variant="destructive"
                size="sm"
                className="w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Disconnect All
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletConnection;