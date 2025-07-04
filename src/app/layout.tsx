import { CustomThemeProvider } from '@/components/ThemeProvider';

export const metadata = {
  title: 'GameVault',
  description: 'Your Game Collection Manager',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <CustomThemeProvider>
          {children}
        </CustomThemeProvider>
      </body>
    </html>
  )
}
