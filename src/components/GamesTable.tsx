import React from "react";
import { Avatar, Button, Popover, Box, Typography, Rating, Tooltip, IconButton } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InventoryIcon from '@mui/icons-material/Inventory';
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";

export function GamesTable({
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
  onToggleFavorite,
  onToggleCompleted,
  onRatingClick,
  openPhotoGallery,
  t,
  handleViewGameDetails
}: any) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ background: theme.palette.background.paper, borderBottom: `2px solid ${theme.palette.divider}` }}>
          <th style={{ padding: '8px', textAlign: 'center' }}>{'Image'}</th>
          <th style={{ padding: '8px', textAlign: 'center' }}>{t('games_filter_title') || 'Title'}</th>
          <th style={{ padding: '8px', textAlign: 'center' }}>{t('games_alternativeNames') || 'Alternative Names'}</th>
          <th style={{ padding: '8px', textAlign: 'center' }}>{t('games_platforms') || 'Platforms'}</th>
          <th style={{ padding: '8px', textAlign: 'center' }}>{t('games_rating') || 'Rating'}</th>
          <th style={{ padding: '8px', textAlign: 'center' }}>{t('games_console') || 'Console'}</th>
          <th style={{ padding: '8px', textAlign: 'center' }}>{t('games_condition') || 'Condition'}</th>
          <th style={{ padding: '8px', textAlign: 'center' }}>{t('games_region') || 'Region'}</th>
          <th style={{ padding: '8px', textAlign: 'center' }}>{t('games_completed') || 'Completed'}</th>
          <th style={{ padding: '8px', textAlign: 'center' }}>{t('games_favorite') || 'Favorite'}</th>
          <th style={{ padding: '8px', textAlign: 'center' }}>{t('games_actions') || 'Actions'}</th>
        </tr>
      </thead>
      <tbody>
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
            <tr
              key={game.id}
              style={{ borderBottom: `1px solid ${theme.palette.divider}`, cursor: 'pointer' }}
              onClick={e => {
                if (
                  e.target instanceof HTMLElement &&
                  ['BUTTON', 'SPAN', 'INPUT', 'TEXTAREA', 'A'].includes(e.target.tagName)
                ) return;
                if (typeof handleViewGameDetails === 'function') {
                  handleViewGameDetails(game);
                }
              }}
            >
              <td style={{ padding: '8px' }}>
                <Tooltip title={t('games_photos') || 'Photos'}>
                  <span
                    style={{ cursor: 'pointer', display: 'inline-block' }}
                    onClick={e => {
                      e.stopPropagation();
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
                      sx={{ width: 56, height: 56, bgcolor: 'grey.200', mx: 'auto' }}
                    >
                      {!(game.cover || game.photos?.[0] || game.screenshot) && <SportsEsportsIcon />}
                    </Avatar>
                  </span>
                </Tooltip>
              </td>
              <td style={{ padding: '8px' }}>{game.title || game.name}</td>
              <td style={{ padding: '8px' }}>
                {game.alternativeNames && game.alternativeNames.length > 0 && (
                    <Button
                    size="small"
                    variant="outlined"
                    onClick={e => {
                        e.stopPropagation();
                        handleAltNamesClick(e, game.id);
                    }}
                    >
                    {t('games_alternativeNames') || 'Alternative Names'}
                    </Button>
                )}
                {altNamesGameId === game.id && (
                  <Popover
                    open={Boolean(altNamesAnchorEl)}
                    anchorEl={altNamesAnchorEl}
                    onClose={e => {
                        // @ts-ignore
                        e.stopPropagation();
                        handleAltNamesClose();
                    }}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  >
                    <Box sx={{ p: 2, minWidth: 180 }}>
                      {game.alternativeNames.map((name: string, idx: number) => (
                        <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>{name}</Typography>
                      ))}
                    </Box>
                  </Popover>
                )}
              </td>
              {/* Genres cell removed as requested */}
              <td style={{ padding: '8px' }}>{platformStr}</td>
              <td style={{ padding: '8px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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
              </td>
              <td style={{ padding: '8px' }}>{consoleSystemStr}</td>
              <td style={{ padding: '8px', whiteSpace: 'pre-line' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Tooltip title={t('games_completeness') || 'Completeness'}>
                    <InventoryIcon sx={{ color: theme.palette.action.disabled, fontSize: 16 }} />
                  </Tooltip>
                  <span style={{ fontWeight: 400, color: theme.palette.text.disabled, fontSize: '0.95em' }}>
                    {game.completeness
                      ? t(`games_completeness_${game.completeness.toLowerCase()}`)
                      : t('games_none')}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <Tooltip title={t('games_condition') || 'Condition'}>
                    <CheckCircleIcon sx={{ color: theme.palette.action.disabled, fontSize: 16 }} />
                  </Tooltip>
                  <span style={{ fontWeight: 400, color: theme.palette.text.disabled, fontSize: '0.95em' }}>
                    {game.condition
                      ? t(`games_condition_${game.condition.toLowerCase()}`)
                      : t('games_none')}
                  </span>
                </div>
              </td>
              <td style={{ padding: '8px' }}>
                <span style={{ color: theme.palette.text.disabled, fontSize: '0.95em' }}>
                  {game.region
                    ? t(`games_region_${game.region.toLowerCase()}`)
                    : t('games_none')}
                </span>
              </td>
              <td style={{ padding: '8px', textAlign: 'center' }}>
                <Tooltip title={game.completed ? (t('games_completed') || 'Completed') : (t('games_not_completed') || 'Not Completed')}>
                  <span>
                    <IconButton onClick={() => onToggleCompleted(game)} sx={{ fontSize: 22, p: 0.5 }}>
                      <span style={{ fontSize: 22, lineHeight: 1 }}>
                        {game.completed ? '🏆' : '🎖'}
                      </span>
                    </IconButton>
                  </span>
                </Tooltip>
              </td>
              <td style={{ padding: '8px', textAlign: 'center' }}>
                <Tooltip title={game.favorite ? (t('games_favorite') || 'Favorite') : (t('games_not_favorite') || 'Not Favorite')}>
                  <span>
                    <IconButton onClick={() => onToggleFavorite(game)} sx={{ fontSize: 22, p: 0.5 }}>
                      <span style={{ fontSize: 22, lineHeight: 1 }}>
                        {game.favorite ? '❤️' : '🤍'}
                      </span>
                    </IconButton>
                  </span>
                </Tooltip>
              </td>
              <td style={{ padding: '8px'}}>
                <div style={{ display: 'flex', gap: 8 }}>
                <Tooltip title={t('common_edit') || 'Edit'}>
                  <span>
                    <IconButton onClick={e => { e.stopPropagation(); handleEditGame(game); }}>
                      <EditIcon  />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title={t('common_delete') || 'Delete'}>
                  <span>
                    <IconButton color="error" onClick={e => { e.stopPropagation(); handleDeleteGame(game); }} disabled={deletingGameId === game.id}>
                      {deletingGameId === game.id ? <span>...</span> : <DeleteIcon />}
                    </IconButton>
                  </span>
                </Tooltip>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
