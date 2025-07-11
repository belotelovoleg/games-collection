import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Paper,
  Avatar,
  Chip,
  Button,
  Rating,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import BusinessIcon from "@mui/icons-material/Business";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { useTranslations } from "@/hooks/useTranslations";

interface EnhancedSearchResultsModalProps {
  open: boolean;
  onClose: () => void;
  searchResults: any;
  isMobile: boolean;
  theme: any;
  getGameCoverUrl: (cover: any, size?: string) => string | null;
  getGameRating: (game: any) => number;
  formatReleaseDate: (timestamp: number) => string;
  formatCompanies: (companies: any[]) => string;
  handleViewGameDetails: (game: any) => void;
  handleAddGameToCollection: (game: any) => void;
}

const EnhancedSearchResultsModal: React.FC<EnhancedSearchResultsModalProps> = ({
  open,
  onClose,
  searchResults,
  isMobile,
  theme,
  getGameCoverUrl,
  getGameRating,
  formatReleaseDate,
  formatCompanies,
  handleViewGameDetails,
  handleAddGameToCollection,
}) => {
  const { t } = useTranslations();
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <SportsEsportsIcon color="primary" />
            {t("games_searchResults") || 'Search Results'}
          </Box>
          {searchResults && (
            <Typography variant="body2" color="text.secondary">
              {searchResults.games.length} {t("games_foundFor") || 'found for'} "{searchResults.searchQuery}" 
              {" "}{t("games_on") || 'on'} {searchResults.console.name}
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} size="large">
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
              {t("games_noGamesFound") || 'No games found'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("games_tryDifferentSearch") || 'Try a different search'}
            </Typography>
          </Box>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedSearchResultsModal;
