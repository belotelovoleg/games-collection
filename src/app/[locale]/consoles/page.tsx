"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { MainLayout } from "@/components/MainLayout";
import { Box, Container, Typography, Grid, Button, Chip, CircularProgress, TextField, IconButton } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import SearchIcon from "@mui/icons-material/Search";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ConsolesPage({ params }: { params: { locale: string } }) {
  const { t, locale } = useTranslations();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [consoles, setConsoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/${locale}/login`);
    }
  }, [status, locale, router]);

  useEffect(() => {
    if (status === "authenticated") {
      setLoading(true);
      fetch(`/api/consoles?search=${encodeURIComponent(search)}`)
        .then((res) => res.json())
        .then((data) => setConsoles(data))
        .finally(() => setLoading(false));
    }
  }, [search, status]);

  const handleAdd = async (consoleId: number, status: "OWNED" | "WISHLIST") => {
    setActionLoading(`${consoleId}-${status}`);
    try {
      const response = await fetch("/api/user/consoles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consoleId, status }),
      });
      
      if (!response.ok) {
        console.error('Failed to add console:', await response.text());
        return;
      }
      
      const result = await response.json();
      console.log('Console added successfully:', result);
      
      // Refresh list
      setLoading(true);
      const consolesResponse = await fetch(`/api/consoles?search=${encodeURIComponent(search)}`);
      if (consolesResponse.ok) {
        const data = await consolesResponse.json();
        setConsoles(data);
      }
    } catch (error) {
      console.error('Error adding console:', error);
    } finally {
      setActionLoading(null);
      setLoading(false);
    }
  };

  const handleRemove = async (consoleId: number) => {
    setActionLoading(`${consoleId}-REMOVE`);
    try {
      const response = await fetch(`/api/user/consoles?consoleId=${consoleId}`, { 
        method: "DELETE" 
      });
      
      if (!response.ok) {
        console.error('Failed to remove console:', await response.text());
        return;
      }
      
      console.log('Console removed successfully');
      
      // Refresh list
      setLoading(true);
      const consolesResponse = await fetch(`/api/consoles?search=${encodeURIComponent(search)}`);
      if (consolesResponse.ok) {
        const data = await consolesResponse.json();
        setConsoles(data);
      }
    } catch (error) {
      console.error('Error removing console:', error);
    } finally {
      setActionLoading(null);
      setLoading(false);
    }
  };

  return (
    <MainLayout locale={locale}>
      <Container maxWidth="lg" sx={{ py: 1 }}>
        {/* Compact Header */}
        <Box sx={{ mb: 2 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 0.5, 
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: 1.5
            }}
          >
            <CheckCircleIcon sx={{ fontSize: "1.5rem" }} />
            {t("consoles_title")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("consoles_subtitle")}
          </Typography>
        </Box>

        {/* Compact Search */}
        <Box sx={{ display: "flex", mb: 2, gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t("consoles_searchPlaceholder")}
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") setSearch(searchInput); }}
            InputProps={{
              endAdornment: (
                <IconButton size="small" onClick={() => setSearch(searchInput)}>
                  <SearchIcon />
                </IconButton>
              )
            }}
          />
        </Box>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {consoles.length === 0 && (
              <Grid size={12}>
                <Box sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
                  <CheckCircleIcon sx={{ fontSize: "3rem", mb: 1, opacity: 0.3 }} />
                  <Typography variant="h6" sx={{ mb: 0.5 }}>
                    {t("consoles_noConsoles")}
                  </Typography>
                </Box>
              </Grid>
            )}
            {consoles.map((gameConsole) => {
              const userStatus = gameConsole.userStatus?.status;
              return (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={gameConsole.id}>
                  <Box sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 1.5,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    height: '100%',
                    minHeight: 240,
                    boxShadow: 1,
                    bgcolor: 'background.paper',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-2px)'
                    }
                  }}>
                    {gameConsole.photo && (
                      <Box sx={{ 
                        width: 60, 
                        height: 60, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        mb: 1.5 
                      }}>
                        <img 
                          src={gameConsole.photo} 
                          alt={gameConsole.name} 
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '100%', 
                            objectFit: "contain" 
                          }} 
                        />
                      </Box>
                    )}
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: "bold", 
                        mb: 0.5, 
                        textAlign: "center",
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        lineHeight: 1.2
                      }}
                    >
                      {gameConsole.name}
                    </Typography>
                    {gameConsole.abbreviation && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ mb: 1.5, textAlign: "center" }}
                      >
                        {gameConsole.abbreviation}
                      </Typography>
                    )}
                    
                    {/* Status chip */}
                    <Box sx={{ mb: 1.5, minHeight: 24, display: 'flex', alignItems: 'center' }}>
                      {userStatus === "OWNED" && (
                        <Chip 
                          color="success" 
                          icon={<CheckCircleIcon />} 
                          label={t("consoles_owned")}
                          size="small"
                        />
                      )} 
                      {userStatus === "WISHLIST" && (
                        <Chip 
                          color="primary" 
                          icon={<FavoriteIcon />} 
                          label={t("consoles_wishlist")}
                          size="small"
                        />
                      )} 
                    </Box>
                    
                    {/* Action buttons - always at bottom */}
                    <Box sx={{ 
                      display: "flex", 
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: 0.5, 
                      mt: "auto",
                      width: '100%',
                      px: 0.5
                    }}>
                      {userStatus ? (
                        <Button
                          fullWidth
                          size="small"
                          color="error"
                          variant="outlined"
                          disabled={actionLoading === `${gameConsole.id}-REMOVE`}
                          onClick={() => handleRemove(gameConsole.id)}
                          sx={{ 
                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                            minHeight: 32,
                            py: 0.5
                          }}
                        >
                          {t("consoles_removeFromCollection")}
                        </Button>
                      ) : (
                        <>
                          <Button
                            fullWidth
                            size="small"
                            color="success"
                            variant="contained"
                            startIcon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
                            disabled={actionLoading === `${gameConsole.id}-OWNED`}
                            onClick={() => handleAdd(gameConsole.id, "OWNED")}
                            sx={{ 
                              fontSize: { xs: '0.65rem', sm: '0.7rem' },
                              minHeight: 32,
                              py: 0.5
                            }}
                          >
                            {t("consoles_addToOwned")}
                          </Button>
                          <Button
                            fullWidth
                            size="small"
                            color="primary"
                            variant="outlined"
                            startIcon={<FavoriteIcon sx={{ fontSize: '14px !important' }} />}
                            disabled={actionLoading === `${gameConsole.id}-WISHLIST`}
                            onClick={() => handleAdd(gameConsole.id, "WISHLIST")}
                            sx={{ 
                              fontSize: { xs: '0.65rem', sm: '0.7rem' },
                              minHeight: 32,
                              py: 0.5
                            }}
                          >
                            {t("consoles_addToWishlist")}
                          </Button>
                        </>
                      )}
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </MainLayout>
  );
}
