'use client';

import { FarcasterProvider } from "@/contexts/FarcasterContext";
import { AuthKitProvider } from '@farcaster/auth-kit';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const config = {
    rpcUrl: 'https://mainnet.optimism.io',
    domain: 'warpkey.app',
    siweUri: 'https://warpkey.app/login',
  };

  return (
    <AuthKitProvider config={config}>
      <FarcasterProvider>
        {children}
      </FarcasterProvider>
    </AuthKitProvider>
  );
}