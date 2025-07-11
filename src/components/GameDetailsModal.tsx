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
  ImageList,
  ImageListItem
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import InfoIcon from "@mui/icons-material/Info";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import ImageIcon from "@mui/icons-material/Image";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

interface GameDetailsModalProps {
  open: boolean;
  onClose: () => void;
  game: any;
  gameType: "igdb" | "local";
  onAddToCollection: (game: any) => void;
}

export function GameDetailsModal({ open, onClose, game, gameType, onAddToCollection }: GameDetailsModalProps) {
  const { t } = useTranslations();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Modal states
  const [detailsTabValue, setDetailsTabValue] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [galleryTitle, setGalleryTitle] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fetchedIgdbGame, setFetchedIgdbGame] = useState(null);

  // When you need to fetch IGDB data:
  useEffect(() => {
    if (gameType === "local" && game && !game.igdbGame && (game.igdbId || game.igdbGameId)) {
      fetch(`/api/igdb/game/${game.igdbId || game.igdbGameId}`)
        .then(res => res.json())
        .then(data => setFetchedIgdbGame(data));
    }
  }, [game, gameType]);

  // Helper functions
  const formatReleaseDate = (timestamp: number) => {
    if (!timestamp) return "Unknown";
    return new Date(timestamp * 1000).getFullYear().toString();
  };

  const getGameCoverUrl = (cover: any, size = 'cover_big') => {
    if (!cover?.image_id && !cover.includes('//') ) return null;
    return cover.includes('//')  ? cover : `https://images.igdb.com/igdb/image/upload/t_${size}/${cover.image_id}.jpg`;
  };

  const getScreenshotUrl = (screenshot: any, size = 'screenshot_med') => {
    if (!screenshot?.image_id && !screenshot.includes('//') ) return null;
    return screenshot.includes('//') ? screenshot : `https://images.igdb.com/igdb/image/upload/t_${size}/${screenshot.image_id}.jpg`;
  };

  const getArtworkUrl = (artwork: any, size = 'screenshot_med') => {
    if (!artwork?.image_id && !artwork.includes('//') ) return null;
    return artwork.includes('//') ? artwork : `https://images.igdb.com/igdb/image/upload/t_${size}/${artwork.image_id}.jpg`;
  };

  const getGameRating = (game: any) => {
    if (!game) return 0;
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

  const openImageGallery = (images: any[], title: string, startIndex = 0) => {
    setGalleryImages(images);
    setGalleryTitle(title);
    setCurrentImageIndex(startIndex);
    setGalleryOpen(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleClose = () => {
    setDetailsTabValue(0); // Reset tab when closing
    onClose();
  };

  // Merge local game with igdbGame if gameType is "local"
  let mergedGame = game;
  if (gameType === "local" && game) {
    const igdbGame = game.igdbGame || fetchedIgdbGame || {};
    mergedGame = {
      // Prefer local game fields, fallback to igdbGame fields
      name: game.name || igdbGame.name,
      summary: game.summary || igdbGame.summary,
      storyline: igdbGame.storyline, // Only in IGDB
      cover: game.cover ? { image_id: game.cover } : igdbGame.cover,
      screenshots: (igdbGame.gameScreenshotRelations && igdbGame.gameScreenshotRelations.length > 0) ? igdbGame.gameScreenshotRelations.map((shot: any) => shot.screenshot.url) : [],
      artworks: (igdbGame.gameArtworkRelations && igdbGame.gameArtworkRelations.length > 0) ? igdbGame.gameArtworkRelations.map((shot: any) => shot.artwork.url) : [],
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
    if (!mergedGame.name) mergedGame.name = igdbGame.name;
  }

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
              {mergedGame.first_release_date && (
                <Chip 
                  icon={<CalendarTodayIcon />}
                  label={formatReleaseDate(mergedGame.first_release_date)} 
                  variant="outlined"
                  color="secondary"
                />
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
                        {mergedGame.genres.map((genre: any) => (
                          <Chip 
                            key={genre.id} 
                            label={genre.name} 
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
                        {formatCompanies(mergedGame.involved_companies)}
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
                          <Badge badgeContent={1} color="primary" />
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
                          <Badge badgeContent={mergedGame.screenshots.length} color="primary" />
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
                          <Badge badgeContent={mergedGame.artworks.length} color="primary" />
                        )}
                      </Box>
                    } 
                  />
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
                <Box>
                  {mergedGame.cover ? (
                    <Box>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ImageIcon />
                        {t("games_cover")}
                      </Typography>
                      <Box sx={{ textAlign: 'center' }}>
                        <img
                          src={getGameCoverUrl(mergedGame.cover) || "undefined"}
                          alt={t("games_cover")}
                          onClick={() => openImageGallery([mergedGame.cover], t("games_cover"), 0)}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '60vh',
                            objectFit: 'contain',
                            borderRadius: 8,
                            cursor: 'pointer',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                            transition: 'transform 0.2s ease-in-out'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.02)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {t("games_clickToView")}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <ImageIcon sx={{ fontSize: '4rem', color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        {t("games_noCover")}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {/* Screenshots Tab */}
              {detailsTabValue === 2 && (
                <Box>
                  {mergedGame.screenshots && mergedGame.screenshots.length > 0 ? (
                    <Box>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhotoLibraryIcon />
                        {t("games_screenshots")} ({mergedGame.screenshots.length})
                      </Typography>
                      <ImageList 
                        variant="masonry" 
                        cols={isMobile ? 2 : 3} 
                        gap={8}
                      >
                        {mergedGame.screenshots.slice(0, 6).map((screenshot: any, index: number) => {
                          const screenshotUrl = getScreenshotUrl(screenshot);
                          return screenshotUrl ? (
                            <ImageListItem 
                              key={index}
                              sx={{ 
                                cursor: 'pointer',
                                borderRadius: 2,
                                overflow: 'hidden',
                                '&:hover': { 
                                  transform: 'scale(1.02)',
                                  transition: 'transform 0.2s ease-in-out'
                                }
                              }}
                              onClick={() => openImageGallery(
                                mergedGame.screenshots, 
                                t("games_screenshots"), 
                                index
                              )}
                            >
                              <img
                                src={screenshotUrl}
                                alt={`Screenshot ${index + 1}`}
                                loading="lazy"
                                style={{ borderRadius: 8 }}
                              />
                            </ImageListItem>
                          ) : null;
                        })}
                      </ImageList>
                      
                      {mergedGame.screenshots.length > 6 && (
                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                          <Button
                            variant="outlined"
                            onClick={() => openImageGallery(
                              mergedGame.screenshots, 
                              t("games_screenshots"), 
                              0
                            )}
                            startIcon={<FullscreenIcon />}
                          >
                            {t("games_seeAll")} ({mergedGame.screenshots.length} {t("games_screenshots").toLowerCase()})
                          </Button>
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <PhotoLibraryIcon sx={{ fontSize: '4rem', color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        {t("games_noScreenshots")}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {/* Artworks Tab */}
              {detailsTabValue === 3 && (
                <Box>
                  {mergedGame.artworks && mergedGame.artworks.length > 0 ? (
                    <Box>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ImageIcon />
                        {t("games_artworks")} ({mergedGame.artworks.length})
                      </Typography>
                      <ImageList 
                        variant="masonry" 
                        cols={isMobile ? 2 : 3} 
                        gap={8}
                      >
                        {mergedGame.artworks.slice(0, 6).map((artwork: any, index: number) => {
                          const artworkUrl = getArtworkUrl(artwork);
                          return artworkUrl ? (
                            <ImageListItem 
                              key={index}
                              sx={{ 
                                cursor: 'pointer',
                                borderRadius: 2,
                                overflow: 'hidden',
                                '&:hover': { 
                                  transform: 'scale(1.02)',
                                  transition: 'transform 0.2s ease-in-out'
                                }
                              }}
                              onClick={() => openImageGallery(
                                mergedGame.artworks, 
                                t("games_artworks"), 
                                index
                              )}
                            >
                              <img
                                src={artworkUrl}
                                alt={`Artwork ${index + 1}`}
                                loading="lazy"
                                style={{ borderRadius: 8 }}
                              />
                            </ImageListItem>
                          ) : null;
                        })}
                      </ImageList>
                      
                      {mergedGame.artworks.length > 6 && (
                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                          <Button
                            variant="outlined"
                            onClick={() => openImageGallery(
                              game.artworks, 
                              t("games_artworks"), 
                              0
                            )}
                            startIcon={<FullscreenIcon />}
                          >
                            {t("games_seeAll")} ({mergedGame.artworks.length} {t("games_artworks").toLowerCase()})
                          </Button>
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <ImageIcon sx={{ fontSize: '4rem', color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        {t("games_noArtworks")}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Image Gallery Modal */}
      <Dialog
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        maxWidth="xl"
        fullWidth
        fullScreen
        PaperProps={{
          sx: {
            bgcolor: 'rgba(0, 0, 0, 0.9)',
            color: 'white'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          color: 'white'
        }}>
          <Box>
            {galleryTitle} {galleryImages.length > 1 && `(${currentImageIndex + 1}/${galleryImages.length})`}
          </Box>
          <IconButton onClick={() => setGalleryOpen(false)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          p: 0,
          position: 'relative'
        }}>
          {galleryImages.length > 0 && (
            <>
              <Box
                component="img"
                src={galleryImages[currentImageIndex]?.image_id 
                  ? `https://images.igdb.com/igdb/image/upload/t_1080p/${galleryImages[currentImageIndex].image_id}.jpg`
                  : undefined
                }
                alt={`${galleryTitle} ${currentImageIndex + 1}`}
                sx={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  // Fallback to smaller size if 1080p fails
                  const target = e.target as HTMLImageElement;
                  if (target.src.includes('t_1080p')) {
                    target.src = target.src.replace('t_1080p', 't_720p');
                  } else if (target.src.includes('t_720p')) {
                    target.src = target.src.replace('t_720p', 't_screenshot_huge');
                  }
                }}
              />
              
              {galleryImages.length > 1 && (
                <>
                  <IconButton
                    onClick={previousImage}
                    sx={{
                      position: 'absolute',
                      left: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(0, 0, 0, 0.5)',
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' }
                    }}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                  <IconButton
                    onClick={nextImage}
                    sx={{
                      position: 'absolute',
                      right: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(0, 0, 0, 0.5)',
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' }
                    }}
                  >
                    <ArrowForwardIcon />
                  </IconButton>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
