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
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  VideogameAsset as GamesIcon,
  Settings as SettingsIcon,
  LightMode,
  DarkMode,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  Logout as LogoutIcon,
  AccountCircle,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useCustomTheme } from './ThemeProvider';
import { useTranslations } from '@/hooks/useTranslations';

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
      text: t('nav_settings'), 
      icon: <SettingsIcon />, 
      href: `/${locale}/settings` 
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

  const menuItems = session ? authenticatedMenuItems : guestMenuItems;

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
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {t('common_appName')}
          </Typography>
          
          {/* Language Switcher */}
          <IconButton
            color="inherit"
            component={Link}
            href={locale === 'en' ? '/uk' : '/en'}
            sx={{ mr: 2 }}
          >
            {locale === 'en' ? 'УК' : 'EN'}
          </IconButton>

          {/* User Menu */}
          {session ? (
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
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
