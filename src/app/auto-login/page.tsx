"use client";

import { useEffect, useState, Suspense } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CircularProgress, Box, Typography, Alert } from '@mui/material';

function AutoLoginContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState('');
  
  // Get the user's preferred language (default to 'uk' if not found)
  const getLocale = () => {
    // Try to get from localStorage first
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('locale');
      if (stored) return stored;
    }
    
    // Try to get from browser language
    if (typeof navigator !== 'undefined') {
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('uk') || browserLang.startsWith('ua')) {
        return 'uk';
      }
      if (browserLang.startsWith('en')) {
        return 'en';
      }
    }
    
    // Default to Ukrainian
    return 'uk';
  };
  
  useEffect(() => {
    const email = searchParams.get('email');
    const pwd = searchParams.get('pwd');
    const platform = searchParams.get('platform');
    const locale = getLocale();
    
    if (status === 'authenticated') {
      // Already authenticated, redirect to games with platform and locale
      const gamesUrl = platform ? `/${locale}/games?platform=${platform}` : `/${locale}/games`;
      router.push(gamesUrl);
      return;
    }
    
    if (email && pwd && status !== 'loading') {
      // Auto-login with provided credentials
      autoLogin(email, pwd, platform, locale);
    } else if (status !== 'loading') {
      setError('Missing required parameters: email, pwd, platform');
    }
  }, [status, searchParams, router]);
  
  const autoLogin = async (email: string, pwd: string, platform: string | null, locale: string) => {
    try {
      const result = await signIn('credentials', {
        email,
        password: pwd,
        redirect: false
      });
      
      if (result?.ok) {
        // Success - redirect to games with platform and locale
        const gamesUrl = platform ? `/${locale}/games?platform=${platform}` : `/${locale}/games`;
        router.push(gamesUrl);
      } else {
        setError('Invalid credentials or access denied');
      }
      
    } catch (error) {
      console.error('Auto-login error:', error);
      setError('Login failed');
    }
  };
  
  if (error) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="100vh"
        gap={2}
        sx={{ p: 3 }}
      >
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          {error}
        </Alert>
      </Box>
    );
  }
  
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

export default function AutoLoginPage() {
  return (
    <Suspense fallback={
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
          Loading...
        </Typography>
      </Box>
    }>
      <AutoLoginContent />
    </Suspense>
  );
}
