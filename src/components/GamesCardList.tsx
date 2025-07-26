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
  handleViewGameDetails,
  mobileCardViewMode
}: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '16px', justifyContent: 'flex-start' }}>
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
        // Dynamic block layouts for mobileCardViewMode 1-7
        // 1: full width, 2: 1 block/row, 3: 2 blocks/row, 4: 3 blocks/row (cover, 3x4)
        // 5: 1 block/row, 6: 2 blocks/row, 7: 3 blocks/row (photo, 3x3)
        let blockConfig = null;
        if ([2,3,4].includes(mobileCardViewMode)) blockConfig = {
          width: mobileCardViewMode === 2 ? '100%' : (mobileCardViewMode === 3 ? 'calc(50% - 8px)' : 'calc(33.333% - 10.666px)'),
          aspect: '3/4',
          imageType: 'cover'
        };
        if ([5,6,7].includes(mobileCardViewMode)) blockConfig = {
          width: mobileCardViewMode === 5 ? '100%' : (mobileCardViewMode === 6 ? 'calc(50% - 8px)' : 'calc(33.333% - 10.666px)'),
          aspect: '4/3',
          imageType: 'photo'
        };

        if (mobileCardViewMode === 1) {
          // Vertical card layout for view 1
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
                      sx={{ width: 80, height: 120, bgcolor: 'grey.200', mb: 1 }}
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
                  <Box
                    sx={{
                      flex: 1,
                      display: 'grid',
                      gap: 1,
                      width: '100%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gridTemplateColumns: {
                        xs: 'repeat(2, 1fr)', // 2 buttons per row on mobile
                        sm: 'repeat(4, 1fr)', // 4 buttons per row on desktop
                      },
                    }}
                  >
                    {/* Favorite button */}
                    <Button
                      variant='outlined'
                      color={game.favorite ? 'error' : 'inherit'}
                      onClick={e => { e.stopPropagation(); onToggleFavorite(game); }}
                      sx={{ minWidth: '70px' }}
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
                      sx={{ minWidth: '70px' }}
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
                      sx={{ minWidth: '70px' }}
                    >
                      <span role="img" aria-label="Edit">✏️</span>
                    </Button>
                    {/* Delete icon */}
                    <Button  
                      variant='outlined'
                      color="error" 
                      onClick={e => { e.stopPropagation(); handleDeleteGame(game); }} 
                      disabled={deletingGameId === game.id}
                      sx={{ minWidth: '70px' }}
                      >
                      {deletingGameId === game.id ? <span>...</span> : <span role="img" aria-label="Delete">🗑️</span>}
                    </Button>
                    {/* Alternative Names Button - separate row, centered, 50% width */}
                    {game.alternativeNames && game.alternativeNames.length > 0 && (
                      <Box sx={{ gridColumn: '1 / -1', width: '100%', display: 'flex', justifyContent: 'center', mt: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(e) => handleAltNamesClick(e, game.id)}
                          sx={{ minWidth: 120, mx: 'auto', px: 1, py: 0.2, fontSize: '0.75rem', lineHeight: 2, textAlign: 'center', whiteSpace: 'nowrap' }}
                        >
                          {t('games_alternativeNames') || 'Alt Names'}
                        </Button>
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
                    )}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 0, justifyContent: 'center', mt: 0 }}>
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
        } else if (blockConfig) {
          // Use cover or photo depending on imageType
          let imageSrc = blockConfig.imageType === 'cover'
            ? (game.cover || game.photos?.[0] || game.screenshot || undefined)
            : (game.photos?.[0] || game.cover || game.screenshot || undefined);
          return (
            <div
              key={game.id}
              style={{ width: blockConfig.width, display: 'flex', justifyContent: 'center', cursor: 'pointer' }}
              onClick={() => typeof handleViewGameDetails === 'function' && handleViewGameDetails(game)}
            >
              <Card variant="outlined" sx={{ p: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Image block with dynamic aspect ratio */}
                <Box sx={{ width: '100%', aspectRatio: blockConfig.aspect, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Avatar
                    src={imageSrc}
                    variant="rounded"
                    sx={{ width: '100%', height: '100%', bgcolor: 'grey.200', borderRadius: 0 }}
                  >
                    {!imageSrc && <SportsEsportsIcon />}
                  </Avatar>
                </Box>
                {/* Game title below image */}
                <Box sx={{ width: '100%', height: '50px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    sx={{
                      textAlign: 'center',
                      width: '100%',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'normal',
                    }}
                  >
                    {game.title || game.name}
                  </Typography>
                </Box>
              </Card>
            </div>
          );
        } else {
          return null;
        }
      })}
    </div>
  );
}
