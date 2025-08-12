import React, { useEffect, useState } from "react";
import { defaultGameTableColumns, GameTableColumnSetting } from "./gameTableColumns";
import { Avatar, Button, Popover, Box, Typography, Rating, Tooltip, IconButton } from "@mui/material";
import ShieldIcon from '@mui/icons-material/Shield';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects'; // Developer
import BusinessIcon from '@mui/icons-material/Business'; // Publisher
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InventoryIcon from '@mui/icons-material/Inventory';
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import { useTranslations } from "@/hooks/useTranslations";
import { GameLocationDropdown } from "./GameLocationDropdown";

// Helper to render array or comma-separated string columns
function renderArrayColumn(value: string[] | string, minWidth: number, maxWidth: number, showAllLabel: string, t: (key: string) => string) {
  const arr = Array.isArray(value)
    ? value.filter(Boolean)
    : typeof value === 'string'
      ? value.split(',').map((v: string) => v.trim()).filter(Boolean)
      : [];
  if (arr.length === 0) return t('games_none');
  if (arr.length > 3) {
    return (
      <Button size="small" onClick={e => {
        e.stopPropagation();
        alert(arr.join('\n'));
      }}>{showAllLabel}</Button>
    );
  }
  return arr.map((item: string, idx: number) => (
    <Tooltip key={idx} title={item}>
      <span style={{ display: 'block', minWidth, maxWidth, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item}</span>
    </Tooltip>
  ));
}

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
  handleViewGameDetails,
  columns
}: {
  userGames: any[];
  allPlatforms: any[];
  allConsoleSystems: any[];
  theme: any;
  altNamesGameId: string | null;
  altNamesAnchorEl: HTMLElement | null;
  handleAltNamesClick: (e: React.MouseEvent<HTMLElement>, id: string) => void;
  handleAltNamesClose: () => void;
  getGameRating: (game: any) => number;
  deletingGameId: string | null;
  handleEditGame: (game: any) => void;
  handleDeleteGame: (game: any) => void;
  onToggleFavorite: (game: any) => void;
  onToggleCompleted: (game: any) => void;
  onRatingClick: (e: React.MouseEvent<HTMLElement>, game: any) => void;
  openPhotoGallery: (images: string[], idx?: number) => void;
  handleViewGameDetails: (game: any) => void;
  columns: GameTableColumnSetting[];
}) {
  // Local state for userGames to allow inline updates
  const [games, setGames] = useState(userGames);
  // Allow t to accept any string for dynamic translation keys
  const { t } = useTranslations() as { t: (key: string) => string };

  // State for all locations
  const [locations, setLocations] = useState<{ id: string, name: string }[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/user/game-locations')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setLocations(data);
      });
  }, []);

  async function handleSetLocation(gameId: string, gameLocationId: string | null) {
    setUpdatingId(gameId);
    await fetch(`/api/user/games/${gameId}/location`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameLocationId }),
    });
    // Find the location object
    const locationObj = locations.find(l => l.id === gameLocationId) || null;
    setGames(prev => prev.map(g => g.id === gameId ? { ...g, gameLocation: locationObj } : g));
    setUpdatingId(null);
  }
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ background: theme.palette.background.paper, borderBottom: `2px solid ${theme.palette.divider}` }}>
          {columns
            .filter((col: GameTableColumnSetting) => col.visible)
            .sort((a: GameTableColumnSetting, b: GameTableColumnSetting) => a.order - b.order)
            .map((col: GameTableColumnSetting) => {
            // Use translation key: games_<key>
            const translationKey = `games_${col.key}`;
            const translated = t(translationKey);
            // If translation returns the key itself, fallback to col.label
            const isTranslated = translated && translated !== translationKey;
            return (
              <th key={col.key} style={{ padding: '8px', textAlign: 'center', minWidth: col.minWidth, maxWidth: col.maxWidth }}>
                {isTranslated ? translated : col.label}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
  {games.map((game: any) => {
          // ...existing code for row rendering...
          return (
            <tr key={game.id} style={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
              {columns
                .filter((col: GameTableColumnSetting) => col.visible)
                .sort((a: GameTableColumnSetting, b: GameTableColumnSetting) => a.order - b.order)
                .map((col: GameTableColumnSetting) => {
                const cellStyle = { padding: '8px', minWidth: col.minWidth, maxWidth: col.maxWidth };
                switch (col.key) {
                  case 'createdAt':
                    return (
                      <td key={col.key} style={cellStyle}>
                        {game.createdAt ? new Date(game.createdAt).toLocaleDateString() : t('games_none')}
                      </td>
                    );
                  case 'gameLocation':
                    return (
                      <td key={col.key} style={cellStyle}>
                        <GameLocationDropdown
                          value={game.gameLocation?.id || null}
                          locations={locations}
                          onChange={locId => handleSetLocation(game.id, locId)}
                          disabled={updatingId === game.id}
                        />
                      </td>
                    );
                  case 'cover':
                    return (
                      <td key={col.key} style={{ padding: '3px', minWidth: col.minWidth, maxWidth: col.maxWidth }}>
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
                              sx={{ width: 50, height: 67, bgcolor: 'grey.200', mx: 'auto' }}
                            >
                              {!(game.cover || game.photos?.[0] || game.screenshot) && <SportsEsportsIcon />}
                            </Avatar>
                          </span>
                        </Tooltip>
                      </td>
                    );
                  case 'photo':
                    return (
                      <td key={col.key} style={{ padding: '3px', minWidth: col.minWidth, maxWidth: col.maxWidth }}>
                        <Avatar
                          src={game.photos?.[0]}
                          variant="rounded"
                          sx={{ width: 89, height: 67, bgcolor: 'grey.200', mx: 'auto' }}
                        >
                          {!game.photos?.[0] && <SportsEsportsIcon />}
                        </Avatar>
                      </td>
                    );
                  case 'screenshot':
                    return (
                      <td key={col.key} style={{ padding: '3px', minWidth: col.minWidth, maxWidth: col.maxWidth }}>
                        <Avatar
                          src={game.screenshot}
                          variant="rounded"
                          sx={{ width: 89, height: 67, bgcolor: 'grey.200', mx: 'auto' }}
                        >
                          {!game.screenshot && <SportsEsportsIcon />}
                        </Avatar>
                      </td>
                    );
                  case 'title':
                    return (
                      <td key={col.key} style={cellStyle}>
                        <span
                          style={{ cursor: 'pointer', textDecoration: 'underline', color: theme.palette.primary.main, minWidth: col.minWidth, maxWidth: col.maxWidth, display: 'inline-block'}}
                          onClick={() => {
                            if (typeof handleViewGameDetails === 'function') {
                              handleViewGameDetails(game);
                            }
                          }}
                        >
                          {game.title || game.name}
                        </span>
                      </td>
                    );
                  case 'alternativeNames':
                    return (
                      <td key={col.key} style={cellStyle}>
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
                    );
                  case 'production':
                    let developerStr = '';
                    let publisherStr = '';
                    if (Array.isArray(game.developer)) {
                      developerStr = game.developer.filter(Boolean).join(', ');
                    }
                    if (Array.isArray(game.publisher)) {
                      publisherStr = game.publisher.filter(Boolean).join(', ');
                    }
                    return (
                      <td key={col.key} style={cellStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Tooltip title={t('games_developer') || 'Developer'}>
                            <EmojiObjectsIcon sx={{ color: theme.palette.action.disabled, fontSize: 16 }} />
                          </Tooltip>
                          <Tooltip title={developerStr || t('games_none')}>
                            <span style={{ fontWeight: 400, color: theme.palette.text.disabled, fontSize: '0.95em', minWidth: col.minWidth, maxWidth: col.maxWidth, display: 'inline-block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {developerStr || t('games_none')}
                            </span>
                          </Tooltip>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                          <Tooltip title={t('games_publisher') || 'Publisher'}>
                            <BusinessIcon sx={{ color: theme.palette.action.disabled, fontSize: 16 }} />
                          </Tooltip>
                          <Tooltip title={publisherStr || t('games_none')}>
                            <span style={{ fontWeight: 400, color: theme.palette.text.disabled, fontSize: '0.95em', minWidth: col.minWidth, maxWidth: col.maxWidth, display: 'inline-block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {publisherStr || t('games_none')}
                            </span>
                          </Tooltip>
                        </div>
                      </td>
                    );
                  case 'rating':
                    return (
                      <td key={col.key} style={cellStyle}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <span
                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            title="Set rating"
                            onClick={e => onRatingClick(e, game)}
                          >
                            <Rating value={getGameRating(game)} precision={0.1} size="small" readOnly />
                          </span>
                        </Box>
                      </td>
                    );
                  case 'console':
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
                      <td key={col.key} style={cellStyle}>{consoleSystemStr}</td>
                    );
                  case 'condition':
                    const completenessStr = game.completeness
                      ? t(`games_completeness_${game.completeness.toLowerCase()}`)
                      : t('games_none');
                    const conditionStr = game.condition
                      ? t(`games_condition_${game.condition.toLowerCase()}`)
                      : t('games_none');
                    return (
                      <td key={col.key} style={cellStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Tooltip title={t('games_completeness') || 'Completeness'}>
                            <InventoryIcon sx={{ color: theme.palette.action.disabled, fontSize: 16 }} />
                          </Tooltip>
                          <Tooltip title={completenessStr}>
                            <span style={{ fontWeight: 400, color: theme.palette.text.disabled, fontSize: '0.95em', minWidth: col.minWidth, maxWidth: col.maxWidth, display: 'inline-block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {completenessStr}
                            </span>
                          </Tooltip>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                          <Tooltip title={t('games_condition') || 'Condition'}>
                            <CheckCircleIcon sx={{ color: theme.palette.action.disabled, fontSize: 16 }} />
                          </Tooltip>
                          <Tooltip title={conditionStr}>
                            <span style={{ fontWeight: 400, color: theme.palette.text.disabled, fontSize: '0.95em', minWidth: col.minWidth, maxWidth: col.maxWidth, display: 'inline-block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {conditionStr}
                            </span>
                          </Tooltip>
                        </div>
                        {game.steelbook && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                            <Tooltip title={t('games_steelbook') || 'Steelbook'}>
                              <ShieldIcon sx={{ color: theme.palette.action.disabled, fontSize: 16 }} />
                            </Tooltip>
                            <span style={{ fontWeight: 400, color: theme.palette.text.disabled, fontSize: '0.95em' }}>
                              {t('games_steelbook')}
                            </span>
                          </div>
                        )}
                      </td>
                    );
                  case 'region':
                    return (
                      <td key={col.key} style={cellStyle}>
                        <span style={{ color: theme.palette.text.disabled, fontSize: '0.95em' }}>
                          {game.region
                            ? t(`games_region_${game.region.toLowerCase()}`)
                            : t('games_none')}
                        </span>
                      </td>
                    );
                  case 'genres':
                    return (
                      <td key={col.key} style={cellStyle}>
                        {renderArrayColumn(game.genres, col.minWidth, col.maxWidth, t('games_show_all_genres') || 'Show genres', t)}
                      </td>
                    );
                  case 'franchises':
                    return (
                      <td key={col.key} style={cellStyle}>
                        {renderArrayColumn(game.franchises, col.minWidth, col.maxWidth, t('games_show_all_franchises') || 'Show franchises', t)}
                      </td>
                    );
                  case 'multiplayerModes':
                    return (
                      <td key={col.key} style={cellStyle}>
                        {renderArrayColumn(game.multiplayerModes, col.minWidth, col.maxWidth, t('games_show_all_multiplayer_modes') || 'Show modes', t)}
                      </td>
                    );
                  case 'releaseYear':
                    return (
                      <td key={col.key} style={cellStyle}>
                        {game.releaseYear || t('games_none')}
                      </td>
                    );
                  case 'completed':
                    return (
                      <td key={col.key} style={{ ...cellStyle, textAlign: 'center' }}>
                        <Tooltip title={game.completed ? (t('games_completed') || 'Completed') : (t('games_not_completed') || 'Not Completed')}>
                          <span>
                            <IconButton onClick={e => { e.stopPropagation(); onToggleCompleted(game); }} size="large">
                              {game.completed ? (
                                <EmojiEventsIcon/>
                              ) : (
                                <MilitaryTechIcon sx={{ color: theme.palette.action.disabled }} />
                              )}
                            </IconButton>
                          </span>
                        </Tooltip>
                      </td>
                    );
                  case 'favorite':
                    return (
                      <td key={col.key} style={{ ...cellStyle, textAlign: 'center' }}>
                        <Tooltip title={game.favorite ? (t('games_favorite') || 'Favorite') : (t('games_not_favorite') || 'Not Favorite')}>
                          <span>
                            <IconButton onClick={e => { e.stopPropagation(); onToggleFavorite(game); }} size="large">
                              {game.favorite ? (
                                <FavoriteIcon sx={{ color: theme.palette.error.main }} />
                              ) : (
                                <FavoriteBorderIcon sx={{ color: theme.palette.action.disabled }} />
                              )}
                            </IconButton>
                          </span>
                        </Tooltip>
                      </td>
                    );
                  case 'actions':
                    return (
                      <td key={col.key} style={cellStyle}>
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
                    );
                  default:
                    return <td key={col.key} style={cellStyle} />;
                }
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
