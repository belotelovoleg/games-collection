"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
  Rating,
  Chip,
  Avatar,
  Button,
  Card,
  Tabs,
  Tab,
  Badge,
  CircularProgress,
  Backdrop,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from "@mui/material";
import { GameMediaGallery } from "./GameMediaGallery";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import InfoIcon from "@mui/icons-material/Info";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import ImageIcon from "@mui/icons-material/Image";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';

interface GameDetailsModalProps {
  open: boolean;
  onClose: () => void;
  game: any;
  gameType: "igdb" | "local";
  setGalleryImages: (images: any[]) => void;
  setGalleryOpen: (open: boolean) => void;
  onAddToCollection: (game: any) => void;
  onToggleCompleted?: (game: any) => void;
  onToggleFavorite?: (game: any) => void;
}

export function GameDetailsModal({ open, 
  onClose, 
  game, 
  gameType, 
  onAddToCollection, 
  setGalleryImages, 
  setGalleryOpen, 
  onToggleCompleted, 
  onToggleFavorite 
}: GameDetailsModalProps) {

  const { t } = useTranslations();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Modal states
  const [detailsTabValue, setDetailsTabValue] = useState(0);
  const [fetchedIgdbGame, setFetchedIgdbGame] = useState(null);
  const [loadingIgdb, setLoadingIgdb] = useState(false);

  // When you need to fetch IGDB data:
  useEffect(() => {
    if (gameType === "local" && game && !game.igdbGame && (game.igdbId || game.igdbGameId)) {
      setLoadingIgdb(true);
      fetch(`/api/igdb/game/${game.igdbId || game.igdbGameId}`)
        .then(res => res.json())
        .then(data => setFetchedIgdbGame(data))
        .finally(() => setLoadingIgdb(false));
    } else {
      setLoadingIgdb(false);
    }
  }, [game, gameType]);

  // Helper functions
  const formatReleaseDate = (timestamp: number) => {
    if (!timestamp) return "Unknown";
    return new Date(timestamp * 1000).getFullYear().toString();
  };

  const getGameCoverUrl = (cover: any, size = 't_cover_big') => {
    if (typeof cover === 'object' && cover !== null) {
      if (cover.imageId) {cover.image_id = cover.imageId;}
      return `https://images.igdb.com/igdb/image/upload/${size}/${cover.image_id}.jpg`;
    } else return cover;
  };

  const getScreenshotUrl = (screenshot: any, size = 't_720p') => {
    if (typeof screenshot === 'object' && screenshot !== null) {
      if (screenshot.imageId) {screenshot.image_id = screenshot.imageId;}
      return `https://images.igdb.com/igdb/image/upload/${size}/${screenshot.image_id}.jpg`;
    } else return screenshot;
  };

  const getArtworkUrl = (artwork: any, size = 't_720p') => {
    if (typeof artwork === 'object' && artwork !== null) {
      if (artwork.imageId) {artwork.image_id = artwork.imageId;}
      return `https://images.igdb.com/igdb/image/upload/${size}/${artwork.image_id}.jpg`;
    } else return artwork;
  };

  const getGameRating = (game: any) => {
    if (!game) return 0;
    if (game.total_rating) return game.total_rating / 20; // Convert to 5-star scale
    if (game.rating) return game.rating / 20;
    if (game.aggregated_rating) return game.aggregated_rating / 20;
    return 0;
  };

  const formatCompaniesInvolved = (companies: any[]) => {
    if (!companies || companies.length === 0) return "Unknown";
    return companies
      .filter(c => c.company?.name)
      .slice(0, 3) // Limit to 3 companies
      .map(c => c.company.name)
      .join(", ");
  };

  const openImageGallery = (images: any[]) => {
    const mappedGalleryImages = images.map(img =>
    typeof img === 'string' && img.includes('//')
      ? img
      : img?.image_id
        ? `https://images.igdb.com/igdb/image/upload/t_720p/${img.image_id}.jpg`
        : undefined
  );
    setGalleryImages(mappedGalleryImages);
    setGalleryOpen(true);
  };


  const handleClose = () => {
    setDetailsTabValue(0); // Reset tab when closing
    onClose();
  };

  // Merge local game with igdbGame if gameType is "local"
  const [mergedGame, setMergedGame] = useState<any>(game);
  useEffect(() => {
    if (gameType === "local" && game) {
      const igdbGame = game.igdbGame || fetchedIgdbGame || {};
      const newMerged = {
        // Prefer local game fields, fallback to igdbGame fields
        name: game.name || igdbGame.name,
        summary: game.summary || igdbGame.summary,
        storyline: igdbGame.storyline, // Only in IGDB
        cover: game.cover ? { image_id: game.cover } : igdbGame.cover,
        screenshots: (igdbGame.gameScreenshotRelations && igdbGame.gameScreenshotRelations.length > 0) ? igdbGame.gameScreenshotRelations.map((shot: any) => shot.screenshot) : [],
        artworks: (igdbGame.gameArtworkRelations && igdbGame.gameArtworkRelations.length > 0) ? igdbGame.gameArtworkRelations.map((shot: any) => shot.artwork) : [],
        genres: (game.genres && game.genres.length > 0) ? game.genres.map((name: string, i: number) => ({ id: i, name })) : igdbGame.genres,
        involved_companies: igdbGame.involved_companies,
        platforms: igdbGame.platforms,
        total_rating: igdbGame.total_rating,
        rating: game.rating || igdbGame.rating,
        aggregated_rating: igdbGame.aggregated_rating,
        first_release_date: igdbGame.first_release_date,
        // Add all other fields from local game
        ...igdbGame,
        ...game,
      };
      // Ensure mergedGame.name is always present
      if (!newMerged.name) newMerged.name = igdbGame.name;
      setMergedGame(newMerged);
    } else {
      setMergedGame(game);
    }
  }, [game, fetchedIgdbGame, gameType]);

  if (!mergedGame) return null;

  return (
    <>
      {/* Game Details Modal */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xl"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            minHeight: { xs: '100%', sm: '80vh' },
            maxHeight: { xs: '100%', sm: '95vh' },
            backgroundColor: theme.palette.background.default
          }
        }}
      >
        {/* Loading overlay for IGDB fetch */}
        <Backdrop
          open={loadingIgdb}
          sx={{
            position: 'absolute',
            zIndex: (theme) => theme.zIndex.drawer + 2,
            color: '#fff',
            backgroundColor: 'rgba(0,0,0,0.2)'
          }}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          pb: 2,
          borderBottom: 1,
          borderColor: 'divider'
        }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {mergedGame.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              {getGameRating(mergedGame) > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rating 
                    value={getGameRating(mergedGame)} 
                    precision={0.1} 
                    readOnly 
                  />
                  <Typography variant="body2" color="text.secondary">
                    ({getGameRating(mergedGame).toFixed(1)}/5)
                  </Typography>
                </Box>
              )}
              {(mergedGame.releaseYear || mergedGame.first_release_date) && (
                <Chip 
                  icon={<CalendarTodayIcon />}
                  label={gameType === "igdb" ? formatReleaseDate(mergedGame.first_release_date) : mergedGame.releaseYear} 
                  variant="outlined"
                  color="secondary"
                />
              )}
              {/* New fields for local games */}
              {gameType === "local" && (
                <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 2, alignItems: 'center', mt: 1 }}>
                    <span
                      title={mergedGame.completed ? t('games_completed') : t('games_not_completed')}
                      style={{ fontSize: 22, lineHeight: 1, cursor: 'pointer' }}
                      onClick={async () => {
                        if (typeof onToggleCompleted === 'function') {
                          await onToggleCompleted(mergedGame);
                          // Refresh mergedGame after update
                          setMergedGame((prev: any) => ({ ...prev, completed: !prev.completed }));
                        }
                      }}
                    >
                      {mergedGame.completed ? (
                        <EmojiEventsIcon />
                      ) : (
                        <MilitaryTechIcon sx={{ color: theme.palette.action.disabled }}/>
                      )}
                    </span>
                    <span
                      title={mergedGame.favorite ? t('games_favorite') : t('games_not_favorite')}
                      style={{ fontSize: 22, lineHeight: 1, cursor: 'pointer' }}
                      onClick={async () => {
                        if (typeof onToggleFavorite === 'function') {
                          await onToggleFavorite(mergedGame);
                          // Refresh mergedGame after update
                          setMergedGame((prev: any) => ({ ...prev, favorite: !prev.favorite }));
                        }
                      }}
                    >
                      {mergedGame.favorite ? (
                        <FavoriteIcon sx={{ color: theme.palette.error.main }}  />
                      ) : (
                        <FavoriteBorderIcon sx={{ color: theme.palette.action.disabled }} />
                      )}
                    </span>
                </Box>
              )}
            </Box>
          </Box>
          <IconButton onClick={handleClose} size="large">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: 0 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3, pt: 3 }}>
            {/* Left Sidebar - Cover and Actions */}
            <Box sx={{ flex: { xs: '1 1 100%', lg: '0 0 300px' } }}>
              <Box sx={{ position: 'sticky', top: 16 }}>
                {/* Game Cover */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Avatar
                    src={getGameCoverUrl(mergedGame.cover) || undefined}
                    variant="rounded"
                    sx={{ 
                      width: '100%', 
                      height: 'auto',
                      maxWidth: 280,
                      aspectRatio: '3/4',
                      mx: 'auto',
                      mb: 2,
                      bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
                      cursor: mergedGame.cover ? 'pointer' : 'default'
                    }}
                    onClick={() => {
                      if (mergedGame.cover) {
                        setDetailsTabValue(1); // Switch to Cover tab
                      }
                    }}
                  >
                    <SportsEsportsIcon sx={{ fontSize: '4rem' }} />
                  </Avatar>
                  {gameType != "local" && <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<AddCircleIcon />}
                    onClick={() => onAddToCollection(mergedGame)}
                    sx={{ mb: 2 }}
                  >
                    {t("games_addToCollection")}
                  </Button>}
                </Box>
                {/* Quick Info Card */}
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InfoIcon color="primary" />
                    {t("games_gameInfo")}
                  </Typography>
                  {mergedGame.genres && mergedGame.genres.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        {t("games_genre")}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {mergedGame.genres.map((genre: any, i: number) => (
                          <Chip
                            key={i}
                            label={typeof genre === 'string' ? genre : genre.name}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                  {mergedGame.involved_companies && mergedGame.involved_companies.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        {t("games_companies")}
                      </Typography>
                      <Typography variant="body2">
                        {formatCompaniesInvolved(mergedGame.involved_companies)}
                      </Typography>
                    </Box>
                  )}
                  {mergedGame.companies && mergedGame.companies.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        {t("games_companies")}
                      </Typography>
                      <Typography variant="body2">
                        {mergedGame.companies.join(", ")}
                      </Typography>
                    </Box>
                  )}
                  {mergedGame.platforms && mergedGame.platforms.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        {t("games_platforms")}
                      </Typography>
                      <Typography variant="body2">
                        {mergedGame.platforms.length} {mergedGame.platforms.length === 1 ? 'platform' : 'platforms'}
                      </Typography>
                    </Box>
                  )}
                </Card>
              </Box>
            </Box>
            {/* Main Content Area */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {gameType === "local" && (
                <Accordion sx={{ mt: 1 }}>
                  <AccordionSummary
                    expandIcon={<InfoIcon />}
                    aria-controls="game-condition-content"
                    id="game-condition-header"
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      {t('games_physicalDetails')}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', md: 'row' },
                      flexWrap: 'wrap',
                      gap: 2,
                      alignItems: 'flex-start',
                    }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: { xs: 0.5, md: 0 } }}>{t('games_region')}: <b>{mergedGame.region ? (t as any)(`games_region_${mergedGame.region.toLowerCase()}`) : t('games_none')}</b></Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: { xs: 0.5, md: 0 } }}>{t('games_labelDamage')}: <b>{mergedGame.labelDamage ? t('games_yes') : t('games_no')}</b></Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: { xs: 0.5, md: 0 } }}>{t('games_discoloration')}: <b>{mergedGame.discoloration ? t('games_yes') : t('games_no')}</b></Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: { xs: 0.5, md: 0 } }}>{t('games_rentalSticker')}: <b>{mergedGame.rentalSticker ? t('games_yes') : t('games_no')}</b></Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: { xs: 0.5, md: 0 } }}>{t('games_testedWorking')}: <b>{mergedGame.testedWorking ? t('games_yes') : t('games_no')}</b></Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: { xs: 0.5, md: 0 } }}>{t('games_reproduction')}: <b>{mergedGame.reproduction ? t('games_yes') : t('games_no')}</b></Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: { xs: 0.5, md: 0 } }}>{t('games_steelbook')}: <b>{mergedGame.steelbook ? t('games_yes') : t('games_no')}</b></Typography>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              )}
              {/* Tabs for different content sections */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs 
                  value={detailsTabValue} 
                  onChange={(e, newValue) => setDetailsTabValue(newValue)}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  <Tab label={t("games_summary")} />
                  <Tab 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ImageIcon fontSize="small" />
                        {t("games_cover")}
                        {mergedGame.cover && (
                          <Badge sx={{marginLeft: 1.5}} badgeContent={1} color="primary" />
                        )}
                      </Box>
                    } 
                  />
                  <Tab 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhotoLibraryIcon fontSize="small" />
                        {t("games_screenshots")}
                        {mergedGame.screenshots && mergedGame.screenshots.length > 0 && (
                          <Badge sx={{marginLeft: 1.5}} badgeContent={mergedGame.screenshots.length} color="primary" />
                        )}
                      </Box>
                    } 
                  />
                  <Tab 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ImageIcon fontSize="small" />
                        {t("games_artworks")}
                        {mergedGame.artworks && mergedGame.artworks.length > 0 && (
                          <Badge sx={{marginLeft: 1.5}} badgeContent={mergedGame.artworks.length} color="primary" />
                        )}
                      </Box>
                    } 
                  />
                  {(gameType === "local") && (
                   <Tab 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ImageIcon fontSize="small" />
                        {t("games_photos")}
                        {mergedGame.photos && mergedGame.photos.length > 0 && (
                          <Badge sx={{marginLeft: 1.5}} badgeContent={mergedGame.photos.length} color="primary" />
                        )}
                      </Box>
                    } 
                  />
                  )}
                </Tabs>
              </Box>
              {/* Tab Content */}
              {/* Summary Tab */}
              {detailsTabValue === 0 && (
                <Box>
                  {mergedGame.summary ? (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        {t("games_summary")}
                      </Typography>
                      <Typography variant="body1" paragraph sx={{ lineHeight: 1.7 }}>
                        {mergedGame.summary}
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        {t("games_noSummary")}
                      </Typography>
                    </Box>
                  )}
                  {mergedGame.storyline && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        {t("games_storyline")}
                      </Typography>
                      <Typography variant="body1" paragraph sx={{ lineHeight: 1.7 }}>
                        {mergedGame.storyline}
                      </Typography>
                    </Box>
                  )}
                  {mergedGame.notes && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        {t("games_notes")}
                      </Typography>
                      <Typography variant="body1" paragraph sx={{ lineHeight: 1.7 }}>
                        {mergedGame.notes}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
              {/* Cover Tab */}
              {detailsTabValue === 1 && (
                <GameMediaGallery
                  images={mergedGame.cover ? [mergedGame.cover] : []}
                  title={t("games_cover")}
                  icon={<ImageIcon />}
                  emptyText={t("games_noCover")}
                  getImageUrl={getGameCoverUrl}
                  onOpenGallery={openImageGallery}
                  seeAllLabel={t("games_clickToView")}
                  badgeCount={1}
                  imageAltPrefix="Cover"
                />
              )}
              {/* Screenshots Tab */}
              {detailsTabValue === 2 && (
                <GameMediaGallery
                  images={mergedGame.screenshots || []}
                  title={t("games_screenshots")}
                  icon={<PhotoLibraryIcon />}
                  emptyText={t("games_noScreenshots")}
                  getImageUrl={getScreenshotUrl}
                  onOpenGallery={openImageGallery}
                  seeAllLabel={t("games_seeAll")}
                  imageAltPrefix="Screenshot"
                />
              )}
              {/* Artworks Tab */}
              {detailsTabValue === 3 && (
                <GameMediaGallery
                  images={mergedGame.artworks || []}
                  title={t("games_artworks")}
                  icon={<ImageIcon />}
                  emptyText={t("games_noArtworks")}
                  getImageUrl={getArtworkUrl}
                  onOpenGallery={openImageGallery}
                  seeAllLabel={t("games_seeAll")}
                  imageAltPrefix="Artwork"
                />
              )}
              {/* Photos Tab */}
              {((detailsTabValue === 4) && (gameType === "local")) && (
                <GameMediaGallery
                  images={mergedGame.photos || []}
                  title={t("games_photos")}
                  icon={<ImageIcon />}
                  emptyText={t("games_noArtworks")}
                  getImageUrl={img => typeof img === 'string' ? img : ''}
                  onOpenGallery={openImageGallery}
                  seeAllLabel={t("games_seeAll")}
                  imageAltPrefix="Photo"
                />
              )}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
