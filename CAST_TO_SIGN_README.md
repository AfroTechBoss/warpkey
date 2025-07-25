# Cast-to-Sign Feature Documentation

## Overview

The Cast-to-Sign feature allows users to share their transaction activity on Farcaster after successfully signing transactions in the WarpKey wallet. This feature enhances user engagement and promotes the WarpKey brand within the Farcaster ecosystem.

## How It Works

### User Flow
1. User connects their Farcaster account via the Farcaster Mini App SDK
2. User initiates and signs a transaction in WarpKey
3. After successful transaction signing, a modal appears offering to share the transaction
4. If the user chooses to share, the Farcaster cast composer opens with pre-filled content
5. User can edit the cast content and publish it to their Farcaster feed

### Technical Implementation

#### Components Involved
- **FarcasterContext**: Enhanced with `openCastComposer` function
- **Main App (page.tsx)**: Transaction approval flow with cast-to-sign integration
- **Cast Modal**: UI component for the share prompt

#### Key Functions

##### `openCastComposer(options)`
Location: `contexts/FarcasterContext.tsx`

```typescript
interface CastComposerOptions {
  text?: string;        // Pre-filled cast text
  embeds?: string[];    // URLs to embed (e.g., block explorer links)
  channelKey?: string;  // Specific Farcaster channel
}
```

This function uses the Farcaster Mini App SDK to open the native cast composer with pre-filled content.

##### `handleCastToSign(shareTransaction)`
Location: `app/page.tsx`

Handles the user's choice to share or skip sharing their transaction. If sharing is selected, it:
- Formats the cast text with transaction details
- Includes the transaction hash and network information
- Opens the Farcaster cast composer
- Includes a link to the block explorer for the transaction

#### Cast Content Format

The default cast format includes:
```
Just signed a transaction on [Network]! 🚀

Tx: [shortened_hash]

Powered by @warpkey
```

With an embedded link to the full transaction on the respective block explorer.

## Features

### ✅ Implemented
- **Automatic Detection**: Detects when user is authenticated with Farcaster
- **Post-Transaction Prompt**: Shows cast option after successful transaction signing
- **Pre-filled Content**: Automatically generates engaging cast content
- **Network Awareness**: Includes network-specific information and block explorer links
- **User Choice**: Users can choose to share or skip
- **Error Handling**: Graceful handling of cast composer failures

### 🔄 Configurable
- **Cast Text**: Can be customized per transaction type
- **Embeds**: Support for multiple embedded URLs
- **Channels**: Can target specific Farcaster channels
- **Branding**: Customizable mention and branding elements

## Usage Examples

### Basic Transaction Share
```typescript
// After successful transaction
const castText = `Just signed a transaction on ${networkName}! 🚀\n\nTx: ${shortHash}\n\nPowered by @warpkey`

await openCastComposer({
  text: castText,
  embeds: [`${blockExplorer}/tx/${fullHash}`]
})
```

### Custom Channel Share
```typescript
// Share to specific channel
await openCastComposer({
  text: "Just swapped tokens on Base! 💱",
  embeds: [transactionUrl],
  channelKey: "base"
})
```

## Integration Points

### Transaction Types
The feature can be extended to support different cast formats for:
- **Token Swaps**: "Just swapped [tokenA] for [tokenB]!"
- **NFT Purchases**: "Just minted/bought an NFT!"
- **DeFi Interactions**: "Just provided liquidity to [protocol]!"
- **Contract Deployments**: "Just deployed a smart contract!"

### Network Support
Currently supports all networks configured in WarpKey:
- Base
- Ethereum
- Optimism
- Arbitrum
- Polygon
- Zora

Each network includes appropriate block explorer links in the cast embeds.

## Security Considerations

- **No Private Data**: Only public transaction hashes and network information are shared
- **User Consent**: Users explicitly choose whether to share each transaction
- **Sanitized Content**: All cast content is sanitized and validated
- **Error Boundaries**: Failed cast attempts don't affect transaction completion

## Future Enhancements

### Potential Features
- **Transaction Categories**: Different cast templates for different transaction types
- **Achievement System**: Special casts for milestones (first transaction, large amounts, etc.)
- **Community Channels**: Automatic posting to WarpKey community channels
- **Rich Embeds**: Include transaction value, gas fees, and other metadata
- **Social Proof**: Show transaction success rates or user achievements

### Analytics Integration
- Track cast engagement rates
- Monitor feature adoption
- A/B test different cast formats
- Measure brand awareness impact

## Troubleshooting

### Common Issues

**Cast composer doesn't open**
- Ensure user is authenticated with Farcaster
- Check that the Farcaster Mini App SDK is properly initialized
- Verify network connectivity

**Cast content is malformed**
- Check that transaction hash is valid
- Ensure network configuration includes block explorer URL
- Validate cast text length limits

**Modal doesn't appear**
- Confirm user is connected to Farcaster
- Check that transaction was actually successful
- Verify modal state management

### Debug Mode
To enable debug logging for cast-to-sign:
```typescript
// In FarcasterContext.tsx
console.log('Opening cast composer with options:', options)
```

## API Reference

### FarcasterContext Methods

#### `openCastComposer(options?: CastComposerOptions): Promise<void>`
Opens the Farcaster cast composer with optional pre-filled content.

**Parameters:**
- `options.text` (string, optional): Pre-filled cast text
- `options.embeds` (string[], optional): URLs to embed in the cast
- `options.channelKey` (string, optional): Target Farcaster channel

**Throws:**
- Error if user is not authenticated
- Error if SDK call fails

### State Management

#### Cast-to-Sign State Variables
- `showCastModal`: Controls cast prompt modal visibility
- `lastTransactionHash`: Stores the most recent transaction hash
- `farcasterAuthenticated`: Indicates if user is connected to Farcaster

## Contributing

When extending the cast-to-sign feature:

1. **Maintain User Choice**: Always allow users to opt out
2. **Preserve Privacy**: Never share sensitive transaction details
3. **Test Thoroughly**: Verify cast composer integration across different scenarios
4. **Update Documentation**: Keep this README current with any changes

## Dependencies

- `@farcaster/miniapp-sdk`: For cast composer integration
- React state management for modal controls
- Network configuration for block explorer links

This feature enhances user engagement while promoting WarpKey within the Farcaster ecosystem, creating a viral loop that can drive user acquisition and brand awareness.