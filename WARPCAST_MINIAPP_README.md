# WarpKey - Warpcast Mini App Integration

This guide explains how to deploy and register WarpKey as a Mini App in Warpcast.

## Overview

WarpKey is configured as a Farcaster Mini App that can be embedded directly within Warpcast. Users can launch WarpKey from casts, direct links, or discovery surfaces in Warpcast.

## Configuration Files

### 1. Manifest File (`/public/manifest.json`)

The manifest defines the app metadata for Warpcast:

```json
{
  "name": "WarpKey",
  "version": "1.0.0",
  "description": "Secure wallet management and transaction signing for Farcaster users",
  "icon": "/placeholder-logo.png",
  "splash_image": "/placeholder-logo.png",
  "home_url": "/",
  "image_url": "/placeholder-logo.png",
  "button_title": "Open WarpKey",
  "permissions": [
    "identity",
    "cast"
  ],
  "frame": {
    "version": "next"
  },
  "miniapp": {
    "manifest_version": "1.0.0",
    "background_color": "#000000",
    "theme_color": "#000000"
  }
}
```

### 2. Security Headers

Configured in `next.config.mjs` and `vercel.json` to allow embedding in Warpcast:

- `X-Frame-Options: ALLOWALL` - Allows the app to be embedded in iframes
- `Content-Security-Policy: frame-ancestors 'self' https://*.warpcast.com https://warpcast.com;` - Restricts embedding to Warpcast domains

### 3. Metadata Configuration

Updated `app/layout.tsx` with:
- Manifest link reference
- Open Graph metadata
- Proper icons and theme colors

## Deployment Steps

### 1. Deploy to Production

```bash
# Build and deploy to Vercel (or your preferred platform)
npm run build
vercel --prod
```

### 2. Verify Manifest Accessibility

Ensure your manifest is accessible at:
```
https://your-domain.com/manifest.json
```

### 3. Register with Farcaster

To register your Mini App with Farcaster:

1. **Submit to Farcaster Registry**: Contact the Farcaster team or use their developer portal to register your Mini App
2. **Provide Required Information**:
   - App name: "WarpKey"
   - Description: "Secure wallet management and transaction signing for Farcaster users"
   - Manifest URL: `https://your-domain.com/manifest.json`
   - App URL: `https://your-domain.com`
   - Icon URL: `https://your-domain.com/placeholder-logo.png`

### 4. Testing in Warpcast

Once registered, test your Mini App:

1. **Direct Link**: Share your app URL in a cast
2. **Frame Integration**: Create frames that link to your Mini App
3. **Discovery**: Users can find your app in Warpcast's Mini App directory

## Integration Features

### Farcaster SDK Integration

WarpKey uses `@farcaster/miniapp-sdk` for:
- User identity detection
- Cast composer integration
- Seamless authentication flow

### Permissions

The app requests these permissions:
- `identity`: Access to user's Farcaster profile
- `cast`: Ability to compose and publish casts

### User Experience

1. **Automatic Detection**: When opened in Warpcast, the app automatically detects the user's Farcaster account
2. **Seamless Authentication**: No additional login required for Farcaster users
3. **Native Integration**: Feels like a native part of the Warpcast experience

## Launch Methods

Users can launch WarpKey through:

1. **Direct Cast Links**: Sharing the app URL in casts
2. **Frame Actions**: Buttons in Farcaster frames that open the Mini App
3. **Discovery**: Browsing the Mini App directory in Warpcast
4. **Deep Links**: Direct links from external sources

## Best Practices

1. **Performance**: Ensure fast loading times for smooth embedding
2. **Responsive Design**: Optimize for mobile viewing within Warpcast
3. **Error Handling**: Graceful fallbacks for non-Farcaster environments
4. **Security**: Validate all user inputs and maintain secure authentication

## Troubleshooting

### Common Issues

1. **Manifest Not Loading**: Check CORS headers and manifest accessibility
2. **Embedding Blocked**: Verify X-Frame-Options and CSP headers
3. **SDK Errors**: Ensure `@farcaster/miniapp-sdk` is properly initialized

### Debug Steps

1. Test manifest URL directly in browser
2. Check browser console for CSP violations
3. Verify SDK initialization in development tools
4. Test in Warpcast's development environment if available

## Next Steps

1. **Custom Icon**: Replace placeholder logo with WarpKey branding
2. **Enhanced Metadata**: Add more detailed app descriptions and screenshots
3. **Analytics**: Implement tracking for Mini App usage
4. **Feature Expansion**: Add more Farcaster-specific features

---

*This configuration enables WarpKey to be fully embedded and discoverable within the Warpcast ecosystem, providing users with seamless access to wallet management functionality directly from their Farcaster client.*