"use client";

import { useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CircularProgress, Box, Typography } from '@mui/material';

export default function GuestLoginPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  useEffect(() => {
    const guestToken = searchParams.get('guest-token');
    const callbackUrl = searchParams.get('callbackUrl') || '/games';
    
    if (status === 'authenticated') {
      // Already authenticated, redirect to callback
      router.push(callbackUrl);
      return;
    }
    
    if (guestToken && status !== 'loading') {
      // Decode the guest token to get credentials
      try {
        const decoded = JSON.parse(Buffer.from(guestToken, 'base64').toString());
        const { guestId, expires } = decoded;
        
        // Check if token is expired
        if (Date.now() > expires) {
          router.push('/login?error=expired');
          return;
        }
        
        // Fetch guest credentials and auto-login
        fetchGuestAndLogin(guestId, callbackUrl);
        
      } catch (error) {
        console.error('Invalid guest token:', error);
        router.push('/login?error=invalid');
      }
    }
  }, [status, searchParams, router]);
  
  const fetchGuestAndLogin = async (guestId: string, callbackUrl: string) => {
    try {
      // Fetch guest credentials from secure endpoint
      const response = await fetch('/api/auth/guest-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId })
      });
      
      if (!response.ok) {
        router.push('/login?error=invalid');
        return;
      }
      
      const { email, tempPassword } = await response.json();
      
      // Use Next-auth to sign in the guest
      const result = await signIn('credentials', {
        email,
        password: tempPassword,
        redirect: false
      });
      
      if (result?.ok) {
        router.push(callbackUrl);
      } else {
        router.push('/login?error=signin');
      }
      
    } catch (error) {
      console.error('Guest login error:', error);
      router.push('/login?error=signin');
    }
  };
  
  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      minHeight="100vh"
      gap={2}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" color="text.secondary">
        Logging you in...
      </Typography>
    </Box>
  );
}
