"use client"

import { useState } from "react"
import { Camera, Scan, Link, Wallet, ArrowLeft, Check, X, Copy, ExternalLink, Clock, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BaseIcon, EthereumIcon, OptimismIcon, ArbitrumIcon, PolygonIcon, ZoraIcon } from "@/components/network-icons"
import { WalletConnection } from "@/components/WalletConnection"
import { useFarcaster } from "@/contexts/FarcasterContext"
import { usePrivyWallet } from "@/contexts/PrivyContext"

type View = "home" | "scanner" | "browser" | "wallet" | "sessions" | "networks"
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

export default function WarpKey() {
  const [currentView, setCurrentView] = useState<View>("home")
  const [theme, setTheme] = useState<Theme>("dark")
  const [sessions, setSessions] = useState<DAppSession[]>([])
  const [urlInput, setUrlInput] = useState("")
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [pendingTransaction, setPendingTransaction] = useState<Transaction | null>(null)
  const [currentDApp, setCurrentDApp] = useState<DAppSession | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  
  // Use Farcaster and Privy contexts
  const { isAuthenticated: farcasterAuthenticated, user: farcasterUser } = useFarcaster()
  const { walletInfo } = usePrivyWallet()
  
  // Determine connection state from contexts
  const isConnected = farcasterAuthenticated || !!walletInfo
  const wallet = walletInfo ? {
    address: walletInfo.address,
    ens: walletInfo.ensName,
    balance: walletInfo.balance + ' ETH',
    network: currentNetwork.name
  } : null

  const [currentNetwork, setCurrentNetwork] = useState<Network>(SUPPORTED_NETWORKS[0])
  const [showNetworkModal, setShowNetworkModal] = useState(false)
  const [networkBalances, setNetworkBalances] = useState<Record<string, string>>({
    base: "2.45 ETH",
    ethereum: "0.12 ETH",
    optimism: "1.8 ETH",
    arbitrum: "0.95 ETH",
    polygon: "450.2 MATIC",
    zora: "0.05 ETH",
  })

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

  // Mock QR scan
  const handleQRScan = async () => {
    setIsScanning(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const mockSession: DAppSession = {
      id: "uniswap-" + Date.now(),
      name: "Uniswap",
      url: "https://app.uniswap.org",
      icon: "🦄",
      connected: new Date(),
      permissions: ["eth_sendTransaction", "personal_sign"],
    }

    setSessions((prev) => [...prev, mockSession])
    setCurrentDApp(mockSession)
    setIsScanning(false)
    setCurrentView("browser")
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
    setPendingTransaction(null)

    if (approved) {
      setTimeout(() => {
        alert("Transaction signed successfully!")
      }, 300)
    }
  }

  const switchNetwork = async (network: Network) => {
    setCurrentNetwork(network)
    if (wallet) {
      setWallet({
        ...wallet,
        network: network.name,
        balance: networkBalances[network.id] || "0 " + network.symbol,
      })
    }
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
            {/* Wallet Connection Component */}
            <WalletConnection />
            
            {isConnected && (
              <>
                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleQRScan}
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
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Scan QR Code</h2>
              <p className={themeClasses.textMuted}>Point your camera at a WalletConnect QR code</p>
            </div>

            <Card className={themeClasses.card}>
              <CardContent className="p-4">
                <div
                  className={`aspect-square ${theme === "dark" ? "bg-black" : "bg-gray-900"} rounded-lg flex items-center justify-center relative overflow-hidden mb-4`}
                >
                  {isScanning ? (
                    <div className="text-center">
                      <div
                        className={`animate-spin w-8 h-8 border-2 ${theme === "dark" ? "border-white border-t-transparent" : "border-gray-300 border-t-transparent"} rounded-full mx-auto mb-2`}
                      ></div>
                      <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-300"}`}>Scanning...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Camera
                        className={`w-16 h-16 ${theme === "dark" ? "text-gray-600" : "text-gray-400"} mx-auto mb-2`}
                      />
                      <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-300"}`}>
                        Camera preview
                      </p>
                    </div>
                  )}

                  {/* Scanning frame */}
                  <div
                    className={`absolute inset-8 border-2 ${theme === "dark" ? "border-white" : "border-gray-300"} rounded-lg opacity-50`}
                  >
                    <div
                      className={`absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 ${theme === "dark" ? "border-white" : "border-gray-300"}`}
                    ></div>
                    <div
                      className={`absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 ${theme === "dark" ? "border-white" : "border-gray-300"}`}
                    ></div>
                    <div
                      className={`absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 ${theme === "dark" ? "border-white" : "border-gray-300"}`}
                    ></div>
                    <div
                      className={`absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 ${theme === "dark" ? "border-white" : "border-gray-300"}`}
                    ></div>
                  </div>
                </div>

                <Button onClick={handleQRScan} disabled={isScanning} className={`w-full h-12 ${themeClasses.primary}`}>
                  {isScanning ? "Scanning..." : "Start Scan"}
                </Button>
              </CardContent>
            </Card>
          </div>
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
                    <div
                      className={`aspect-video ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"} rounded-lg flex items-center justify-center mb-4`}
                    >
                      <div className="text-center">
                        <ExternalLink className={`w-12 h-12 ${themeClasses.textMuted} mx-auto mb-2`} />
                        <p className={`text-sm ${themeClasses.textMuted}`}>dApp Interface</p>
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
            <WalletConnection />
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
    </div>
  )
}
