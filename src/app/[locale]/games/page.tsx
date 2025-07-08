"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { MainLayout } from "@/components/MainLayout";
import { GameDetailsModal } from "@/components/GameDetailsModal";
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
  Grid,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Rating,
  IconButton,
  Badge,
  Skeleton,
  Paper
} from "@mui/material";
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

export default function GamesPage({ params }: { params: { locale: string } }) {
  const { t, locale } = useTranslations();
  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State management
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

  // Handle add game manually
  const handleAddGame = () => {
    // TODO: Implement manual game addition (open modal/navigate to form)
    console.log('Add game manually');
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
    // TODO: Implement add to collection
    console.log("Add game to collection:", game);
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
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center' }}>
              {/* Console Selection */}
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 30%' } }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="console-select-label">
                    {t("games_selectConsole")}
                  </InputLabel>
                  <Select
                    labelId="console-select-label"
                    value={selectedConsole}
                    label={t("games_selectConsole")}
                    onChange={(e) => setSelectedConsole(e.target.value)}
                    disabled={loading}
                  >
                    {userConsoles.map((userConsole) => (
                      <MenuItem key={userConsole.id} value={userConsole.console.id}>
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
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 40%' } }}>
                <TextField
                  fullWidth
                  size="small"
                  label={t("games_searchGames")}
                  placeholder={t("games_searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  disabled={loading || !selectedConsole}
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

        {/* Games Results Area */}
        <Card>
          <CardContent sx={{ py: 2 }}>
            {searchError && (
              <Box sx={{ mb: 2 }}>
                <Typography color="error" variant="body2">
                  ❌ {searchError}
                </Typography>
              </Box>
            )}
            
            <Box 
              sx={{ 
                py: 4, 
                textAlign: "center",
                color: "text.secondary"
              }}
            >
              <SportsEsportsIcon sx={{ fontSize: "3rem", mb: 1, opacity: 0.3 }} />
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                {t("games_noResults")}
              </Typography>
              <Typography variant="body2">
                {t("games_searchInstructions")}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Enhanced Search Results Modal */}
        <Dialog 
          open={resultsDialogOpen} 
          onClose={() => setResultsDialogOpen(false)}
          maxWidth="lg"
          fullWidth
          fullScreen={isMobile}
          PaperProps={{
            sx: {
              minHeight: { xs: '100%', sm: '70vh' },
              maxHeight: { xs: '100%', sm: '90vh' },
              backgroundColor: theme.palette.background.default
            }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            pb: 1,
            borderBottom: 1,
            borderColor: 'divider'
          }}>
            <Box>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SportsEsportsIcon color="primary" />
                {t("games_searchResults")}
              </Typography>
              {searchResults && (
                <Typography variant="body2" color="text.secondary">
                  {searchResults.games.length} {t("games_foundFor")} "{searchResults.searchQuery}" 
                  {" "}{t("games_on")} {searchResults.console.name}
                </Typography>
              )}
            </Box>
            <IconButton onClick={() => setResultsDialogOpen(false)} size="large">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
            {searchResults && searchResults.games.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {searchResults.games.map((game: any, index: number) => (
                  <Paper 
                    key={game.id}
                    elevation={2}
                    sx={{ 
                      p: 2,
                      borderRadius: 2,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        elevation: 4,
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                      {/* Game Cover */}
                      <Box sx={{ flexShrink: 0 }}>
                        <Avatar
                          src={getGameCoverUrl(game.cover) || undefined}
                          variant="rounded"
                          sx={{ 
                            width: { xs: 80, sm: 100 }, 
                            height: { xs: 100, sm: 130 },
                            bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200'
                          }}
                        >
                          <SportsEsportsIcon sx={{ fontSize: { xs: '2rem', sm: '2.5rem' } }} />
                        </Avatar>
                      </Box>
                      
                      {/* Game Information */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        {/* Title and Rating */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                          <Typography variant="h6" fontWeight="bold" sx={{ mr: 1 }}>
                            {game.name}
                          </Typography>
                          {getGameRating(game) > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Rating 
                                value={getGameRating(game)} 
                                precision={0.1} 
                                size="small" 
                                readOnly 
                              />
                              <Typography variant="caption" color="text.secondary">
                                ({getGameRating(game).toFixed(1)})
                              </Typography>
                            </Box>
                          )}
                        </Box>
                        
                        {/* Summary */}
                        {game.summary && (
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              mb: 2,
                              display: '-webkit-box',
                              WebkitLineClamp: { xs: 2, sm: 3 },
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {game.summary}
                          </Typography>
                        )}
                        
                        {/* Metadata Chips */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                          {game.genres?.slice(0, 3).map((genre: any) => (
                            <Chip 
                              key={genre.id} 
                              label={genre.name} 
                              size="small" 
                              variant="outlined"
                              color="primary"
                            />
                          ))}
                          {game.first_release_date && (
                            <Chip 
                              icon={<CalendarTodayIcon />}
                              label={formatReleaseDate(game.first_release_date)} 
                              size="small" 
                              variant="outlined"
                              color="secondary"
                            />
                          )}
                          {game.involved_companies && game.involved_companies.length > 0 && (
                            <Chip 
                              icon={<BusinessIcon />}
                              label={formatCompanies(game.involved_companies)} 
                              size="small" 
                              variant="outlined"
                              color="default"
                            />
                          )}
                        </Box>

                        {/* Action Buttons */}
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleViewGameDetails(game)}
                            sx={{ flexShrink: 0 }}
                          >
                            {t("games_viewDetails")}
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<AddCircleIcon />}
                            onClick={() => handleAddGameToCollection(game)}
                            sx={{ flexShrink: 0 }}
                          >
                            {t("games_addToCollection")}
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Box>
            ) : searchResults ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <SportsEsportsIcon sx={{ fontSize: '4rem', color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {t("games_noGamesFound")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("games_tryDifferentSearch")}
                </Typography>
              </Box>
            ) : null}
          </DialogContent>
        </Dialog>

        {/* Game Details Modal Component */}
        <GameDetailsModal
          open={gameDetailsOpen}
          onClose={() => setGameDetailsOpen(false)}
          game={selectedGame}
          onAddToCollection={handleAddGameToCollection}
        />
      </Container>
    </MainLayout>
  );
}
