'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Container, Typography, TextField, Button, Paper, Alert, Link as MuiLink } from '@mui/material';
import Link from 'next/link';
import { useTranslations } from '@/hooks/useTranslations';

export default function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const [name, setName] = useState('');
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
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        router.push(`/${locale}/login`);
      } else {
        const data = await response.json();
        setError(data.error || t('common_error'));
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
          {t('auth_register')}
        </Typography>
        {/* Language Switcher */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Button
            variant={locale === 'en' ? 'contained' : 'outlined'}
            size="small"
            sx={{ mx: 1 }}
            component={Link}
            href="/en/register"
          >
            EN
          </Button>
          <Button
            variant={locale === 'ua' ? 'contained' : 'outlined'}
            size="small"
            sx={{ mx: 1 }}
            component={Link}
            href="/ua/register"
          >
            UA
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            margin="normal"
            label={t('auth_name')}
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            id="new-name"
            autoComplete="new-name"
          />
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
            {loading ? t('common_loading') : t('auth_signUp')}
          </Button>
          
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2">
              {t('auth_alreadyHaveAccount')}{' '}
              <MuiLink component={Link} href={`/${locale}/login`}>
                {t('auth_login')}
              </MuiLink>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
