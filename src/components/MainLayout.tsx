'use client';

import { useState, ReactNode } from 'react';
import {
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Box,
  Switch,
  FormControlLabel,
  Button,
  Avatar,
  Menu,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  VideogameAsset as GamesIcon,
  SportsEsports as ConsolesIcon,
  LightMode,
  DarkMode,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  Logout as LogoutIcon,
  AccountCircle,
  AdminPanelSettings as AdminIcon,
  WarehouseOutlined as WarehouseIcon,
} from '@mui/icons-material';
import Link from 'next/link';
// Flag images will be loaded from public/assets via <img>
import { useSession, signOut } from 'next-auth/react';
import { useCustomTheme } from './ThemeProvider';
import { useTranslations } from '@/hooks/useTranslations';
import { Tooltip } from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';

const drawerWidth = 240;

interface MainLayoutProps {
  children: ReactNode;
  locale: string;
}

export function MainLayout({ children, locale }: MainLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { isDark, toggleTheme } = useCustomTheme();
  const { data: session, status } = useSession();
  const { t } = useTranslations();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    signOut();
    handleClose();
  };

  // Menu items for authenticated users
  const authenticatedMenuItems = [
    { 
      text: t('nav_home'), 
      icon: <HomeIcon />, 
      href: `/${locale}` 
    },
    { 
      text: t('nav_games'), 
      icon: <GamesIcon />, 
      href: `/${locale}/games` 
    },
    { 
      text: t('nav_consoles'), 
      icon: <ConsolesIcon />, 
      href: `/${locale}/consoles` 
    },
    {
      text: t('nav_gameLocations') || 'Game Locations',
      icon: <WarehouseIcon />,
      href: `/${locale}/game-locations`
    },
  ];

  // Add admin menu items if user is admin
  if (session?.user?.role === 'ADMIN') {
    authenticatedMenuItems.push({
      text: t('admin_consoles'),
      icon: <AdminIcon />,
      href: `/${locale}/admin/consoles`
    });
  }

  // Menu items for guests
  const guestMenuItems = [
    { 
      text: t('nav_login'), 
      icon: <LoginIcon />, 
      href: `/${locale}/login` 
    },
    { 
      text: t('nav_register'), 
      icon: <RegisterIcon />, 
      href: `/${locale}/register` 
    },
  ];

  const menuItems = (status as any) === 'loading' ? [] : (session ? authenticatedMenuItems : guestMenuItems);

  // Show loading overlay during initial session resolution
  if ((status as any) === 'loading') {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="body1" color="text.secondary">
          {t('common_loading')}
        </Typography>
      </Box>
    );
  }

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          🎮 {t('common_appName')}
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton component={Link} href={item.href}>
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      {/* Theme Switcher */}
      <Box sx={{ p: 2, mt: 'auto' }}>
        <FormControlLabel
          control={
            <Switch
              checked={isDark}
              onChange={toggleTheme}
              icon={<LightMode />}
              checkedIcon={<DarkMode />}
            />
          }
          label={t('theme_switchTo', { mode: isDark ? t('theme_light') : t('theme_dark') })}
        />
      </Box>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, p: 2.2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {t('common_appName')}
          </Typography>
          
          {/* Language Switcher */}
          <Tooltip title={locale === 'en' ? 'Switch to Ukrainian' : 'Switch to English'}>
            <IconButton
              color="inherit"
              sx={{ mr: 2, p: 0 }}
              onClick={() => {
                // Replace locale in current path
                const currentPath = window.location.pathname;
                const newLocale = locale === 'en' ? 'uk' : 'en';
                // Replace only the first segment
                const segments = currentPath.split('/');
                if (segments.length > 1) {
                  segments[1] = newLocale;
                  const newPath = segments.join('/') || '/';
                  window.location.pathname = newPath;
                }
              }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'transparent', p: 0 }}>
                <img
                  src={locale === 'en' ? '/assets/english-banner.svg' : '/assets/ukrainian-banner.svg'}
                  alt={locale === 'en' ? 'English' : 'Ukrainian'}
                  style={{ width: '100%', height: '100%' }}
                />
              </Avatar>
            </IconButton>
          </Tooltip>

          {/* User Menu */}
          {(status as any) === 'loading' ? (
            // Show loading state
            <Box sx={{ display: 'flex', alignItems: 'center', width: 100, justifyContent: 'center' }}>
              <CircularProgress size={24} color="inherit" />
            </Box>
          ) : session ? (
            <div>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <Avatar sx={{ width: 32, height: 32 }}>
                  {session.user?.name?.charAt(0) || session.user?.email?.charAt(0)}
                </Avatar>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleClose}>
                  <AccountCircle sx={{ mr: 1 }} />
                  {session.user?.name || session.user?.email}
                </MenuItem>
              <MenuItem component={Link} href={`/${locale}/settings/change-password`} onClick={handleClose}>
                <SettingsIcon sx={{ mr: 1 }} />
                {t('nav_changePassword') || 'Change Password'}
              </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1 }} />
                  {t('nav_logout')}
                </MenuItem>
              </Menu>
            </div>
          ) : (
            <Box>
              <Button 
                color="inherit" 
                component={Link} 
                href={`/${locale}/login`}
                sx={{ mr: 1 }}
              >
                {t('nav_login')}
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                href={`/${locale}/register`}
                variant="outlined"
              >
                {t('nav_register')}
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              bgcolor: 'background.paper'
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        className="main-root-div"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          '@media (max-width:600px)': {
            pt: "10px !important",
          },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
