"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid as MuiGrid,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  Avatar,
  Rating,
  IconButton,
  Paper,
} from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import SearchIcon from "@mui/icons-material/Search";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import AddIcon from "@mui/icons-material/Add";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import BusinessIcon from "@mui/icons-material/Business";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { useTranslations } from "@/hooks/useTranslations";

import { MainLayout } from "@/components/MainLayout";
import { GameDetailsModal } from "@/components/GameDetailsModal";
import AddToCollectionModal from "@/components/AddToCollectionModal";
import EnhancedSearchResultsModal from "@/components/EnhancedSearchResultsModal";


export default function GamesPage() {
  const { t, locale } = useTranslations();
  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State for addToCollectionOpen must be above its first use
  const [addToCollectionOpen, setAddToCollectionOpen] = useState(false);
  // User games state (now inside component)
  const [userGames, setUserGames] = useState<any[]>([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [editGame, setEditGame] = useState<any>(null);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success'|'error'}>({open: false, message: '', severity: 'success'});
  const [deletingGameId, setDeletingGameId] = useState<string | null>(null);
  // State management for consoles and search
  const [userConsoles, setUserConsoles] = useState<any[]>([]);
  const [selectedConsole, setSelectedConsole] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchError, setSearchError] = useState<string>("");
  const [resultsDialogOpen, setResultsDialogOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [gameDetailsOpen, setGameDetailsOpen] = useState(false);
  const [gameToAdd, setGameToAdd] = useState<any>(null);

  // Fetch user's games (only on mount and auth change)
  useEffect(() => {
    if (status === "authenticated") {
      fetchUserGames();
    }
  }, [status]);

  const fetchUserGames = async () => {
    try {
      setGamesLoading(true);
      const response = await fetch('/api/user/games');
      if (!response.ok) throw new Error('Failed to fetch user games');
      const data = await response.json();
      setUserGames(data.games || data); // support both {games:[]} and []
    } catch (e) {
      setUserGames([]);
    } finally {
      setGamesLoading(false);
    }
  };

  // Gallery handlers
  const openPhotoGallery = (photos: string[], idx = 0) => {
    setGalleryImages(photos);
    setGalleryIndex(idx);
    setGalleryOpen(true);
  };
  const closeGallery = () => setGalleryOpen(false);
  const nextGalleryImage = () => setGalleryIndex((i) => (i + 1) % galleryImages.length);
  const prevGalleryImage = () => setGalleryIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length);


  // Edit game handler
  const handleEditGame = (game: any) => {
    setEditGame(game);
    setAddToCollectionOpen(true);
  };

  // Delete game handler
  const handleDeleteGame = async (game: any) => {
    if (!window.confirm(t('games_confirmDelete') || 'Delete this game?')) return;
    setDeletingGameId(game.id);
    try {
      const res = await fetch(`/api/games/${game.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setSnackbar({open: true, message: t('games_deleted') || 'Game deleted', severity: 'success'});
      fetchUserGames();
    } catch (e) {
      setSnackbar({open: true, message: t('games_deleteError') || 'Failed to delete game', severity: 'error'});
    } finally {
      setDeletingGameId(null);
    }
  };



  // Authentication check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/${locale}/login`);
    }
  }, [status, locale, router]);

  // Fetch user's consoles
  useEffect(() => {
    if (status === "authenticated") {
      fetchUserConsoles();
    }
  }, [status]);

  const fetchUserConsoles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/consoles');
      
      if (!response.ok) {
        throw new Error('Failed to fetch user consoles');
      }
      
      const data = await response.json();
      setUserConsoles(data);
    } catch (error) {
      console.error('Error fetching user consoles:', error);
      setUserConsoles([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle add game manually (open AddToCollectionModal with blank data)
  const handleAddGame = () => {
    setEditGame(null);
    setGameToAdd(null);
    setAddToCollectionOpen(true);
    // Debug: log to verify click
    console.log('Add New Game button clicked, opening modal');
  };

  // Handle search
  const handleSearch = async () => {
    if (!selectedConsole || !searchQuery.trim()) {
      return;
    }
    
    setSearching(true);
    setSearchError("");
    setSearchResults(null);
    
    try {
      const response = await fetch(
        `/api/games/search?consoleId=${encodeURIComponent(selectedConsole)}&query=${encodeURIComponent(searchQuery.trim())}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Search failed');
      }
      
      const data = await response.json();
      setSearchResults(data);
      setResultsDialogOpen(true);
      
      // Console log the results as requested
      console.log(`🎮 Games search results for "${searchQuery}" on ${data.console.name}:`);
      console.log('Full response:', data);
      console.log('Games found:', data.games);
      
    } catch (error) {
      console.error('Search error:', error);
      setSearchError(error instanceof Error ? error.message : 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  // Handle Enter key in search field
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Helper functions for displaying game data
  const formatReleaseDate = (timestamp: number) => {
    if (!timestamp) return "Unknown";
    return new Date(timestamp * 1000).getFullYear().toString();
  };

  const getGameCoverUrl = (cover: any, size = 'cover_big') => {
    if (!cover?.image_id) return null;
    return `https://images.igdb.com/igdb/image/upload/t_${size}/${cover.image_id}.jpg`;
  };

  const getGameRating = (game: any) => {
    if (game.total_rating) return game.total_rating / 20; // Convert to 5-star scale
    if (game.rating) return game.rating / 20;
    if (game.aggregated_rating) return game.aggregated_rating / 20;
    return 0;
  };

  const formatCompanies = (companies: any[]) => {
    if (!companies || companies.length === 0) return "Unknown";
    return companies
      .filter(c => c.company?.name)
      .slice(0, 3) // Limit to 3 companies
      .map(c => c.company.name)
      .join(", ");
  };

  const handleViewGameDetails = (game: any) => {
    setSelectedGame(game);
    setGameDetailsOpen(true);
  };

  const handleAddGameToCollection = (game: any) => {
    setGameToAdd(game);
    setAddToCollectionOpen(true);
    setGameDetailsOpen(false); // Close the details modal
  };

  const handleAddToCollectionSuccess = (addedGame: any) => {
    setAddToCollectionOpen(false);
    setGameToAdd(null);
    setEditGame(null);
    setSnackbar({open: true, message: t('games_addEditSuccess') || 'Game saved', severity: 'success'});
    fetchUserGames();
  };

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <MainLayout locale={locale}>
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  // If not authenticated, don't render content (will redirect)
  if (status === "unauthenticated") {
    return null;
  }

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
            <SportsEsportsIcon sx={{ fontSize: "1.5rem" }} />
            {t("games_title")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("games_subtitle")}
          </Typography>
        </Box>

        {/* Compact Search Controls */}
        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            {/* Show search error if present */}
            {searchError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {searchError}
              </Alert>
            )}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center' }}>
              {/* Console Selection */}
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 30%' }, minWidth: { xs: 200, sm: 180 }, maxWidth: { xs: '100%', sm: 300 } }}>
                <FormControl fullWidth size="small" sx={{ minWidth: { xs: 200, sm: 180 } }}>
                  <InputLabel id="console-select-label">
                    {t("games_selectConsole")}
                  </InputLabel>
                  <Select
                    labelId="console-select-label"
                    value={selectedConsole}
                    label={t("games_selectConsole")}
                    onChange={(e) => setSelectedConsole(e.target.value)}
                    disabled={loading}
                    sx={{ minWidth: { xs: 120, sm: 180 }, width: '100%' }}
                  >
                    {userConsoles.map((userConsole) => (
                      <MenuItem key={userConsole.id} value={String(userConsole.console.id)}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                          <span>{userConsole.console.name}</span>
                          <Chip 
                            size="small" 
                            label={userConsole.status === "OWNED" ? t("consoles_owned") : t("consoles_wishlist")}
                            color={userConsole.status === "OWNED" ? "success" : "primary"}
                            sx={{ ml: "auto" }}
                          />
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Game Search */}
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 40%' }, minWidth: { xs: 200, sm: 240 }, maxWidth: { xs: '100%', sm: 400 } }}>
                <TextField
                  fullWidth
                  size="small"
                  label={t("games_searchGames")}
                  placeholder={t("games_searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  disabled={loading || !selectedConsole}
                  sx={{ minWidth: { xs: 200, sm: 240 } }}
                />
              </Box>

              {/* Action Buttons */}
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 30%' }, display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={searching ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
                  onClick={handleSearch}
                  disabled={loading || searching || !selectedConsole || !searchQuery.trim()}
                  sx={{ flex: 1 }}
                >
                  {searching ? t("common_searching") : t("common_search")}
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddGame}
                  disabled={loading}
                  sx={{ flex: 1 }}
                >
                  {t("games_addNew")}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* User Games Table/Grid */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {t("games_yourCollection") || 'Your Collection'}
            </Typography>
            {gamesLoading ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress />
              </Box>
            ) : userGames.length === 0 ? (
              <Typography color="text.secondary">{t("games_noGamesInCollection") || 'No games in your collection'}</Typography>
            ) : (
              <MuiGrid container spacing={2}>
                {userGames.map((game) => {
                  // Platform display: support array of objects or strings
                  let platformStr = '';
                  if (Array.isArray(game.platforms)) {
                    if (typeof game.platforms[0] === 'object') {
                      platformStr = game.platforms.map((p: any) => p.name).join(', ');
                    } else {
                      platformStr = game.platforms.join(', ');
                    }
                  }
                  return (
                    <MuiGrid key={game.id} xs={12} md={6} lg={4} item={true as any}>
                      <Card variant="outlined" sx={{ p: 2, display: 'flex', gap: 2 }}>
                        <Box sx={{ cursor: game.photos?.length ? 'pointer' : 'default', minWidth: 80 }} onClick={() => game.photos?.length && openPhotoGallery(game.photos, 0)}>
                          <Avatar
                            src={
                              game.cover
                                ? game.cover
                                : game.photos?.[0]
                                  ? game.photos[0]
                                  : game.screenshot
                                    ? game.screenshot
                                    : undefined
                            }
                            variant="rounded"
                            sx={{ width: 80, height: 80, bgcolor: 'grey.200' }}
                          >
                            {!(game.cover || game.photos?.[0] || game.screenshot) && <SportsEsportsIcon />}
                          </Avatar>
                          {game.photos?.length > 1 && (
                            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', width: '100%' }}>
                              +{game.photos.length - 1} more
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">{game.title || game.name}</Typography>
                          <Typography variant="body2" color="text.secondary">{platformStr}</Typography>
                          {game.condition && <Typography variant="body2" color="text.secondary">{t('games_condition') || 'Condition'}: {game.condition}</Typography>}
                          {game.notes && <Typography variant="body2" color="text.secondary">{t('games_notes') || 'Notes'}: {game.notes}</Typography>}
                          {/* Show rating as stars if available */}
                          {getGameRating(game) > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                              <Rating value={getGameRating(game)} precision={0.1} size="small" readOnly />
                              <Typography variant="caption" color="text.secondary">
                                ({getGameRating(game).toFixed(1)})
                              </Typography>
                            </Box>
                          )}
                          {/* Favorite and Completed status as icons */}
                          <Box sx={{ display: 'flex', gap: 1, mb: 0.5, alignItems: 'center' }}>
                            {game.favorite && (
                              <span title={t('games_favorite') || 'Favorite'} style={{ color: '#E91E63', fontSize: 22, lineHeight: 1 }}>
                                ❤
                              </span>
                            )}
                            {game.completed && (
                              <span title={t('games_completed') || 'Completed'} style={{ color: '#43A047', fontSize: 22, lineHeight: 1 }}>
                                ✓
                              </span>
                            )}
                          </Box>
                          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                            <Button size="small" onClick={() => handleEditGame(game)}>{t("common_edit")}</Button>
                            <Button size="small" color="error" onClick={() => handleDeleteGame(game)} disabled={deletingGameId === game.id}>
                              {deletingGameId === game.id ? <CircularProgress size={16} color="inherit" /> : t("common_delete")}
                            </Button>
                          </Box>
                        </Box>
                      </Card>
                    </MuiGrid>
                  );
                })}
              </MuiGrid>
            )}
          </CardContent>
        </Card>

        {/* Photo Gallery Modal */}
        <Dialog open={galleryOpen} onClose={closeGallery} maxWidth="md" fullWidth>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {t('games_photos') || 'Photos'}
            <Box>
              <IconButton onClick={closeGallery}><CloseIcon /></IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
            {galleryImages.length > 0 ? (
              <>
                <Box sx={{ mb: 2, position: 'relative' }}>
                  <img
                    src={galleryImages[galleryIndex]}
                    alt={`Game photo ${galleryIndex + 1}`}
                    style={{ maxWidth: 400, maxHeight: 400, borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
                  />
                  {galleryImages.length > 1 && (
                    <>
                      <IconButton onClick={prevGalleryImage} sx={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)' }}>
                        {'<'}
                      </IconButton>
                      <IconButton onClick={nextGalleryImage} sx={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}>
                        {'>'}
                      </IconButton>
                    </>
                  )}
                </Box>
                <Typography variant="caption">{galleryIndex + 1} / {galleryImages.length}</Typography>
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <SportsEsportsIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="body2" color="text.secondary">{t('games_noPhotos') || 'No photos'}</Typography>
              </Box>
            )}
          </DialogContent>
        </Dialog>
        {/* Snackbar for feedback */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3500}
          onClose={() => setSnackbar({...snackbar, open: false})}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSnackbar({...snackbar, open: false})} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Enhanced Search Results Modal (extracted) */}
        <EnhancedSearchResultsModal
          open={resultsDialogOpen}
          onClose={() => setResultsDialogOpen(false)}
          searchResults={searchResults}
          isMobile={isMobile}
          theme={theme}
          t={t}
          getGameCoverUrl={getGameCoverUrl}
          getGameRating={getGameRating}
          formatReleaseDate={formatReleaseDate}
          formatCompanies={formatCompanies}
          handleViewGameDetails={handleViewGameDetails}
          handleAddGameToCollection={handleAddGameToCollection}
        />

        {/* Game Details Modal Component */}
        <GameDetailsModal
          open={gameDetailsOpen}
          onClose={() => setGameDetailsOpen(false)}
          game={selectedGame}
          onAddToCollection={handleAddGameToCollection}
        />

        {/* Add to Collection Modal */}
        <AddToCollectionModal
          open={addToCollectionOpen}
          onClose={() => {
            setAddToCollectionOpen(false);
            setGameToAdd(null);
            setEditGame(null);
            // Always refresh games list on close
            fetchUserGames();
          }}
          game={editGame || gameToAdd || null}
          selectedConsole={
            selectedConsole !== ""
              ? userConsoles.find(uc => String(uc.console.id) === selectedConsole)
              : null
          }
          userConsoles={userConsoles}
          onSuccess={handleAddToCollectionSuccess}
        />
      </Container>
    </MainLayout>
  );
}
