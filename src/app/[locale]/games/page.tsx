"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Paper,
} from "@mui/material";
import GamesFilterPanel from "@/components/GamesFilterPanel";
import { PhotoGalleryModal } from "@/components/PhotoGalleryModal";
import { RatingPopup } from "@/components/RatingPopup";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { useTranslations } from "@/hooks/useTranslations";
import { MainLayout } from "@/components/MainLayout";
import { GameDetailsModal } from "@/components/GameDetailsModal";
import AddToCollectionModal from "@/components/AddToCollectionModal";
import EnhancedSearchResultsModal from "@/components/EnhancedSearchResultsModal";
import { GamesTable } from "@/components/GamesTable";
import { GamesSearchControls } from "@/components/GamesSearchControls";
import { GamesCardList } from "@/components/GamesCardList";
import { defaultGameTableColumns, GameTableColumnSetting } from "@/components/gameTableColumns";


export default function GamesPage() {
  const [showMobileControls, setShowMobileControls] = useState(false);
  const [allPlatforms, setAllPlatforms] = useState<any[]>([]);
  const [allConsoleSystems, setAllConsoleSystems] = useState<any[]>([]);
  const [altNamesAnchorEl, setAltNamesAnchorEl] = useState<null | HTMLElement>(null);
  const [altNamesGameId, setAltNamesGameId] = useState<string | null>(null);
  const handleAltNamesClick = (event: React.MouseEvent<HTMLElement>, gameId: string) => {
    setAltNamesAnchorEl(event.currentTarget);
    setAltNamesGameId(gameId);
  };
  const handleAltNamesClose = () => {
    setAltNamesAnchorEl(null);
    setAltNamesGameId(null);
  };
  const { t, locale } = useTranslations();
  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [addToCollectionOpen, setAddToCollectionOpen] = useState(false);
  const [userGames, setUserGames] = useState<any[]>([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [editGame, setEditGame] = useState<any>(null);
  const [addToCollectionMode, setAddToCollectionMode] = useState<'create' | 'edit' | 'igdb'>('create');
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success'|'error'}>({open: false, message: '', severity: 'success'});
  const [deletingGameId, setDeletingGameId] = useState<string | null>(null);
  const [userConsoles, setUserConsoles] = useState<any[]>([]);
  const [selectedConsole, setSelectedConsole] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filters, setFilters] = useState<any>({
    name: "",
    platform: "",
    consoleId: "",
    completed: "",
    favorite: "",
    region: "",
    labelDamage: "",
    discoloration: "",
    rentalSticker: "",
    testedWorking: "",
    reproduction: "",
    completeness: "",
    steelbook: "",
  });
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchError, setSearchError] = useState<string>("");
  const [resultsDialogOpen, setResultsDialogOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [gameDetailsOpen, setGameDetailsOpen] = useState(false);
  const [gameToAdd, setGameToAdd] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [totalGames, setTotalGames] = useState(0);
  const [gameDetailsType, setGameDetailsType] = useState<'igdb' | 'local'>('igdb');
  const [gameLocations, setGameLocations] = useState<{id: string, name: string}[]>([]);
  const [tableColumns, setTableColumns] = useState<GameTableColumnSetting[]>(defaultGameTableColumns);


// Rating popup state (optimized: slider value in useRef)
const [ratingPopup, setRatingPopup] = useState<{ open: boolean, anchorEl: HTMLElement | null, game: any, value: number }>({ open: false, anchorEl: null, game: null, value: 50 });
const ratingSliderRef = React.useRef<number>(50);

const handleRatingClick = (event: React.MouseEvent<HTMLElement>, game: any) => {
  ratingSliderRef.current = game.rating ?? 50;
  setRatingPopup({ open: true, anchorEl: event.currentTarget, game, value: ratingSliderRef.current });
};

const handleRatingClose = () => {
  setRatingPopup({ open: false, anchorEl: null, game: null, value: 50 });
};

const handleRatingChange = (_: any, value: number | number[]) => {
  ratingSliderRef.current = typeof value === 'number' ? value : ratingSliderRef.current;
  // Only update displayed value, not state
  setRatingPopup(prev => ({ ...prev, value: ratingSliderRef.current }));
};

const handleRatingSubmit = async () => {
  const game = ratingPopup.game;
  if (!game?.id) return;
  try {
    const res = await fetch(`/api/user/games/${game.id}/edit`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: ratingSliderRef.current })
    });
    if (!res.ok) throw new Error('Failed to update rating');
    const { game: updatedGame } = await res.json();
    setSnackbar({ open: true, message: 'Rating updated', severity: 'success' });
    setUserGames(prev =>
      prev.map(g => g.id === updatedGame.id ? { ...g, rating: updatedGame.rating } : g)
    );
    handleRatingClose();
  } catch (e) {
    setSnackbar({ open: true, message: 'Failed to update rating', severity: 'error' });
  }
};

const handleToggleCompleted = async (game: any) => {
  if (!game?.id) return;
  try {
    const res = await fetch(`/api/user/games/${game.id}/completed`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !game.completed })
    });
    if (!res.ok) throw new Error('Failed to update completed');
    const { game: updatedGame } = await res.json();
    setSnackbar({ open: true, message: !game.completed ? 'Marked as completed' : 'Marked as not completed', severity: 'success' });
    setUserGames(prev =>
      prev.map(g => g.id === updatedGame.id ? { ...g, completed: updatedGame.completed } : g)
    );
  } catch (e) {
    setSnackbar({ open: true, message: 'Failed to update completed', severity: 'error' });
  }
};

const handleToggleFavorite = async (game: any) => {
  if (!game?.id) return;
  try {
    const res = await fetch(`/api/user/games/${game.id}/favorite`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ favorite: !game.favorite })
    });
    if (!res.ok) throw new Error('Failed to update favorite');
    const { game: updatedGame } = await res.json();
    setSnackbar({ open: true, message: !game.favorite ? 'Marked as favorite' : 'Removed from favorites', severity: 'success' });
    setUserGames(prev =>
      prev.map(g => g.id === updatedGame.id ? { ...g, favorite: updatedGame.favorite } : g)
    );
  } catch (e) {
    setSnackbar({ open: true, message: 'Failed to update favorite', severity: 'error' });
  }
};


// Save table columns to DB when changed
const handleTableColumnsChange = async (newColumns: GameTableColumnSetting[]) => {
  setTableColumns(newColumns);
  if (status === "authenticated" && session?.user?.id) {
    try {
      await fetch(`/api/user/table-settings?userId=${encodeURIComponent(session.user.id)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ settings: newColumns })
        }
      );
    } catch (e) {
      // Optionally handle error
    }
  }
};

  // Fetch user's games (with pagination/filtering)
  useEffect(() => {
    if (status === "authenticated") {
      fetchUserGames();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page, pageSize, sortBy, sortOrder, filters]);

  
  // Fetch all platforms once when authenticated
  useEffect(() => {
    if (status === "authenticated") {
      fetchAllPlatforms();
      fetchAllConsoleSystems();
      fetchGameLocations(); 
    }
  }, [status]);

    // On mount, fetch user's saved table columns from DB (if authenticated)
  useEffect(() => {
    async function fetchUserTableColumns() {
      if (status === "authenticated" && session?.user?.id) {
        try {
          const res = await fetch(`/api/user/table-settings?userId=${encodeURIComponent(session.user.id)}`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.settings) && data.settings.length > 0) {
              setTableColumns(data.settings);
            }
          }
        } catch (e) {
          // fallback to defaultTableColumns
        }
      }
    }
    fetchUserTableColumns();
  }, [status, session?.user?.id]);

  // Fetch game locations on load
  const fetchGameLocations = async () => {
    try {
      const res = await fetch('/api/user/game-locations?scope=me');
      if (!res.ok) throw new Error('Failed to fetch game locations');
      const data = await res.json();
      setGameLocations([
        { id: '', name: t('common_notSelected') },
        ...data.map((loc: any) => ({ id: loc.id, name: loc.name }))
      ]);
    } catch (e) {
      setGameLocations([{ id: '', name: t('common_notSelected') }]);
    }
  };

  const fetchAllPlatforms = async () => {
    try {
      let url = '/api/platforms';
      if (session?.user?.id) {
        url += `?userId=${encodeURIComponent(session.user.id)}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch platforms');
      const data = await response.json();
      setAllPlatforms(data.platforms || data || []);
    } catch (e) {
      setAllPlatforms([]);
    }
  };

  // Fetch all console systems
  const fetchAllConsoleSystems = async () => {
    try {
      const response = await fetch('/api/consoles');
      if (!response.ok) throw new Error('Failed to fetch console systems');
      const data = await response.json();
      setAllConsoleSystems(data.consoles || data || []);
    } catch (e) {
      setAllConsoleSystems([]);
    }
  };

  const fetchUserGames = async () => {
    try {
      setGamesLoading(true);
      // Build query params
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        sortBy,
        sortOrder,
      });
      // Add all filter fields from GamesFilterPanel
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "") params.append(key, String(value));
      });
      const response = await fetch(`/api/user/games?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch user games');
      const data = await response.json();
      setUserGames(data.games || []);
      setTotalGames(data.total || 0);
    } catch (e) {
      setUserGames([]);
      setTotalGames(0);
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

  // Edit game handler
  const handleEditGame = (game: any) => {
    setEditGame(game);
    setAddToCollectionMode('edit');
    setAddToCollectionOpen(true);
  };

  // Delete game handler
  const handleDeleteGame = async (game: any) => {
    if (!window.confirm(t('games_confirmDelete') || 'Delete this game?')) return;
    setDeletingGameId(game.id);
    try {
      const res = await fetch(`/api/user/games/${game.id}`, { method: 'DELETE' });
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
    setAddToCollectionMode('create');
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
        `/api/user/games/search?consoleId=${encodeURIComponent(selectedConsole)}&query=${encodeURIComponent(searchQuery.trim())}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Search failed');
      }
      
      const data = await response.json();
      let consoleObj = userConsoles.find(c => c.consoleId == selectedConsole) || null;
      
      setSearchResults({
        games: data.games || [],
        searchQuery,
        console: consoleObj?.console || null,
      });
      setResultsDialogOpen(true);
      
      // Console log the results as requested
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

  const handleViewGameDetails = (game: any, type: 'igdb' | 'local' = 'local') => {
    setSelectedGame(game);
    setGameDetailsType(type);
    setGameDetailsOpen(true);
  };

  const handleAddGameToCollection = (game: any) => {
    setGameToAdd(game);
    setAddToCollectionMode('igdb');
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
      <Box maxWidth="xl" sx={{ py: 1, minWidth: 320, maxWidth: "100%", overflowX: 'auto' }}>
        {/* Compact Header */}
        <Box sx={{ mb: 2 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 0.5, 
              fontWeight: "bold",
              gap: 1.5
            }}
            textAlign={isMobile ? "center" : "left"}
          >
            <SportsEsportsIcon sx={{ fontSize: "1.5rem", paddingRight:.5, minWidth: 40 }} />
            {t("games_title")}
          </Typography>
          <Typography variant="body2" color="text.secondary"  textAlign={isMobile ? "center" : "left"}>
            {t("games_subtitle")}
          </Typography>
        </Box>

        {/* Mobile/Desktop: Search & Add controls (reused) */}
        <GamesSearchControls
          isMobile={isMobile}
          showMobileControls={showMobileControls}
          setShowMobileControls={setShowMobileControls}
          userConsoles={userConsoles}
          selectedConsole={selectedConsole}
          setSelectedConsole={setSelectedConsole}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearchKeyDown={handleSearchKeyDown}
          loading={loading}
          searching={searching}
          searchError={searchError}
          handleSearch={handleSearch}
          handleAddGame={handleAddGame}
          t={t}
        />

        {/* User Games Table/Grid with Pagination, Sorting, Filtering */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            {/* Filtering and sorting controls */}
            <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* GamesFilterPanel now controls tableColumns, so we need to lift state */}
              <GamesFilterPanel
                filters={filters}
                setFilters={newFilters => {
                  setFilters(newFilters);
                  setPage(1);
                }}
                allPlatforms={allPlatforms}
                allConsoleSystems={allConsoleSystems}
                t={t}
                sortBy={sortBy}
                setSortBy={value => { setSortBy(value); setPage(1); }}
                sortOrder={sortOrder}
                setSortOrder={value => { setSortOrder(value); setPage(1); }}
                gameLocations={gameLocations}
                tableColumns={tableColumns}
                setTableColumns={handleTableColumnsChange}
              />
            </Box>
            {/* Table for desktop, cards for mobile */}
            {gamesLoading ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress />
              </Box>
            ) : userGames.length === 0 ? (
              <Typography color="text.secondary">{t("games_noGamesInCollection") || 'No games in your collection'}</Typography>
            ) : (
              isMobile ? (
              <GamesCardList
                userGames={userGames}
                allPlatforms={allPlatforms}
                allConsoleSystems={allConsoleSystems}
                theme={theme}
                altNamesGameId={altNamesGameId}
                altNamesAnchorEl={altNamesAnchorEl}
                handleAltNamesClick={handleAltNamesClick}
                handleAltNamesClose={handleAltNamesClose}
                getGameRating={getGameRating}
                deletingGameId={deletingGameId}
                handleEditGame={handleEditGame}
                handleDeleteGame={handleDeleteGame}
                openPhotoGallery={openPhotoGallery}
                onToggleFavorite={handleToggleFavorite}
                onToggleCompleted={handleToggleCompleted}
                onRatingClick={handleRatingClick}
                t={t}
                handleViewGameDetails={(game: any) => handleViewGameDetails(game, 'local')}
              />
              ) : (
                <Paper sx={{ width: '100%', overflowX: 'auto' }}>
                  <GamesTable
                    userGames={userGames}
                    allPlatforms={allPlatforms}
                    allConsoleSystems={allConsoleSystems}
                    theme={theme}
                    altNamesGameId={altNamesGameId}
                    altNamesAnchorEl={altNamesAnchorEl}
                    handleAltNamesClick={handleAltNamesClick}
                    handleAltNamesClose={handleAltNamesClose}
                    getGameRating={getGameRating}
                    deletingGameId={deletingGameId}
                    handleEditGame={handleEditGame}
                    handleDeleteGame={handleDeleteGame}
                    openPhotoGallery={openPhotoGallery}
                    onToggleFavorite={handleToggleFavorite}
                    onToggleCompleted={handleToggleCompleted}
                    onRatingClick={handleRatingClick}
                    handleViewGameDetails={(game: any) => handleViewGameDetails(game, 'local')}
                    columns={tableColumns}
                  />
                </Paper>
              )
            )}
            {/* Rating Popup (moved to separate component) */}
            <RatingPopup
              open={ratingPopup.open}
              anchorEl={ratingPopup.anchorEl}
              value={ratingPopup.value}
              onChange={(e, value) => handleRatingChange(null, value)}
              onClose={handleRatingClose}
              onSubmit={handleRatingSubmit}
            />
            {/* Pagination controls */}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
              <Button
                size="small"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                {t('common_previous') || 'Prev'}
              </Button>
              <Typography variant="body2">
                {t('common_page') || 'Page'} {page} / {Math.max(1, Math.ceil(totalGames / pageSize))}
              </Typography>
              <Button
                size="small"
                disabled={page >= Math.ceil(totalGames / pageSize)}
                onClick={() => setPage(page + 1)}
              >
                {t('common_next') || 'Next'}
              </Button>
              <FormControl size="small" sx={{ minWidth: 80 }}>
                <InputLabel>{t('common_pagesize') || 'Page Size'}</InputLabel>
                <Select
                  value={pageSize}
                  label={t('common_pagesize') || 'Page Size'}
                  onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                >
                  {[6, 12, 24, 48].map(size => (
                    <MenuItem key={size} value={size}>{size}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            {/* Total games count below pagination */}
            <Box sx={{ mt: 1, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                {t('games_totalGames') || 'Total'}: {totalGames}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Photo Gallery Modal (react-image-gallery) */}
        <PhotoGalleryModal
          open={galleryOpen}
          images={galleryImages}
          startIndex={galleryIndex}
          onClose={closeGallery}
          title={t('games_photos') || 'Photos'}
        />
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

        {/* Enhanced Search Results Modal */}
        <EnhancedSearchResultsModal
          open={resultsDialogOpen}
          onClose={() => setResultsDialogOpen(false)}
          searchResults={searchResults}
          isMobile={isMobile}
          theme={theme}
          getGameCoverUrl={getGameCoverUrl}
          getGameRating={getGameRating}
          formatReleaseDate={formatReleaseDate}
          formatCompanies={formatCompanies}
          handleViewGameDetails={(game: any) => handleViewGameDetails(game, 'igdb')}
          handleAddGameToCollection={handleAddGameToCollection}
        />

        {/* Game Details Modal Component */}
        <GameDetailsModal
          open={gameDetailsOpen}
          onClose={() => setGameDetailsOpen(false)}
          game={selectedGame}
          onAddToCollection={handleAddGameToCollection}
          gameType={gameDetailsType}
          setGalleryImages={setGalleryImages}
          setGalleryOpen={setGalleryOpen}
          onToggleCompleted={handleToggleCompleted}
          onToggleFavorite={handleToggleFavorite}
        />

        {/* Add to Collection Modal */}
        <AddToCollectionModal
          open={addToCollectionOpen}
          onClose={() => {
            setAddToCollectionOpen(false);
            setGameToAdd(null);
            setEditGame(null);
            setAddToCollectionMode('create');
          }}
          game={editGame || gameToAdd || null}
          selectedConsole={
            selectedConsole !== ""
              ? userConsoles.find(uc => String(uc.console.id) === selectedConsole)
              : null
          }
          userConsoles={userConsoles}
          onSuccess={handleAddToCollectionSuccess}
          mode={addToCollectionMode}
          locationOptions={gameLocations}
        />
      </Box>
    </MainLayout>
  );
}
