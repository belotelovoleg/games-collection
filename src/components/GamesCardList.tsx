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
            <Card variant="outlined" sx={{ p: 2, display: 'flex', gap: 2 }}>
              <Box
                sx={{ cursor: 'pointer', minWidth: 80 }}
                onClick={() => {
                  // Collect all available images: photos, cover, screenshot
                  const images: string[] = [];
                  if (Array.isArray(game.photos)) images.push(...game.photos.filter(Boolean));
                  if (game.cover) images.push(game.cover);
                  if (game.screenshot) images.push(game.screenshot);
                  // Remove duplicates
                  const uniqueImages = Array.from(new Set(images));
                  if (uniqueImages.length === 0) return;
                  if (typeof openPhotoGallery === 'function') {
                    openPhotoGallery(uniqueImages, 0);
                  }
                }}
              >
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
                {Array.isArray(game.photos) && game.photos.length > 1 && (
                  <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', width: '100%' }}>
                    +{game.photos.length - 1} more
                  </Typography>
                )}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">{game.title || game.name}</Typography>
                <Typography variant="body2" color="text.secondary">{platformStr}</Typography>
                {/* Alternative Names Button & Popover */}
                {game.alternativeNames && game.alternativeNames.length > 0 && (
                  <>
                    <Button size="small" variant="outlined" onClick={(e) => handleAltNamesClick(e, game.id)} sx={{ mb: 1 }}>
                      {t('games_alternativeNames') || 'Alternative Names'}
                    </Button>
                  </>
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
                {game.genres && <Typography variant="body2" color="text.secondary">{game.genres.join(', ')}</Typography>}
                {consoleSystemStr && <Typography variant="body2" color="text.secondary">{consoleSystemStr}</Typography>}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
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
                <Box sx={{ display: 'flex', gap: 1, mb: 0.5, alignItems: 'center' }}>
                  <span title={game.favorite ? 'Favorite' : 'Not Favorite'} style={{ fontSize: 22, lineHeight: 1 }}>
                    <span
                      style={{ cursor: 'pointer' }}
                      onClick={() => onToggleFavorite(game)}
                    >
                      {game.favorite ? '❤️' : '🤍'}
                    </span>
                  </span>
                  <span title={game.completed ? 'Completed' : 'Not Completed'} style={{ fontSize: 22, lineHeight: 1 }}>
                    <span
                      style={{ cursor: 'pointer' }}
                      onClick={() => onToggleCompleted(game)}
                    >
                      {game.completed ? '🏅' : '–'}
                    </span>
                  </span>
                </Box>
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  <Button size="small" onClick={() => handleEditGame(game)}>{t("common_edit")}</Button>
                  <Button size="small" color="error" onClick={() => handleDeleteGame(game)} disabled={deletingGameId === game.id}>
                    {deletingGameId === game.id ? <span>...</span> : 'Delete'}
                  </Button>
                </Box>
              </Box>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
