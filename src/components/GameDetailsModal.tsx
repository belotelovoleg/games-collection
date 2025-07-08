"use client";

import { useState } from "react";
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
  onAddToCollection: (game: any) => void;
}

export function GameDetailsModal({ open, onClose, game, onAddToCollection }: GameDetailsModalProps) {
  const { t } = useTranslations();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Modal states
  const [detailsTabValue, setDetailsTabValue] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [galleryTitle, setGalleryTitle] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Helper functions
  const formatReleaseDate = (timestamp: number) => {
    if (!timestamp) return "Unknown";
    return new Date(timestamp * 1000).getFullYear().toString();
  };

  const getGameCoverUrl = (cover: any, size = 'cover_big') => {
    if (!cover?.image_id) return null;
    return `https://images.igdb.com/igdb/image/upload/t_${size}/${cover.image_id}.jpg`;
  };

  const getScreenshotUrl = (screenshot: any, size = 'screenshot_med') => {
    if (!screenshot?.image_id) return null;
    return `https://images.igdb.com/igdb/image/upload/t_${size}/${screenshot.image_id}.jpg`;
  };

  const getArtworkUrl = (artwork: any, size = 'screenshot_med') => {
    if (!artwork?.image_id) return null;
    return `https://images.igdb.com/igdb/image/upload/t_${size}/${artwork.image_id}.jpg`;
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

  if (!game) return null;

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
              {game.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              {getGameRating(game) > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rating 
                    value={getGameRating(game)} 
                    precision={0.1} 
                    readOnly 
                  />
                  <Typography variant="body2" color="text.secondary">
                    ({getGameRating(game).toFixed(1)}/5)
                  </Typography>
                </Box>
              )}
              {game.first_release_date && (
                <Chip 
                  icon={<CalendarTodayIcon />}
                  label={formatReleaseDate(game.first_release_date)} 
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
                    src={getGameCoverUrl(game.cover) || undefined}
                    variant="rounded"
                    sx={{ 
                      width: '100%', 
                      height: 'auto',
                      maxWidth: 280,
                      aspectRatio: '3/4',
                      mx: 'auto',
                      mb: 2,
                      bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
                      cursor: game.cover ? 'pointer' : 'default'
                    }}
                    onClick={() => {
                      if (game.cover) {
                        setDetailsTabValue(1); // Switch to Cover tab
                      }
                    }}
                  >
                    <SportsEsportsIcon sx={{ fontSize: '4rem' }} />
                  </Avatar>
                  
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<AddCircleIcon />}
                    onClick={() => onAddToCollection(game)}
                    sx={{ mb: 2 }}
                  >
                    {t("games_addToCollection")}
                  </Button>
                </Box>

                {/* Quick Info Card */}
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InfoIcon color="primary" />
                    {t("games_gameInfo")}
                  </Typography>
                  
                  {game.genres && game.genres.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        {t("games_genre")}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {game.genres.map((genre: any) => (
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
                  
                  {game.involved_companies && game.involved_companies.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        {t("games_companies")}
                      </Typography>
                      <Typography variant="body2">
                        {formatCompanies(game.involved_companies)}
                      </Typography>
                    </Box>
                  )}

                  {game.platforms && game.platforms.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        {t("games_platforms")}
                      </Typography>
                      <Typography variant="body2">
                        {game.platforms.length} {game.platforms.length === 1 ? 'platform' : 'platforms'}
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
                        {game.cover && (
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
                        {game.screenshots && game.screenshots.length > 0 && (
                          <Badge badgeContent={game.screenshots.length} color="primary" />
                        )}
                      </Box>
                    } 
                  />
                  <Tab 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ImageIcon fontSize="small" />
                        {t("games_artworks")}
                        {game.artworks && game.artworks.length > 0 && (
                          <Badge badgeContent={game.artworks.length} color="primary" />
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
                  {game.summary ? (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        {t("games_summary")}
                      </Typography>
                      <Typography variant="body1" paragraph sx={{ lineHeight: 1.7 }}>
                        {game.summary}
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        {t("games_noSummary")}
                      </Typography>
                    </Box>
                  )}

                  {game.storyline && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        {t("games_storyline")}
                      </Typography>
                      <Typography variant="body1" paragraph sx={{ lineHeight: 1.7 }}>
                        {game.storyline}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {/* Cover Tab */}
              {detailsTabValue === 1 && (
                <Box>
                  {game.cover ? (
                    <Box>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ImageIcon />
                        {t("games_cover")}
                      </Typography>
                      <Box sx={{ textAlign: 'center' }}>
                        <img
                          src={getGameCoverUrl(game.cover) || undefined}
                          alt={t("games_cover")}
                          onClick={() => openImageGallery([game.cover], t("games_cover"), 0)}
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
                  {game.screenshots && game.screenshots.length > 0 ? (
                    <Box>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhotoLibraryIcon />
                        {t("games_screenshots")} ({game.screenshots.length})
                      </Typography>
                      <ImageList 
                        variant="masonry" 
                        cols={isMobile ? 2 : 3} 
                        gap={8}
                      >
                        {game.screenshots.slice(0, 6).map((screenshot: any, index: number) => {
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
                                game.screenshots, 
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
                      
                      {game.screenshots.length > 6 && (
                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                          <Button
                            variant="outlined"
                            onClick={() => openImageGallery(
                              game.screenshots, 
                              t("games_screenshots"), 
                              0
                            )}
                            startIcon={<FullscreenIcon />}
                          >
                            {t("games_seeAll")} ({game.screenshots.length} {t("games_screenshots").toLowerCase()})
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
                  {game.artworks && game.artworks.length > 0 ? (
                    <Box>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ImageIcon />
                        {t("games_artworks")} ({game.artworks.length})
                      </Typography>
                      <ImageList 
                        variant="masonry" 
                        cols={isMobile ? 2 : 3} 
                        gap={8}
                      >
                        {game.artworks.slice(0, 6).map((artwork: any, index: number) => {
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
                                game.artworks, 
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
                      
                      {game.artworks.length > 6 && (
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
                            {t("games_seeAll")} ({game.artworks.length} {t("games_artworks").toLowerCase()})
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
