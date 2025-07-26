"use client"

import { useState, useEffect } from "react"
import { Camera, Scan, Link, Wallet, ArrowLeft, Check, X, Copy, ExternalLink, Clock, Sun, Moon, History, User, Share } from "lucide-react"
import { QRScannerComponent } from "@/components/ui/qr-scanner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"
import { BaseIcon, EthereumIcon, OptimismIcon, ArbitrumIcon, PolygonIcon, ZoraIcon } from "@/components/network-icons"
import { useSignIn } from '@farcaster/auth-kit'
import { useFarcaster } from "@/contexts/FarcasterContext"
import { SessionProvider, useSession } from "@/contexts/SessionContext"
import { UserProfile } from "@/components/ui/user-profile"
import { SessionHistory } from "@/components/ui/session-history"
import { CastToSign } from "@/components/ui/cast-to-sign"
import sdk from '@farcaster/miniapp-sdk'

type View = "home" | "scanner" | "browser" | "wallet" | "sessions" | "networks" | "profile" | "history" | "cast-to-sign"
type Theme = "dark" | "light"

interface WalletInfo {
  address: string
  ens?: string
  balance: string
  network: string
}

interface DAppSession {
  id: string
  name: string
  url: string
  icon: string
  connected: Date
  permissions: string[]
}

interface Transaction {
  to: string
  value: string
  data?: string
  gas: string
  gasPrice: string
}

interface Network {
  id: string
  name: string
  chainId: number
  symbol: string
  icon: React.ComponentType<{ className?: string; size?: number }>
  rpcUrl: string
  blockExplorer: string
  color: string
}

const SUPPORTED_NETWORKS: Network[] = [
  {
    id: "base",
    name: "Base",
    chainId: 8453,
    symbol: "ETH",
    icon: BaseIcon,
    rpcUrl: "https://mainnet.base.org",
    blockExplorer: "https://basescan.org",
    color: "bg-blue-600",
  },
  {
    id: "ethereum",
    name: "Ethereum",
    chainId: 1,
    symbol: "ETH",
    icon: EthereumIcon,
    rpcUrl: "https://mainnet.infura.io",
    blockExplorer: "https://etherscan.io",
    color: "bg-gray-600",
  },
  {
    id: "optimism",
    name: "Optimism",
    chainId: 10,
    symbol: "ETH",
    icon: OptimismIcon,
    rpcUrl: "https://mainnet.optimism.io",
    blockExplorer: "https://optimistic.etherscan.io",
    color: "bg-red-600",
  },
  {
    id: "arbitrum",
    name: "Arbitrum",
    chainId: 42161,
    symbol: "ETH",
    icon: ArbitrumIcon,
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    blockExplorer: "https://arbiscan.io",
    color: "bg-blue-500",
  },
  {
    id: "polygon",
    name: "Polygon",
    chainId: 137,
    symbol: "MATIC",
    icon: PolygonIcon,
    rpcUrl: "https://polygon-rpc.com",
    blockExplorer: "https://polygonscan.com",
    color: "bg-purple-600",
  },
  {
    id: "zora",
    name: "Zora",
    chainId: 7777777,
    symbol: "ETH",
    icon: ZoraIcon,
    rpcUrl: "https://rpc.zora.energy",
    blockExplorer: "https://explorer.zora.energy",
    color: "bg-black",
  },
]

function WarpKeyContent() {
  const [currentView, setCurrentView] = useState<View>("home")
  const [theme, setTheme] = useState<Theme>("dark")
  const [sessions, setSessions] = useState<DAppSession[]>([])
  const [urlInput, setUrlInput] = useState("")
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [pendingTransaction, setPendingTransaction] = useState<Transaction | null>(null)
  const [currentDApp, setCurrentDApp] = useState<DAppSession | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [showCastModal, setShowCastModal] = useState(false)
  const [lastTransactionHash, setLastTransactionHash] = useState<string | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  
  // Use enhanced Farcaster context and auth
  const { 
    isAuthenticated: farcasterAuthenticated, 
    user: farcasterUser, 
    openCastComposer, 
    addMiniApp, 
    isInFarcaster,
    getPersonalizedGreeting,
    getLaunchContext,
    shareToProfile
  } = useFarcaster()
  const { 
    currentSession, 
    startSession, 
    endSession, 
    addTransaction,
    addAirdropTracking,
    getPersonalizedInsights,
    shareSessionMilestone
  } = useSession()
  const { signIn, isSuccess, isError, error, url } = useSignIn({
    onSuccess: ({ fid }) => {
      console.log('Farcaster sign-in successful, FID:', fid)
      // Start a new session when user signs in
      if (farcasterUser) {
        startSession()
      }
    },
  })
  
  // Network state needs to be declared before wallet object
  const [currentNetwork, setCurrentNetwork] = useState<Network>(SUPPORTED_NETWORKS[0])
  
  // Determine connection state from Farcaster only
  const isConnected = farcasterAuthenticated
  const wallet = farcasterAuthenticated && farcasterUser ? {
    address: farcasterUser.verifiedAddresses?.[0] || '0x0000000000000000000000000000000000000000',
    ens: farcasterUser.username,
    balance: '0.00 ETH',
    network: currentNetwork.name
  } : null
  const [showNetworkModal, setShowNetworkModal] = useState(false)
  const [networkBalances, setNetworkBalances] = useState<Record<string, string>>({
    base: "2.45 ETH",
    ethereum: "0.12 ETH",
    optimism: "1.8 ETH",
    arbitrum: "0.95 ETH",
    polygon: "450.2 MATIC",
    zora: "0.05 ETH",
  })

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setTheme(savedTheme as "light" | "dark")
    }
    
    // Initialize Farcaster authentication on app launch
    if (!farcasterAuthenticated) {
      signIn()
    }
    
    // Start session if user is already authenticated
    if (farcasterAuthenticated && farcasterUser && !currentSession) {
      startSession()
    }
  }, [signIn, farcasterAuthenticated, farcasterUser, currentSession, startSession])

  // Note: sdk.actions.ready() is now called in FarcasterContext initialization

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // Theme classes
  const themeClasses = {
    background: theme === "dark" ? "bg-gray-950" : "bg-gray-50",
    text: theme === "dark" ? "text-white" : "text-gray-900",
    textSecondary: theme === "dark" ? "text-gray-300" : "text-gray-600",
    textMuted: theme === "dark" ? "text-gray-400" : "text-gray-500",
    card: theme === "dark" ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200",
    cardHover: theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-50",
    header: theme === "dark" ? "bg-gray-900/95 border-gray-800" : "bg-white/95 border-gray-200",
    button: theme === "dark" ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200",
    buttonText: theme === "dark" ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-gray-900",
    input:
      theme === "dark"
        ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
        : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400",
    primary: theme === "dark" ? "bg-white text-black hover:bg-gray-100" : "bg-gray-900 text-white hover:bg-gray-800",
    outline:
      theme === "dark"
        ? "border-gray-700 bg-gray-900 hover:bg-gray-800 text-white"
        : "border-gray-300 bg-white hover:bg-gray-50 text-gray-900",
  }

  // Wallet connection is now handled by WalletConnection component

  // Handle QR scan result
  const handleQRScanSuccess = async (walletConnectUri: string) => {
    try {
      console.log('WalletConnect URI:', walletConnectUri)
      
      // Parse WalletConnect URI properly
      let bridge = 'Unknown Bridge'
      let key = 'Unknown Key'
      let dappName = 'WalletConnect dApp'
      
      if (walletConnectUri.startsWith('wc:')) {
        // WalletConnect v1 format: wc:topic@version?bridge=...&key=...
        const uriParts = walletConnectUri.split('?')
        if (uriParts.length > 1) {
          const params = new URLSearchParams(uriParts[1])
          bridge = params.get('bridge') || bridge
          key = params.get('key') || key
          
          // Try to extract dApp name from bridge URL
          try {
            const bridgeUrl = new URL(bridge)
            dappName = bridgeUrl.hostname.replace('www.', '') || dappName
          } catch {
            // Keep default name if bridge URL is invalid
          }
        }
      } else if (walletConnectUri.includes('walletconnect')) {
        // Handle other WalletConnect formats
        try {
          const url = new URL(walletConnectUri)
          bridge = url.origin
          dappName = url.hostname.replace('www.', '')
        } catch {
          // Fallback parsing
          const match = walletConnectUri.match(/https?:\/\/([^\/?]+)/)
          if (match) {
            dappName = match[1].replace('www.', '')
            bridge = match[0]
          }
        }
      }
      
      // Create a session based on WalletConnect URI
      const walletConnectSession: DAppSession = {
        id: "wc-" + Date.now(),
        name: dappName,
        url: bridge,
        icon: "🔗",
        connected: new Date(),
        permissions: ["eth_sendTransaction", "personal_sign", "eth_signTypedData"],
      }

      setSessions((prev) => [...prev, walletConnectSession])
      setCurrentDApp(walletConnectSession)
      setIsScanning(false)
      setCurrentView("browser")
      
      // Show success message
      try {
        alert('Successfully connected to WalletConnect dApp!')
      } catch (alertError) {
        console.log('Successfully connected to WalletConnect dApp!')
      }
    } catch (error) {
      console.error('Failed to process WalletConnect URI:', error)
      try {
        alert('Failed to connect. Please try scanning the QR code again.')
      } catch (alertError) {
        console.log('Failed to connect. Please try scanning the QR code again.')
      }
      setIsScanning(false)
    }
  }

  const handleQRScanClose = () => {
    setIsScanning(false)
    setCurrentView("home")
  }

  // Mock URL connection
  const handleURLConnect = async () => {
    if (!urlInput.trim()) return

    const mockSession: DAppSession = {
      id: "dapp-" + Date.now(),
      name: "Custom dApp",
      url: urlInput,
      icon: "🌐",
      connected: new Date(),
      permissions: ["eth_sendTransaction"],
    }

    setSessions((prev) => [...prev, mockSession])
    setCurrentDApp(mockSession)
    setCurrentView("browser")
    setUrlInput("")
  }

  // Mock transaction request
  const simulateTransactionRequest = () => {
    const mockTx: Transaction = {
      to: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
      value: "0.1 ETH",
      gas: "21000",
      gasPrice: "20 gwei",
    }

    setPendingTransaction(mockTx)
    setShowTransactionModal(true)
  }

  const handleTransactionApproval = (approved: boolean) => {
    setShowTransactionModal(false)
    const currentTx = pendingTransaction
    setPendingTransaction(null)

    if (approved && currentTx) {
      // Generate a mock transaction hash
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`
      setLastTransactionHash(mockTxHash)
      
      // Create transaction record
      const transactionRecord = {
        id: mockTxHash,
        type: 'send' as 'send' | 'receive' | 'approve' | 'swap' | 'mint',
        amount: currentTx.value,
        token: 'ETH',
        network: currentNetwork.name.toLowerCase(),
        hash: mockTxHash,
        status: 'confirmed' as 'pending' | 'confirmed' | 'failed',
        dappName: currentDApp?.name,
        timestamp: new Date()
      }
      
      // Add to session
      if (currentSession) {
        addTransaction(transactionRecord)
      }
      
      // Set for cast-to-sign
      setSelectedTransaction(transactionRecord)
      
      setTimeout(() => {
        // Show cast-to-sign modal if user is authenticated with Farcaster
        if (farcasterAuthenticated) {
          setCurrentView('cast-to-sign')
        } else {
          alert("Transaction signed successfully!")
        }
      }, 300)
    }
  }

  const switchNetwork = async (network: Network) => {
    setCurrentNetwork(network)
    // Note: Wallet network and balance are now managed by Privy context
    // The wallet info will be automatically updated when the network changes
    setShowNetworkModal(false)
  }

  const disconnectSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId))
    if (currentDApp?.id === sessionId) {
      setCurrentDApp(null)
      setCurrentView("home")
    }
  }

  const copyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address)
    }
  }

  const handleCastToSign = async (shareTransaction: boolean) => {
    setShowCastModal(false)
    
    if (shareTransaction && lastTransactionHash) {
      try {
        const castText = `Just signed a transaction on ${currentNetwork.name}! 🚀\n\nTx: ${lastTransactionHash.slice(0, 10)}...${lastTransactionHash.slice(-8)}\n\nPowered by @warpkey`
        
        await openCastComposer({
          text: castText,
          embeds: [`${currentNetwork.blockExplorer}/tx/${lastTransactionHash}`]
        })
      } catch (error) {
        console.error('Failed to open cast composer:', error)
        alert('Failed to open cast composer. Please try again.')
      }
    }
    
    // Reset transaction state
    setLastTransactionHash(null)
  }

  const handleShareWarpKey = async () => {
    try {
      const castText = `Just discovered @warpkey - the ultimate Web3 wallet for Farcaster! 🔑\n\n✨ Seamless dApp connections\n🔒 Secure transaction signing\n🌐 Multi-network support\n\nThe future of Web3 UX is here! #WarpKey #Web3 #Farcaster`
      
      await openCastComposer({
        text: castText
      })
    } catch (error) {
      console.error('Failed to open cast composer:', error)
      alert('Failed to open cast composer. Please try again.')
    }
  }

  const handleAddToCollection = async () => {
    try {
      await addMiniApp()
      alert('WarpKey has been added to your Farcaster collection! 🎉')
    } catch (error) {
      console.error('Failed to add to collection:', error)
      alert('Failed to add WarpKey to your collection. Please try again.')
    }
  }

  const handleEnhancedCastComposer = async (type: 'transaction' | 'achievement' | 'share' | 'custom', customText?: string) => {
    try {
      let castText = ''
      let embeds: string[] = []
      
      switch (type) {
        case 'transaction':
          if (lastTransactionHash) {
            castText = `Just completed a transaction on ${currentNetwork.name}! 🚀\n\nTx: ${lastTransactionHash.slice(0, 10)}...${lastTransactionHash.slice(-8)}\n\nPowered by @warpkey`
            embeds = [`${currentNetwork.blockExplorer}/tx/${lastTransactionHash}`]
          }
          break
        case 'achievement':
          castText = `🎉 Achievement unlocked with @warpkey!\n\n✅ Successfully connected to ${sessions.length} dApps\n💰 Managed transactions across ${SUPPORTED_NETWORKS.length} networks\n🔐 Secure Web3 experience on Farcaster\n\n#WarpKey #Web3Achievement`
          break
        case 'share':
          castText = `Just discovered @warpkey - the ultimate Web3 wallet for Farcaster! 🔑\n\n✨ Seamless dApp connections\n🔒 Secure transaction signing\n🌐 Multi-network support\n\nThe future of Web3 UX is here! #WarpKey #Web3 #Farcaster`
          break
        case 'custom':
          castText = customText || 'Using @warpkey for seamless Web3 on Farcaster! 🚀'
          break
      }
      
      await openCastComposer({
        text: castText,
        embeds: embeds.length > 0 ? embeds as [string] | [string, string] : undefined
      })
    } catch (error) {
      console.error('Failed to open enhanced cast composer:', error)
      alert('Failed to open cast composer. Please try again.')
    }
  }

  return (
    <div className={`min-h-screen ${themeClasses.background} ${themeClasses.text}`}>
      {/* Header */}
      <div className={`sticky top-0 z-50 ${themeClasses.header} backdrop-blur-sm`}>
        <div className="flex items-center justify-between p-4">
          {currentView !== "home" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView("home")}
              className={themeClasses.buttonText}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 ${theme === "dark" ? "bg-white" : "bg-gray-900"} rounded-lg flex items-center justify-center`}
            >
              <span className={`${theme === "dark" ? "text-black" : "text-white"} font-bold text-sm`}>W</span>
            </div>
            <h1 className="text-xl font-semibold">WarpKey</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggleTheme} className={themeClasses.buttonText}>
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {isConnected && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNetworkModal(true)}
                  className={`${themeClasses.buttonText} h-8 px-2`}
                >
                  <currentNetwork.icon size={16} className="mr-1" />
                  <span className="text-xs">{currentNetwork.name}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentView("wallet")}
                  className={themeClasses.buttonText}
                >
                  <Wallet className="w-5 h-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 pb-20">
        {/* Home View */}
        {currentView === "home" && (
          <div className="space-y-6">
            {/* Farcaster Authentication */}
             {!isConnected && (
               <Card className={themeClasses.card}>
                 <CardContent className="p-6 text-center">
                   <div className="mb-4">
                     <div className={`w-16 h-16 ${theme === "dark" ? "bg-purple-900/30" : "bg-purple-100"} rounded-full flex items-center justify-center mx-auto mb-4`}>
                       <span className="text-2xl">🔑</span>
                     </div>
                     <h3 className="text-xl font-semibold mb-2">Connect with Farcaster</h3>
                     <p className={`text-sm ${themeClasses.textMuted} mb-6`}>
                       {url ? 'Scan the QR code with your Farcaster app' : 'Sign in with your Farcaster account to start using WarpKey'}
                     </p>
                   </div>
                   
                   {url && (
                     <div className="mb-6">
                       <div className={`w-48 h-48 ${theme === "dark" ? "bg-white" : "bg-gray-100"} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                         <div className="text-center">
                           <div className="w-40 h-40 bg-black rounded flex items-center justify-center">
                             <span className="text-white text-xs">QR Code</span>
                           </div>
                         </div>
                       </div>
                       <p className={`text-xs ${themeClasses.textMuted}`}>
                         Or open this link: <a href={url} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline break-all">{url.slice(0, 50)}...</a>
                       </p>
                     </div>
                   )}
                   
                   {!url && (
                     <Button
                       onClick={() => signIn()}
                       className={`w-full h-12 bg-purple-600 hover:bg-purple-700 text-white`}
                       disabled={isSuccess}
                     >
                       {isSuccess ? 'Connecting...' : 'Sign in with Farcaster'}
                     </Button>
                   )}
                   
                   {isError && (
                     <p className="text-red-500 text-sm mt-2">
                       {error?.message || 'Failed to sign in'}
                     </p>
                   )}
                 </CardContent>
               </Card>
             )}
            
            {isConnected && (
              <>
                {/* Personalized Greeting */}
                {farcasterAuthenticated && farcasterUser && (
                  <Card className={themeClasses.card}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        {farcasterUser.pfpUrl && (
                          <img 
                            src={farcasterUser.pfpUrl} 
                            alt={farcasterUser.displayName || farcasterUser.username} 
                            className="w-12 h-12 rounded-full"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold text-lg">
                            {getPersonalizedGreeting()}
                          </h3>
                          <p className={`text-sm ${themeClasses.textMuted}`}>
                            {getLaunchContext()?.type ? `Launched from ${getLaunchContext()?.type}` : 'Welcome to WarpKey'}
                          </p>
                        </div>
                      </div>
                      {getPersonalizedInsights() && (
                        <div className={`text-sm ${themeClasses.textSecondary} bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-lg p-3 mt-3`}>
                          <p>Airdrops eligible: {getPersonalizedInsights().totalAirdropsEligible}, Claimed: {getPersonalizedInsights().totalAirdropsClaimed}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* User Profile - Show Farcaster identity */}
                {farcasterAuthenticated && farcasterUser && (
                  <UserProfile 
                     theme={theme} 
                     compact={true}
                    />
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => setCurrentView("scanner")}
                    variant="outline"
                    className={`h-20 flex-col gap-2 ${themeClasses.outline}`}
                  >
                    <Scan className="w-6 h-6" />
                    <span className="text-sm">Scan QR</span>
                  </Button>

                  <Button
                    onClick={() => setCurrentView("browser")}
                    variant="outline"
                    className={`h-20 flex-col gap-2 ${themeClasses.outline}`}
                  >
                    <Link className="w-6 h-6" />
                    <span className="text-sm">Enter URL</span>
                  </Button>
                </div>

                {/* Session Actions */}
                {farcasterAuthenticated && (
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => setCurrentView("history")}
                      variant="outline"
                      className={`h-16 flex-col gap-2 ${themeClasses.outline}`}
                    >
                      <History className="w-5 h-5" />
                      <span className="text-sm">Session History</span>
                    </Button>

                    <Button
                      onClick={() => setCurrentView("cast-to-sign")}
                      variant="outline"
                      className={`h-16 flex-col gap-2 ${themeClasses.outline} border-purple-600/50 hover:border-purple-600 hover:bg-purple-600/10`}
                    >
                      <Share className="w-5 h-5" />
                      <span className="text-sm">Cast to Sign</span>
                    </Button>
                  </div>
                )}

                {/* Farcaster Actions - Only show if Farcaster is connected */}
                {farcasterAuthenticated && (
                  <div className="space-y-3">
                    {/* Add to Collection - Only show if in Farcaster */}
                    {isInFarcaster && (
                      <Button
                        onClick={handleAddToCollection}
                        variant="outline"
                        className={`h-12 flex items-center justify-center gap-2 ${themeClasses.outline} border-blue-600/50 hover:border-blue-600 hover:bg-blue-600/10`}
                      >
                        <span className="text-lg">⭐</span>
                        <span className="text-sm">Add WarpKey to Collection</span>
                      </Button>
                    )}
                    
                    {/* Enhanced Cast Actions */}
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => handleEnhancedCastComposer('share')}
                        variant="outline"
                        className={`h-12 flex-col gap-1 ${themeClasses.outline} border-purple-600/50 hover:border-purple-600 hover:bg-purple-600/10`}
                      >
                        <span className="text-lg">📢</span>
                        <span className="text-xs">Share WarpKey</span>
                      </Button>
                      
                      <Button
                        onClick={() => handleEnhancedCastComposer('achievement')}
                        variant="outline"
                        className={`h-12 flex-col gap-1 ${themeClasses.outline} border-green-600/50 hover:border-green-600 hover:bg-green-600/10`}
                      >
                        <span className="text-lg">🎉</span>
                        <span className="text-xs">Share Achievement</span>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Wallet Summary */}
                <Card className={themeClasses.card}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className={`text-sm ${themeClasses.textMuted} mb-1`}>Total Balance</p>
                        <p className="text-2xl font-semibold">{wallet?.balance}</p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`${theme === "dark" ? "bg-gray-800 text-gray-300 border-gray-700" : "bg-gray-100 text-gray-700 border-gray-300"}`}
                      >
                        {wallet?.network}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${themeClasses.textMuted} font-mono`}>
                        {wallet?.ens || `${wallet?.address.slice(0, 6)}...${wallet?.address.slice(-4)}`}
                      </span>
                      <Button variant="ghost" size="sm" onClick={copyAddress} className="h-8 w-8 p-0">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Active Sessions */}
                {sessions.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium">Connected Apps</h3>
                      {sessions.length > 3 && (
                        <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentView("sessions")}
                        className={themeClasses.buttonText}
                      >
                          View All
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {sessions.slice(0, 3).map((session) => (
                        <Card key={session.id} className={themeClasses.card}>
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"} rounded-lg flex items-center justify-center`}
                                >
                                  <span className="text-lg">{session.icon}</span>
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{session.name}</p>
                                  <p className={`text-xs ${themeClasses.textMuted}`}>
                                    {session.connected.toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => disconnectSession(session.id)}
                                className={`h-8 w-8 p-0 ${themeClasses.textMuted} hover:text-red-500`}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* QR Scanner View */}
        {currentView === "scanner" && (
          <QRScannerComponent
            onScanSuccess={handleQRScanSuccess}
            onClose={handleQRScanClose}
            theme={theme}
            isScanning={isScanning}
            setIsScanning={setIsScanning}
          />
        )}

        {/* Browser View */}
        {currentView === "browser" && (
          <div className="space-y-4">
            {!currentDApp && (
              <Card className={themeClasses.card}>
                <CardHeader>
                  <CardTitle className="text-lg">Connect to dApp</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="https://app.uniswap.org"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className={themeClasses.input}
                  />
                  <Button
                    onClick={handleURLConnect}
                    disabled={!urlInput.trim()}
                    className={`w-full h-12 ${themeClasses.primary}`}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Connect
                  </Button>
                </CardContent>
              </Card>
            )}

            {currentDApp && (
              <div className="space-y-4">
                <Card className={themeClasses.card}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"} rounded-lg flex items-center justify-center`}
                        >
                          <span className="text-lg">{currentDApp.icon}</span>
                        </div>
                        <div>
                          <CardTitle className="text-base">{currentDApp.name}</CardTitle>
                          <p className={`text-sm ${themeClasses.textMuted}`}>{new URL(currentDApp.url).hostname}</p>
                        </div>
                      </div>
                      <Badge className="bg-green-900 text-green-300 border-green-800">Connected</Badge>
                    </div>
                  </CardHeader>
                </Card>

                <Card className={themeClasses.card}>
                  <CardContent className="p-4">
                    <div className="aspect-video rounded-lg overflow-hidden mb-4 relative">
                      <iframe
                        src={currentDApp.url}
                        className="w-full h-full border-0"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                        referrerPolicy="strict-origin-when-cross-origin"
                        title={`${currentDApp.name} dApp Interface`}
                        onLoad={() => {
                          // Inject wallet connection capabilities
                          console.log(`Loaded dApp: ${currentDApp.name}`);
                        }}
                      />
                      
                      {/* Overlay for wallet connection status */}
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-green-900 text-green-300 border-green-800 text-xs">
                          🔗 Wallet Connected
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button
                        onClick={simulateTransactionRequest}
                        className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white text-sm"
                      >
                        Test Transaction
                      </Button>

                      <Button
                        onClick={() => {
                          // Open in external browser for full functionality
                          window.open(currentDApp.url, '_blank', 'noopener,noreferrer');
                        }}
                        variant="outline"
                        className={`w-full h-10 ${theme === "dark" ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-50"} text-sm`}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open in Browser
                      </Button>

                      <Button
                        onClick={() => disconnectSession(currentDApp.id)}
                        variant="outline"
                        className={`w-full h-10 ${theme === "dark" ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-50"} text-sm`}
                      >
                        Disconnect
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Wallet View */}
        {currentView === "wallet" && (
          <div className="space-y-6">
            {isConnected && wallet && (
              <Card className={themeClasses.card}>
                <CardHeader>
                  <CardTitle className="text-lg">Wallet Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className={`text-sm ${themeClasses.textMuted} mb-1`}>Username</p>
                    <p className="font-medium">{wallet.ens || 'No username'}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${themeClasses.textMuted} mb-1`}>Address</p>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm">
                        {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                      </span>
                      <Button variant="ghost" size="sm" onClick={copyAddress} className="h-8 w-8 p-0">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className={`text-sm ${themeClasses.textMuted} mb-1`}>Network</p>
                    <p className="font-medium">{wallet.network}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${themeClasses.textMuted} mb-1`}>Balance</p>
                    <p className="font-medium">{wallet.balance}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Sessions View */}
        {currentView === "sessions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Connected Apps</h2>
              <span className={`text-sm ${themeClasses.textMuted}`}>{sessions.length} active</span>
            </div>

            <div className="space-y-3">
              {sessions.map((session) => (
                <Card key={session.id} className={themeClasses.card}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"} rounded-lg flex items-center justify-center`}
                        >
                          <span className="text-lg">{session.icon}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{session.name}</p>
                          <p className={`text-xs ${themeClasses.textMuted}`}>{new URL(session.url).hostname}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => disconnectSession(session.id)}
                        className={`h-8 w-8 p-0 ${themeClasses.textMuted} hover:text-red-500`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className={`flex items-center gap-2 text-xs ${themeClasses.textMuted} mb-2`}>
                      <Clock className="w-3 h-3" />
                      Connected {session.connected.toLocaleString()}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {session.permissions.map((perm) => (
                        <Badge
                          key={perm}
                          variant="secondary"
                          className={`text-xs ${theme === "dark" ? "bg-gray-800 text-gray-400 border-gray-700" : "bg-gray-100 text-gray-600 border-gray-300"}`}
                        >
                          {perm}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Networks View */}
        {currentView === "networks" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Select Network</h2>
            </div>

            <div className="space-y-2">
              {SUPPORTED_NETWORKS.map((network) => (
                <Card
                  key={network.id}
                  className={`${themeClasses.card} cursor-pointer transition-colors ${
                    currentNetwork.id === network.id
                      ? `ring-2 ${theme === "dark" ? "ring-white" : "ring-gray-900"}`
                      : themeClasses.cardHover
                  }`}
                  onClick={() => switchNetwork(network)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center`}>
                          <network.icon size={24} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{network.name}</p>
                          <p className={`text-xs ${themeClasses.textMuted}`}>Chain ID: {network.chainId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{networkBalances[network.id] || `0 ${network.symbol}`}</p>
                        {currentNetwork.id === network.id && (
                          <Badge className="bg-green-900 text-green-300 border-green-800 text-xs mt-1">Active</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className={themeClasses.card}>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className={`text-sm ${themeClasses.textMuted} mb-2`}>Need a different network?</p>
                  <Button
                    variant="outline"
                    className={`${theme === "dark" ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-50"} text-sm bg-transparent`}
                    disabled
                  >
                    Request Network Addition
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Profile View */}
        {currentView === "profile" && (
          <div className="space-y-6">
            <UserProfile theme={theme} compact={false} />
          </div>
        )}

        {/* Session History View */}
        {currentView === "history" && (
          <div className="space-y-6">
            <SessionHistory theme={theme} />
          </div>
        )}

        {/* Cast to Sign View */}
        {currentView === "cast-to-sign" && (
          <div className="space-y-6">
            <CastToSign 
              theme={theme} 
              transaction={selectedTransaction}
              onClose={() => {
                setCurrentView("home")
                setSelectedTransaction(null)
              }}
            />
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      {showTransactionModal && pendingTransaction && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end">
          <div
            className={`w-full ${theme === "dark" ? "bg-gray-900" : "bg-white"} rounded-t-2xl p-6 animate-in slide-in-from-bottom duration-300`}
          >
            <div
              className={`w-12 h-1 ${theme === "dark" ? "bg-gray-700" : "bg-gray-300"} rounded-full mx-auto mb-6`}
            ></div>

            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">Confirm Transaction</h3>
              <p className={themeClasses.textMuted}>Review the transaction details below</p>
            </div>

            <Card className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"} mb-6`}>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className={themeClasses.textMuted}>To:</span>
                  <span className="font-mono">
                    {pendingTransaction.to.slice(0, 6)}...{pendingTransaction.to.slice(-4)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={themeClasses.textMuted}>Value:</span>
                  <span className="font-semibold">{pendingTransaction.value}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={themeClasses.textMuted}>Gas:</span>
                  <span>{pendingTransaction.gas}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={themeClasses.textMuted}>Gas Price:</span>
                  <span>{pendingTransaction.gasPrice}</span>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleTransactionApproval(false)}
                variant="outline"
                className={`h-12 ${theme === "dark" ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
              >
                <X className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button onClick={() => handleTransactionApproval(true)} className={`h-12 ${themeClasses.primary}`}>
                <Check className="w-4 h-4 mr-2" />
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Network Selection Modal */}
      {showNetworkModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className={`w-full max-w-sm ${theme === "dark" ? "bg-gray-900" : "bg-white"} rounded-2xl p-6 animate-in fade-in duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Switch Network</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNetworkModal(false)}
                className={`h-8 w-8 p-0 ${themeClasses.textMuted} hover:text-current`}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {SUPPORTED_NETWORKS.map((network) => (
                <button
                  key={network.id}
                  onClick={() => switchNetwork(network)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    currentNetwork.id === network.id
                      ? `${theme === "dark" ? "bg-gray-800 ring-1 ring-gray-700" : "bg-gray-100 ring-1 ring-gray-300"}`
                      : `${theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-50"}`
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center`}>
                        <network.icon size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{network.name}</p>
                        <p className={`text-xs ${themeClasses.textMuted}`}>{network.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium">{networkBalances[network.id] || `0 ${network.symbol}`}</p>
                      {currentNetwork.id === network.id && (
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-1 ml-auto"></div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className={`mt-4 pt-4 border-t ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}>
              <Button
                onClick={() => setCurrentView("networks")}
                variant="ghost"
                className={`w-full ${themeClasses.buttonText} text-sm`}
              >
                View All Networks
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cast-to-Sign Modal */}
      {showCastModal && farcasterAuthenticated && lastTransactionHash && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className={`w-full max-w-sm ${theme === "dark" ? "bg-gray-900" : "bg-white"} rounded-2xl p-6 animate-in fade-in duration-300`}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Transaction Signed!</h3>
              <p className={`text-sm ${themeClasses.textMuted}`}>
                Share your transaction with the Farcaster community?
              </p>
            </div>

            <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-50"} mb-6`}>
              <div className="flex items-center gap-3 mb-3">
                <currentNetwork.icon size={20} />
                <span className="font-medium text-sm">{currentNetwork.name}</span>
              </div>
              <p className={`text-xs ${themeClasses.textMuted} font-mono`}>
                {lastTransactionHash.slice(0, 10)}...{lastTransactionHash.slice(-8)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleCastToSign(false)}
                variant="outline"
                className={`h-12 ${theme === "dark" ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
              >
                Skip
              </Button>
              <Button
                onClick={() => handleCastToSign(true)}
                className={`h-12 bg-purple-600 hover:bg-purple-700 text-white`}
              >
                <span className="mr-2">📢</span>
                Share Cast
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function WarpKey() {
  return (
    <SessionProvider>
      <WarpKeyContent />
    </SessionProvider>
  )
}
