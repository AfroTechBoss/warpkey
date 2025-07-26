'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Textarea } from './textarea';
import { Input } from './input';
import { useFarcaster } from '@/contexts/FarcasterContext';
import { useSession } from '@/contexts/SessionContext';
import { 
  Share, 
  Zap, 
  ExternalLink, 
  Copy, 
  Check, 
  AlertCircle,
  Hash,
  Clock,
  Users,
  MessageSquare,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Coins
} from 'lucide-react';
import { format } from 'date-fns';

interface CastToSignProps {
  theme: 'dark' | 'light';
  transaction?: {
    id: string;
    type: string;
    amount?: string;
    token?: string;
    network: string;
    hash?: string;
    status: string;
    dappName?: string;
    timestamp: Date;
  };
  onClose?: () => void;
}

type CastTemplate = 'transaction' | 'request' | 'achievement' | 'custom';

export const CastToSign: React.FC<CastToSignProps> = ({ theme, transaction, onClose }) => {
  const { user: farcasterUser, openCastComposer } = useFarcaster();
  const { currentSession, addTransaction } = useSession();
  const [castTemplate, setCastTemplate] = useState<CastTemplate>('transaction');
  const [customMessage, setCustomMessage] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const themeClasses = {
    card: theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200',
    cardSecondary: theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200',
    text: theme === 'dark' ? 'text-white' : 'text-gray-900',
    textSecondary: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
    textMuted: theme === 'dark' ? 'text-gray-400' : 'text-gray-500',
    accent: theme === 'dark' ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700',
    button: theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200',
    buttonText: theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900',
    input: theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send': return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'receive': return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case 'approve': return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case 'swap': return <RefreshCw className="h-4 w-4 text-purple-500" />;
      case 'mint': return <Coins className="h-4 w-4 text-yellow-500" />;
      default: return <Zap className="h-4 w-4 text-gray-500" />;
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

  const generateCastMessage = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://warpkey.app';
    
    switch (castTemplate) {
      case 'transaction':
        if (!transaction) return '';
        const txEmoji = transaction.type === 'send' ? '📤' : transaction.type === 'receive' ? '📥' : '⚡';
        return `${txEmoji} Just ${transaction.type === 'send' ? 'sent' : transaction.type === 'receive' ? 'received' : 'executed'} ${transaction.amount || ''} ${transaction.token || 'ETH'} on ${transaction.network} using @warpkey\n\n${transaction.dappName ? `via ${transaction.dappName}` : 'Seamless wallet experience'}\n\n${baseUrl}${transaction.hash ? `\n\nTx: ${transaction.hash.slice(0, 10)}...${transaction.hash.slice(-8)}` : ''}`;
      
      case 'request':
        return `🔐 Need a signature? Try @warpkey for seamless wallet connections!\n\nSecure • Fast • User-friendly\n\n${baseUrl}`;
      
      case 'achievement':
        const sessionStats = currentSession ? `${currentSession.activityCount} actions, ${currentSession.transactionHistory.length} transactions` : 'multiple transactions';
        return `🎉 Just completed ${sessionStats} with @warpkey!\n\nBuilding onchain with ease 🚀\n\n${baseUrl}`;
      
      case 'custom':
        return customMessage + (customMessage && !customMessage.includes(baseUrl) ? `\n\n${baseUrl}` : '');
      
      default:
        return `⚡ Using @warpkey for seamless wallet interactions\n\n${baseUrl}`;
    }
  };

  const handleCopyMessage = async () => {
    const message = generateCastMessage();
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const handleShareToCast = async () => {
    if (!farcasterUser) return;
    
    setIsSharing(true);
    try {
      const message = generateCastMessage();
      let embeds: string[] = [];
      
      // Add transaction hash as embed if available
      if (transaction?.hash && transaction?.network) {
        const explorerUrls: Record<string, string> = {
          'ethereum': 'https://etherscan.io',
          'base': 'https://basescan.org',
          'optimism': 'https://optimistic.etherscan.io',
          'arbitrum': 'https://arbiscan.io',
          'polygon': 'https://polygonscan.com',
          'zora': 'https://explorer.zora.energy'
        };
        
        const explorerUrl = explorerUrls[transaction.network.toLowerCase()];
        if (explorerUrl) {
          embeds.push(`${explorerUrl}/tx/${transaction.hash}`);
        }
      }
      
      // Add WarpKey URL as second embed if no transaction embed
      if (embeds.length === 0) {
        embeds.push(typeof window !== 'undefined' ? window.location.origin : 'https://warpkey.app');
      }
      
      const result = await openCastComposer({
        text: message,
        embeds: embeds.length > 0 ? embeds as [string] | [string, string] : undefined
      });
      
      if (result?.cast?.hash && transaction) {
        // Update transaction with cast hash
        const updatedTransaction = {
          ...transaction,
          castHash: result.cast.hash,
          sharedAt: new Date()
        };
        
        // Add to session if available
        if (currentSession) {
          addTransaction(updatedTransaction);
        }
      }
      
      if (onClose) onClose();
    } catch (error) {
      console.error('Failed to share cast:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const generateShareUrl = () => {
    const message = encodeURIComponent(generateCastMessage());
    return `https://warpcast.com/~/compose?text=${message}`;
  };

  if (!farcasterUser) {
    return (
      <Card className={themeClasses.card}>
        <CardContent className="p-6 text-center">
          <MessageSquare className={`h-12 w-12 ${themeClasses.textMuted} mx-auto mb-3`} />
          <p className={themeClasses.textMuted}>Connect with Farcaster to share casts</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={themeClasses.card}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className={`text-lg ${themeClasses.text} flex items-center gap-2`}>
            <Share className="h-5 w-5" />
            Cast to Sign
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3 mt-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={farcasterUser.pfpUrl} alt={farcasterUser.displayName} />
            <AvatarFallback className={themeClasses.accent}>
              {farcasterUser.displayName?.charAt(0) || farcasterUser.username?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className={`font-medium ${themeClasses.text}`}>
              {farcasterUser.displayName || farcasterUser.username}
            </p>
            <p className={`text-sm ${themeClasses.textMuted}`}>@{farcasterUser.username}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Transaction Preview */}
        {transaction && (
          <div className={`p-3 rounded-lg border ${themeClasses.cardSecondary}`}>
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
                    {format(transaction.timestamp, 'MMM d, yyyy h:mm a')}
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
              <Badge variant="outline" className="text-xs">
                via {transaction.dappName}
              </Badge>
            )}
          </div>
        )}
        
        {/* Cast Template Selection */}
        <div>
          <label className={`text-sm font-medium ${themeClasses.text} mb-2 block`}>
            Cast Template
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'transaction', label: 'Transaction', icon: Zap, disabled: !transaction },
              { id: 'request', label: 'Request', icon: Hash },
              { id: 'achievement', label: 'Achievement', icon: Sparkles },
              { id: 'custom', label: 'Custom', icon: MessageSquare }
            ].map((template) => (
              <Button
                key={template.id}
                variant={castTemplate === template.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCastTemplate(template.id as CastTemplate)}
                disabled={template.disabled}
                className="justify-start gap-2"
              >
                <template.icon className="h-4 w-4" />
                {template.label}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Custom Message Input */}
        {castTemplate === 'custom' && (
          <div>
            <label className={`text-sm font-medium ${themeClasses.text} mb-2 block`}>
              Custom Message
            </label>
            <Textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Write your custom cast message..."
              className={`min-h-[100px] ${themeClasses.input}`}
              maxLength={320}
            />
            <p className={`text-xs ${themeClasses.textMuted} mt-1`}>
              {customMessage.length}/320 characters
            </p>
          </div>
        )}
        
        {/* Message Preview */}
        <div>
          <label className={`text-sm font-medium ${themeClasses.text} mb-2 block`}>
            Preview
          </label>
          <div className={`p-3 rounded-lg border ${themeClasses.cardSecondary} min-h-[100px]`}>
            <pre className={`text-sm ${themeClasses.textSecondary} whitespace-pre-wrap font-sans`}>
              {generateCastMessage()}
            </pre>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleShareToCast}
            disabled={isSharing || !generateCastMessage().trim()}
            className="flex-1"
          >
            {isSharing ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Sharing...
              </>
            ) : (
              <>
                <Share className="h-4 w-4 mr-2" />
                Share to Farcaster
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleCopyMessage}
            disabled={!generateCastMessage().trim()}
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => {
              const url = generateShareUrl();
              window.open(url, '_blank');
            }}
            disabled={!generateCastMessage().trim()}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Stats */}
        {currentSession && (
          <div className={`p-3 rounded-lg border ${themeClasses.cardSecondary}`}>
            <div className="flex items-center gap-4 text-center">
              <div className="flex-1">
                <p className={`text-lg font-semibold ${themeClasses.text}`}>
                  {currentSession.activityCount}
                </p>
                <p className={`text-xs ${themeClasses.textMuted}`}>Session Actions</p>
              </div>
              <div className="flex-1">
                <p className={`text-lg font-semibold ${themeClasses.text}`}>
                  {currentSession.transactionHistory.length}
                </p>
                <p className={`text-xs ${themeClasses.textMuted}`}>Transactions</p>
              </div>
              <div className="flex-1">
                <p className={`text-lg font-semibold ${themeClasses.text}`}>
                  {currentSession.connectedApps.length}
                </p>
                <p className={`text-xs ${themeClasses.textMuted}`}>Connected Apps</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CastToSign;