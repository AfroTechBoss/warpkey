# QR Scanner for WalletConnect

The WarpKey app now includes a fully functional QR code scanner that allows you to connect to dApps using WalletConnect QR codes.

## Features

✅ **Real Camera Access**: Uses your device's camera to scan QR codes
✅ **WalletConnect Support**: Specifically designed for WalletConnect QR codes
✅ **Validation**: Automatically validates scanned QR codes to ensure they're WalletConnect URIs
✅ **Error Handling**: Provides clear feedback for camera permissions and invalid QR codes
✅ **Responsive Design**: Works on both desktop and mobile devices
✅ **Theme Support**: Adapts to light and dark themes

## How to Use

1. **Navigate to Scanner**: Click the "Scan QR" button on the home screen
2. **Grant Camera Permission**: Allow camera access when prompted by your browser
3. **Scan QR Code**: Point your camera at a WalletConnect QR code
4. **Automatic Connection**: The app will automatically connect to the dApp once a valid QR code is detected

## Supported QR Code Formats

The scanner supports WalletConnect QR codes that:
- Start with `wc:` protocol
- Contain `walletconnect` in the URI
- Follow the WalletConnect URI specification

## Technical Implementation

### Components Added
- `QRScannerComponent`: Main scanner component with camera integration
- Uses `@yudiel/react-qr-scanner` library for QR code detection
- Integrated with existing WarpKey session management

### Key Functions
- `handleQRScanSuccess()`: Processes valid WalletConnect URIs
- `handleQRScanClose()`: Handles scanner cleanup and navigation
- Real-time QR code validation and error handling

## Browser Compatibility

- **Chrome/Edge**: Full support with camera access
- **Firefox**: Full support with camera access
- **Safari**: Full support with camera access
- **Mobile Browsers**: Full support on iOS Safari and Android Chrome

## Permissions Required

- **Camera Access**: Required to scan QR codes
- The app will request permission automatically when you start scanning
- If permission is denied, you'll see an error message with instructions

## Testing the Scanner

To test the QR scanner:
1. Open any dApp that supports WalletConnect (like Uniswap, OpenSea, etc.)
2. Click "Connect Wallet" and select "WalletConnect"
3. Display the QR code on another device or print it
4. Use WarpKey's scanner to scan the QR code
5. The connection should be established automatically

## Error Messages

- **"Camera access denied"**: Grant camera permissions in your browser
- **"Invalid QR code"**: The scanned code is not a WalletConnect URI
- **"Failed to connect"**: Network or parsing error occurred

## Security Notes

- QR codes are validated before processing
- Only WalletConnect URIs are accepted
- No sensitive data is stored during scanning
- Camera access is only used for QR code scanning

The QR scanner enhances WarpKey's functionality by providing a seamless way to connect to dApps using the industry-standard WalletConnect protocol.