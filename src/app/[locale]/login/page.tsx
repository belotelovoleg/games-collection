'use client';

import { use, useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Box, Container, Typography, TextField, Button, Paper, Alert, Link as MuiLink } from '@mui/material';
import Link from 'next/link';
import { useTranslations } from '@/hooks/useTranslations';

export default function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { locale } = use(params);
  const { t } = useTranslations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t('auth_invalidCredentials'));
      } else {
        router.push(`/${locale}`);
      }
    } catch (error) {
      setError(t('common_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          {t('auth_login')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Button
            variant={locale === 'en' ? 'contained' : 'outlined'}
            size="small"
            sx={{ mx: 1 }}
            component={Link}
            href="/en/login"
          >
            EN
          </Button>
          <Button
            variant={locale === 'ua' ? 'contained' : 'outlined'}
            size="small"
            sx={{ mx: 1 }}
            component={Link}
            href="/ua/login"
          >
            UA
          </Button>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            margin="normal"
            label={t('auth_email')}
            type="email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            id="new-email"
            autoComplete="new-email"
          />
          <TextField
            fullWidth
            margin="normal"
            label={t('auth_password')}
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            id="new-password"
            autoComplete="new-password"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? t('common_loading') : t('auth_signIn')}
          </Button>

          {/* Google Sign In Button */}
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            sx={{ mt: 1, mb: 2 }}
            onClick={() => signIn('google', { callbackUrl: `/${locale}` })}
          >
            {t('auth_signInWithGoogle') || 'Sign in with Google'}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2">
              {t('auth_dontHaveAccount')}{' '}
              <MuiLink component={Link} href={`/${locale}/register`}>
                {t('auth_register')}
              </MuiLink>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
