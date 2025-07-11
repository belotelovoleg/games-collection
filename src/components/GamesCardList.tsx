import React from "react";
import { Card, Box, Avatar, Typography, Button, Popover, Rating } from "@mui/material";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";

export function GamesCardList({
  userGames,
  allPlatforms,
  allConsoleSystems,
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
  t
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
          <div key={game.id} style={{ width: '100%' }}>
            <Card variant="outlined" sx={{ p: 2 }}>
              {/* Game name centered on its own line */}
              <Typography variant="subtitle1" fontWeight="bold" sx={{ textAlign: 'center', mb: 1 }}>{game.title || game.name}</Typography>
              {/* Mobile-only layout: image left, buttons right, all vertical */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, width: '100%',flexWrap: 'wrap' }}>
                  {/* Game image on left */}
                  <Box
                    sx={{ cursor: 'pointer', minWidth: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', width: '80px' }}
                    onClick={() => {
                      const images: string[] = [];
                      if (Array.isArray(game.photos)) images.push(...game.photos.filter(Boolean));
                      if (game.cover) images.push(game.cover);
                      if (game.screenshot) images.push(game.screenshot);
                      const uniqueImages = Array.from(new Set(images));
                      if (uniqueImages.length === 0) return;
                      if (typeof openPhotoGallery === 'function') {
                        openPhotoGallery(uniqueImages, 0);
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
                        onClick={() => onToggleFavorite(game)}
                      >
                        {game.favorite ? '❤️' : '🤍'}
                      </Button>
                      {/* Completed button */}
                      <Button
                        variant='outlined'
                        color={game.completed ? 'success' : 'inherit'}
                        onClick={() => onToggleCompleted(game)}
                      >
                        {game.completed ? '🏅' : '–'}
                      </Button>
                      {/* Edit icon */}
                      <Button 
                        variant='outlined'
                        onClick={() => handleEditGame(game)}
                      >
                        <span role="img" aria-label="Edit">✏️</span>
                      </Button>
                      {/* Delete icon */}
                      <Button  
                        variant='outlined'
                        color="error" 
                        onClick={() => handleDeleteGame(game)} 
                        disabled={deletingGameId === game.id}
                        >
                        {deletingGameId === game.id ? <span>...</span> : <span role="img" aria-label="Delete">🗑️</span>}
                      </Button>
                  </Box>
                </Box>
                {/* Rating row, centered */}
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
                {/* Console name */}
                {consoleSystemStr && <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>{consoleSystemStr}</Typography>}
                {/* Alternative Names Button & Popover */}
                {game.alternativeNames && game.alternativeNames.length > 0 && (
                  <Button size="small" variant="outlined" onClick={(e) => handleAltNamesClick(e, game.id)} sx={{ mb: 1, mt: 1 }}>
                    {t('games_alternativeNames') || 'Alternative Names'}
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
            </Card>
          </div>
        );
      })}
    </div>
  );
}
