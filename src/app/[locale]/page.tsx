'use client';

import { use } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { useTranslations } from '@/hooks/useTranslations';
import { Typography, Container, Box } from '@mui/material';

export default function LocalePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const { t } = useTranslations();
  
  return (
    <MainLayout locale={locale}>
      <Container maxWidth="md">
        <Box 
          sx={{ 
            textAlign: 'center',
            py: 4
          }}
        >
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontSize: { xs: '2.5rem', md: '3rem' },
              mb: 3,
              fontWeight: 'bold'
            }}
          >
            🎮 {t('common_appName')}
          </Typography>
          
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontSize: { xs: '1.5rem', md: '1.75rem' },
              mb: 2,
              color: 'primary.main'
            }}
          >
            {t('home_title')}
          </Typography>
          
          <Typography
            variant="h6"
            component="p"
            sx={{
              fontSize: { xs: '1rem', md: '1.25rem' },
              color: 'text.secondary',
              mb: 4,
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            {t('home_subtitle')}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: 'text.disabled',
              fontSize: '0.875rem'
            }}
          >
            Current language: {locale}
          </Typography>
        </Box>
      </Container>
    </MainLayout>
  );
}
