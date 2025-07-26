"use client"

import { useState, useCallback } from "react"
import { Scanner } from "@yudiel/react-qr-scanner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, X, CheckCircle, AlertCircle } from "lucide-react"

interface QRScannerProps {
  onScanSuccess: (data: string) => void
  onClose: () => void
  theme: "light" | "dark"
  isScanning: boolean
  setIsScanning: (scanning: boolean) => void
}

export function QRScannerComponent({ 
  onScanSuccess, 
  onClose, 
  theme, 
  isScanning, 
  setIsScanning 
}: QRScannerProps) {
  const [error, setError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [scanResult, setScanResult] = useState<string | null>(null)

  const themeClasses = {
    card: theme === "dark" ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200",
    text: theme === "dark" ? "text-white" : "text-gray-900",
    textMuted: theme === "dark" ? "text-gray-400" : "text-gray-600",
    button: theme === "dark" ? "bg-white text-black hover:bg-gray-200" : "bg-gray-900 text-white hover:bg-gray-800",
    buttonSecondary: theme === "dark" ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-gray-100 text-gray-900 hover:bg-gray-200"
  }

  const handleScan = useCallback((detectedCodes: any[]) => {
    if (detectedCodes && detectedCodes.length > 0 && !scanResult) {
      const result = detectedCodes[0].rawValue
      setScanResult(result)
      setIsScanning(false)
      
      // Validate if it's a WalletConnect URI
      if (result.startsWith('wc:') || result.includes('walletconnect')) {
        onScanSuccess(result)
      } else {
        setError('Invalid QR code. Please scan a WalletConnect QR code.')
        setTimeout(() => {
          setError(null)
          setScanResult(null)
          setIsScanning(true)
        }, 3000)
      }
    }
  }, [scanResult, onScanSuccess, setIsScanning])

  const handleError = useCallback((error: unknown) => {
    console.error('QR Scanner Error:', error)
    setError('Camera access denied or not available. Please check your camera permissions.')
    setHasPermission(false)
    setIsScanning(false)
  }, [setIsScanning])

  const startScanning = () => {
    setError(null)
    setScanResult(null)
    setIsScanning(true)
    setHasPermission(null)
  }

  const stopScanning = () => {
    setIsScanning(false)
    onClose()
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Scan WalletConnect QR Code</h2>
        <p className={themeClasses.textMuted}>Point your camera at a WalletConnect QR code to connect</p>
      </div>

      <Card className={themeClasses.card}>
        <CardContent className="p-4">
          <div className="aspect-square rounded-lg overflow-hidden mb-4 relative">
            {isScanning && !error && !scanResult ? (
              <div className="relative w-full h-full">
                <Scanner
                  onScan={handleScan}
                  onError={handleError}
                  constraints={{
                    facingMode: 'environment',
                    aspectRatio: 1
                  }}
                  styles={{
                    container: {
                      width: '100%',
                      height: '100%'
                    },
                    video: {
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }
                  }}
                />
                
                {/* Scanning overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-8 border-2 border-white rounded-lg opacity-75">
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-white"></div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-white"></div>
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-white"></div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-white"></div>
                  </div>
                  
                  {/* Scanning line animation */}
                  <div className="absolute inset-8 overflow-hidden rounded-lg">
                    <div className="absolute w-full h-0.5 bg-white opacity-75 animate-pulse" 
                         style={{ 
                           top: '50%'
                         }}>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`w-full h-full ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"} rounded-lg flex items-center justify-center`}>
                {scanResult ? (
                  <div className="text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-green-600">QR Code Scanned Successfully!</p>
                  </div>
                ) : error ? (
                  <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-2" />
                    <p className="text-sm text-red-600">Camera Error</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Camera className={`w-16 h-16 ${themeClasses.textMuted} mx-auto mb-2`} />
                    <p className={`text-sm ${themeClasses.textMuted}`}>Camera Preview</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            {!isScanning && !scanResult ? (
              <Button 
                onClick={startScanning} 
                className={`w-full h-12 ${themeClasses.button}`}
              >
                <Camera className="w-4 h-4 mr-2" />
                Start Camera
              </Button>
            ) : isScanning ? (
              <Button 
                onClick={() => setIsScanning(false)} 
                variant="outline"
                className={`w-full h-12 ${themeClasses.buttonSecondary}`}
              >
                <X className="w-4 h-4 mr-2" />
                Stop Scanning
              </Button>
            ) : null}
            
            <Button 
              onClick={stopScanning} 
              variant="outline"
              className={`w-full h-10 ${themeClasses.buttonSecondary}`}
            >
              Close Scanner
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}