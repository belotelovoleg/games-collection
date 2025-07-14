import React from "react";
import { Card, Box, Avatar, Typography, Button, Popover, Rating } from "@mui/material";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";

export function GamesCardList({
  userGames,
  allPlatforms,
  allConsoleSystems,
  theme,
  altNamesGameId,
  altNamesAnchorEl,
  handleAltNamesClick,
  handleAltNamesClose,
  getGameRating,
  deletingGameId,
  handleEditGame,
  handleDeleteGame,
  openPhotoGallery,
  onToggleFavorite,
  onToggleCompleted,
  onRatingClick,
  t,
  handleViewGameDetails
}: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {userGames.map((game: any) => {
        let platformStr = '';
        if (Array.isArray(game.platforms)) {
          if (typeof game.platforms[0] === 'object') {
            platformStr = game.platforms.map((p: any) => p.name).join(', ');
          } else {
            platformStr = game.platforms
              .map((pid: number) => {
                const found = allPlatforms?.find((p: any) => String(p.id) === String(pid));
                return found ? found.name : null;
              })
              .filter(Boolean)
              .join(', ');
          }
        }
        let consoleSystemStr = '';
        if (Array.isArray(game.consoleIds)) {
          consoleSystemStr = game.consoleIds
            .map((cid: number) => {
              const found = allConsoleSystems?.find((c: any) => String(c.id) === String(cid));
              return found ? found.name : null;
            })
            .filter(Boolean)
            .join(', ');
        }
        return (
          <div
            key={game.id}
            style={{ width: '100%'}}
          >
            <Card variant="outlined" sx={{ p: 2 }}>
              {/* Game name centered on its own line */}
              <Typography variant="subtitle1" fontWeight="bold" sx={{ textAlign: 'center', mb: 1 }}>{game.title || game.name}</Typography>
              {/* Mobile-only layout: image left, buttons right, all vertical */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, width: '100%',flexWrap: 'wrap' }}>
                  {/* Game image on left */}
                  <Box
                    sx={{ cursor: 'pointer', minWidth: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', width: '80px' }}
                    onClick={e => {
                      // Only trigger if not clicking on a button or interactive element
                      if (
                        e.target instanceof HTMLElement &&
                        ['BUTTON', 'SPAN', 'INPUT', 'TEXTAREA', 'A'].includes(e.target.tagName)
                      ) return;
                      if (typeof handleViewGameDetails === 'function') {
                        handleViewGameDetails(game);
                      }
                    }}
                  >
                    <Avatar
                      src={game.cover || game.photos?.[0] || game.screenshot || undefined}
                      variant="rounded"
                      sx={{ width: 80, height: 80, bgcolor: 'grey.200', mb: 1 }}
                    >
                      {!(game.cover || game.photos?.[0] || game.screenshot) && <SportsEsportsIcon />}
                    </Avatar>
                    {/* Rating row, centered, moved under image */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                      <span
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        title="Set rating"
                        onClick={e => onRatingClick(e, game)}
                      >
                        <Rating value={getGameRating(game)} precision={0.1} size="small" readOnly />
                      </span>
                      <Typography variant="caption" color="text.secondary">
                        ({getGameRating(game).toFixed(1)})
                      </Typography>
                    </Box>
                  </Box>
                  {/* Buttons and info on right, all vertical for mobile */}
                  <Box sx={{ flex: 1, 
                    display: 'flex', 
                    flexDirection: 'row', 
                    gap: 1, 
                    width: '100%', 
                    flexWrap: 'wrap', 
                    alignItems: 'center',
                    justifyContent: 'center' }}>
                      {/* Favorite button */}
                      <Button
                        variant='outlined'
                        color={game.favorite ? 'error' : 'inherit'}
                        onClick={e => { e.stopPropagation(); onToggleFavorite(game); }}
                      >
                        {game.favorite ? (
                          <FavoriteIcon sx={{ color: theme.palette.error.main }}  />
                        ) : (
                          <FavoriteBorderIcon sx={{ color: theme.palette.action.disabled }} />
                        )}
                      </Button>
                      {/* Completed button */}
                      <Button
                        variant='outlined'
                        color={game.completed ? 'success' : 'inherit'}
                        onClick={e => { e.stopPropagation(); onToggleCompleted(game); }}
                      >
                        {game.completed ? (
                          <EmojiEventsIcon />
                        ) : (
                          <MilitaryTechIcon sx={{ color: theme.palette.action.disabled }}/>
                        )}
                      </Button>
                      {/* Edit icon */}
                      <Button 
                        variant='outlined'
                        onClick={e => { e.stopPropagation(); handleEditGame(game); }}
                      >
                        <span role="img" aria-label="Edit">✏️</span>
                      </Button>
                      {/* Delete icon */}
                      <Button  
                        variant='outlined'
                        color="error" 
                        onClick={e => { e.stopPropagation(); handleDeleteGame(game); }} 
                        disabled={deletingGameId === game.id}
                        >
                        {deletingGameId === game.id ? <span>...</span> : <span role="img" aria-label="Delete">🗑️</span>}
                      </Button>
                      {/* Alternative Names Button & Popover */}
                      {game.alternativeNames && game.alternativeNames.length > 0 && (
                        <Button size="small" variant="outlined" onClick={(e) => handleAltNamesClick(e, game.id)} sx={{ mb: 0.5, mt: 0.5, minWidth: 24, px: 1, py: 0.2, fontSize: '0.75rem', lineHeight: 2 }}>
                          {t('games_alternativeNames') || 'Alt Names'}
                        </Button>
                      )}
                      {altNamesGameId === game.id && (
                        <Popover
                          open={Boolean(altNamesAnchorEl)}
                          anchorEl={altNamesAnchorEl}
                          onClose={handleAltNamesClose}
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                        >
                          <Box sx={{ p: 2, minWidth: 180 }}>
                            {game.alternativeNames.map((name: string, idx: number) => (
                              <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>{name}</Typography>
                            ))}
                          </Box>
                        </Popover>
                      )}
                  </Box>
                </Box>


                <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 0, justifyContent: 'center', mt: 1 }}>
                  {consoleSystemStr && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', width: '100%', mb: 0.2, mt: 0 }}>
                      {t('console')}: <b>{consoleSystemStr}</b>
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', width: '100%', mb: 0.2, mt: 0 }}>
                    {t('games_completeness')}: <b>{game.completeness ? t(`games_completeness_${game.completeness.toLowerCase()}`) : t('games_none')}</b>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', width: '100%', mb: 0.2, mt: 0 }}>
                    {t('games_region')}: <b>{game.region ? t(`games_region_${game.region.toLowerCase()}`) : t('games_none')}</b>
                  </Typography>
                </Box>
              </Box>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
