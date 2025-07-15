import React, { useState, useEffect, useRef } from 'react';
import { uploadImageToS3 } from '../utils/s3Uploader';
import ImageCropperFull from './ImageCropperFull';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Slider,
  Backdrop,
} from '@mui/material';
import AdvancedGameFieldsAccordion, { AdvancedFields } from './AdvancedGameFieldsAccordion';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslations } from '@/hooks/useTranslations';

interface AddToCollectionModalProps {
  open: boolean;
  onClose: () => void;
  game: any;
  selectedConsole?: any;
  userConsoles?: any[]; // Array of user's consoles
  onSuccess?: (game: any) => void;
  mode?: 'create' | 'edit' | 'igdb'; // NEW: mode prop
}

export default function AddToCollectionModal({ 
  open, 
  onClose, 
  game,
  selectedConsole,
  userConsoles = [],
  onSuccess,
  mode = 'create', // default to create
}: AddToCollectionModalProps) {
  const { t } = useTranslations();
  
  // Helper to get today's date in yyyy-mm-dd format
  const getToday = () => {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    consoleId: selectedConsole?.console?.id ? String(selectedConsole.console.id) : '',
    condition: 'MINT',
    completeness: 'CIB',
    region: 'REGION_FREE',
    labelDamage: false,
    discoloration: false,
    rentalSticker: false,
    testedWorking: true,
    reproduction: false,
    steelbook: false,
    price: '',
    purchaseDate: getToday(),
    notes: '',
    completed: false,
    favorite: false,
    rating: 50,
  });
  // Cover, screenshot, and photos state (all use ImageCropperFull now)
  const [cover, setCover] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null, null, null]);
  const [photoFiles, setPhotoFiles] = useState<(File | null)[]>([null, null, null, null, null]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

    // Advanced fields state (edit mode only)
  const [advancedFields, setAdvancedFields] = useState<AdvancedFields>({
    alternativeNames: game?.alternativeNames || [],
    genres: game?.genres || [],
    franchises: game?.franchises || [],
    platforms: game?.platforms || [],
    developer: game?.developer || [],
    publisher: game?.publisher || [],
    releaseYear: game?.releaseYear || null,
  });
  const [genreOptions, setGenreOptions] = useState<string[]>([]);
  const [platformOptions, setPlatformOptions] = useState<{id: number, name: string}[]>([]);
  const [loadingGenres, setLoadingGenres] = useState(false);
  const [loadingPlatforms, setLoadingPlatforms] = useState(false);

  // Update form fields when editing or selectedConsole changes
  // Only update consoleId from selectedConsole if not editing an existing game
  useEffect(() => {
    if (selectedConsole && !(game && game.id)) {
      setFormData(prev => ({ ...prev, consoleId: selectedConsole.console?.id ? String(selectedConsole.console.id) : '' }));
    }
  }, [selectedConsole, game]);

  useEffect(() => {
    // If editing or manual add, prefill fields
    if (game && (!game.igdbGameId || game.id)) {
      setFormData(prev => ({
        ...prev,
        title: game.title || game.name || '',
        summary: game.summary || '',
        completed: !!game.completed,
        favorite: !!game.favorite,
        rating: typeof game.rating === 'number' ? game.rating : 50,
        consoleId: game.consoleIds && game.consoleIds.length > 0 ? String(game.consoleIds[0]) : prev.consoleId,
        // Patch: load booleans from game object
        labelDamage: !!game.labelDamage,
        discoloration: !!game.discoloration,
        rentalSticker: !!game.rentalSticker,
        testedWorking: !!game.testedWorking,
        reproduction: !!game.reproduction,
        steelbook: !!game.steelbook,
        // Patch: load missing fields from game object
        condition: game.condition || prev.condition,
        completeness: game.completeness || prev.completeness,
        region: game.region || prev.region,
        price: game.price !== undefined && game.price !== null ? String(game.price) : prev.price,
        purchaseDate: game.purchaseDate ? game.purchaseDate.slice(0, 10) : prev.purchaseDate,
        notes: game.notes || prev.notes,
      }));
      setAdvancedFields(prev => ({
        ...prev,
        alternativeNames: game.alternativeNames || [],
        genres: game.genres || [],
        franchises: game.franchises || [],
        platforms: game.platforms || [],
        developer: game.developer || [],
        publisher: game.publisher || [],
        releaseYear: game.releaseYear || null,
      }));
      setCover(game.cover || null);
      setScreenshot(game.screenshot || null);
      // Prefill photos array in edit mode
      if (Array.isArray(game.photos) && game.photos.length > 0) {
        // Fill up to 5 slots, pad with nulls if needed
        const filledPhotos = [...game.photos];
        while (filledPhotos.length < 5) filledPhotos.push(null);
        setPhotos(filledPhotos.slice(0, 5));
        setPhotoFiles([null, null, null, null, null]); // No files for prefilled URLs
      } else {
        setPhotos([null, null, null, null, null]);
        setPhotoFiles([null, null, null, null, null]);
      }

      setLoadingGenres(true);
      fetch('/api/genres')
        .then(res => res.json())
        .then(data => setGenreOptions(data.map((g: any) => g.name)))
        .finally(() => setLoadingGenres(false));
      setLoadingPlatforms(true);
      fetch('/api/platforms')
        .then(res => res.json())
        .then(data => setPlatformOptions(data.map((p: any) => ({ id: p.id, name: p.name }))))
        .finally(() => setLoadingPlatforms(false));

    } else if (!game) {
      setFormData(prev => ({ ...prev, title: '', summary: '', completed: false, favorite: false, rating: 50 }));
      setAdvancedFields({
        alternativeNames: [],
        genres: [],
        franchises: [],
        platforms: [],
        developer: [],
        publisher: [],
        releaseYear: null,
      });
      setCover(null);
      setScreenshot(null);
      setPhotos([null, null, null, null, null]);
      setPhotoFiles([null, null, null, null, null]);
    }
  }, [game]);


  const handleSubmit = async () => {
    if (!formData.consoleId) {
      setError('Console is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      let response;
      let newGame;
      // --- MODE: EDIT ---
      if (mode === 'edit') {
        // ...existing code for edit...
        const payload: any = {
          ...formData,
          ...advancedFields,
          consoleId: Number(formData.consoleId),
          price: formData.price || null,
          purchaseDate: formData.purchaseDate || null,
          notes: formData.notes || null,
          // Ensure booleans are sent as booleans
          labelDamage: !!formData.labelDamage,
          discoloration: !!formData.discoloration,
          rentalSticker: !!formData.rentalSticker,
          testedWorking: !!formData.testedWorking,
          reproduction: !!formData.reproduction,
          steelbook: !!formData.steelbook,
        };
        response = await fetch(`/api/games/${game.id}/edit`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to edit game');
        }
        const result = await response.json();
        newGame = result.game;
      }
      // --- MODE: CREATE ---
      else if (mode === 'create') {
        // ...existing code for create...
        const payload: any = {
          title: formData.title,
          summary: formData.summary,
          completed: formData.completed,
          favorite: formData.favorite,
          rating: formData.rating,
          consoleId: Number(formData.consoleId),
          condition: formData.condition,
          price: formData.price || null,
          purchaseDate: formData.purchaseDate || null,
          notes: formData.notes || null,
          photos: photos.filter(Boolean),
        };
        response = await fetch('/api/games/create-manual', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to add game to collection');
        }
        const result = await response.json();
        newGame = result.game;
      }
      // --- MODE: IGDB ---
      else if (mode === 'igdb') {
        // IGDB add-to-collection logic
        if (!game || !game.id) throw new Error('No game to add to collection');
        // 1. Add the game to collection (creates the game in DB)
        response = await fetch('/api/games/add-to-collection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            igdbGameId: game.id,
            consoleId: formData.consoleId,
            condition: formData.condition,
            completeness: formData.completeness,
            region: formData.region,
            labelDamage: !!formData.labelDamage,
            discoloration: !!formData.discoloration,
            rentalSticker: !!formData.rentalSticker,
            testedWorking: !!formData.testedWorking,
            reproduction: !!formData.reproduction,
            steelbook: !!formData.steelbook,
            price: formData.price || null,
            purchaseDate: formData.purchaseDate || null,
            notes: formData.notes || null,
          }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to add game to collection');
        }
        const result = await response.json();
        newGame = result.game;
      }

      // --- UPLOAD COVER AND SCREENSHOT (if present) after game is created ---
      let coverUrl = null;
      let screenshotUrl = null;
      if (mode !== 'igdb') {
        if (coverFile && cover && newGame) {
          setUploading(true);
          if (coverFile instanceof File) {
            coverUrl = await uploadImageToS3({
              file: coverFile,
              userId: newGame.userId,
              gameId: newGame.id,
              filename: 'cover.jpg',
            });
          }
        }

        if (screenshotFile && screenshot && newGame) {
          setUploading(true);
          if (screenshotFile instanceof File) {
            screenshotUrl = await uploadImageToS3({
              file: screenshotFile,
              userId: newGame.userId,
              gameId: newGame.id,
              filename: 'screenshot.jpg',
            });
          }
        }
      }

      // 4. Upload photos to S3 (one by one) using reusable uploader
      let uploadedUrls: string[] = [];
      for (let i = 0; i < 5; i++) {
        if (photoFiles[i] && newGame && photoFiles[i] instanceof File) {
          setUploading(true);
          const url = await uploadImageToS3({
            // @ts-ignore
            file: photoFiles[i],
            userId: newGame.userId,
            gameId: newGame.id,
            photoNumber: i + 1,
            filename: `game-photo_${i + 1}.jpg`,
          });
          uploadedUrls.push(url as any);
        } else if (photos[i]) {
          // Keep existing photo URL if not edited
          uploadedUrls.push(photos[i] as any);
        } else {
          uploadedUrls.push(null as any);
        }
      }
      setUploading(false);

      // 5. PATCH the game with the array of photo URLs, cover, and screenshot
      if (newGame) {
        const validUrls = uploadedUrls.filter(Boolean);
        const patchBody: any = {};
        if (validUrls.length > 0) patchBody.photos = validUrls;
        // Only patch cover and screenshot if not IGDB mode
        if (mode !== 'igdb') {
          if (coverUrl) patchBody.cover = coverUrl;
          if (screenshotUrl) patchBody.screenshot = screenshotUrl;
        }
        if (Object.keys(patchBody).length > 0) {
          await fetch(`/api/games/${newGame.id}/photos`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patchBody),
          });
        }
      }

      if (onSuccess && newGame) onSuccess(newGame);


      setFormData({
        title: '',
        summary: '',
        consoleId: selectedConsole?.console?.id ? String(selectedConsole.console.id) : '',
        condition: 'MINT',
        completeness: 'CIB',
        region: 'REGION_FREE',
        labelDamage: false,
        discoloration: false,
        rentalSticker: false,
        testedWorking: true,
        reproduction: false,
        steelbook: false,
        price: '',
        purchaseDate: getToday(),
        notes: '',
        completed: false,
        favorite: false,
        rating: 50,
      });
      setPhotos([null, null, null, null, null]);
      setPhotoFiles([null, null, null, null, null]);
      setCover(null);
      setCoverFile(null);
      setScreenshot(null);
      setScreenshotFile(null);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add game to collection');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  // Debug logging removed

  // Clear error when modal is opened
  useEffect(() => {
    if (open) setError('');
  }, [open]);

  // Allow modal to open for three cases:
  // 1. Adding new game manually (game is null or empty object)
  // 2. Editing existing game (game has id)
  // 3. Adding from IGDB (game has IGDB data)
  const isEmptyGame = !game || (Object.keys(game).length === 0 && game.constructor === Object);
  // Only block modal if open is false
  if (!open) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            width: '100%',
            maxWidth: { xs: '100vw', sm: 600, md: 900 },
            m: { xs: 0, sm: 'auto' },
            p: 0,
          }
        }}
      >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AddCircleIcon color="primary" />
          {game && game.id ? `${t("common_edit")}: ${game.title}` : t("games_addToCollection")}
        </Box>
        <Button onClick={onClose} size="small" sx={{ minWidth: 'auto' }}>
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent
        sx={{
          py: { xs: 2, sm: 3 },
          px: { xs: 1, sm: 3 },
          overflowX: 'hidden',
          minWidth: 0,
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Top block: Only for create and edit */}
        {(mode === 'create' || mode === 'edit') && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 2, sm: 2 },
              mb: 3,
              p: { xs: 1, sm: 2 },
              bgcolor: 'background.default',
              borderRadius: 2,
              alignItems: { xs: 'stretch', sm: 'flex-start' },
              minWidth: 0,
            }}
          >
            {/* Text block: Title, Summary, Completed, Favorite, New Fields */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
              <TextField
                fullWidth
                label={t('games_title') || 'Title'}
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
              <TextField
                fullWidth
                label={t('games_summary') || 'Summary'}
                value={formData.summary}
                onChange={e => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                multiline
                rows={4}
                sx={{ minHeight: 120 }}
              />
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'center', sm: 'center' },
                  justifyContent: { xs: 'center', sm: 'flex-start' },
                  width: '100%',
                }}
              >
                <FormControlLabel
                  control={<Checkbox checked={formData.completed} onChange={e => setFormData(prev => ({ ...prev, completed: e.target.checked }))} />}
                  label={<span>{t('games_completed') || 'Completed'} <span style={{ color: '#43A047', fontSize: 18, verticalAlign: 'middle' }}>✓</span></span>}
                />
                <FormControlLabel
                  control={<Checkbox checked={formData.favorite} onChange={e => setFormData(prev => ({ ...prev, favorite: e.target.checked }))} />}
                  label={<span>{t('games_favorite') || 'Favorite'} <span style={{ color: '#E91E63', fontSize: 18, verticalAlign: 'middle' }}>❤</span></span>}
                />
                <Box
                  sx={{
                    flex: 1,
                    ml: { xs: 0, sm: 2 },
                    mt: { xs: 1, sm: 0 },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: { xs: 'center', sm: 'flex-start' },
                    width: { xs: '100%', sm: 'auto' },
                    maxWidth: '100%',
                  }}
                >
                  <Typography variant="body2" sx={{ mb: 0.5, textAlign: { xs: 'center', sm: 'left' } }}>{t('games_rating') || 'Rating'}: <b>{formData.rating}</b></Typography>
                  <Box sx={{ width: { xs: '70%', sm: '80px', md: '80px' }, maxWidth: '100%' }}>
                    <Slider
                      value={formData.rating}
                      min={1}
                      max={100}
                      step={1}
                      onChange={(_, value) => setFormData(prev => ({ ...prev, rating: value as number }))}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'row', sm: 'column' },
                alignItems: 'center',
                gap: 2,
                minWidth: { xs: 0, sm: 120 },
                mt: { xs: 2, sm: 0 },
                justifyContent: { xs: 'center', sm: 'flex-start' },
                flexWrap: { xs: 'wrap', sm: 'nowrap' },
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>{t('games_cover')}</Typography>
                <ImageCropperFull
                  value={cover}
                  onChange={(file: File | null, url: string | null) => { setCover(url); setCoverFile(file); }}
                  label={cover ? t('games_changeCover') : t('games_uploadCover')}
                  aspect={0.8}
                  cropShape="rect"
                  cropSize={500}
                  avatarProps={{ variant: 'rounded', sx: { width: 80, height: 100, bgcolor: 'grey.200', mb: 1 } }}
                  icon={<SportsEsportsIcon />}
                />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>{t('games_screenshot')}</Typography>
                <ImageCropperFull
                  value={screenshot}
                  onChange={(file: File | null, url: string | null) => { setScreenshot(url); setScreenshotFile(file); }}
                  label={screenshot ? t('games_changeScreenshot') : t('games_uploadScreenshot')}
                  aspect={1.33}
                  cropShape="rect"
                  cropSize={500}
                  avatarProps={{ variant: 'rounded', sx: { width: 106, height: 80, bgcolor: 'grey.200', mb: 1 } }}
                  icon={<SportsEsportsIcon />}
                />
              </Box>
            </Box>
          </Box>
        )}


        {/* Multi-Photo Upload & Crop (middle block): Always show */}
        <Box sx={{ mb: 3, minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{t('games_photos')}</Typography>
          <Box sx={{
            display: 'flex',
            gap: 2,
            flexWrap: { xs: 'wrap', sm: 'nowrap' },
            minWidth: 0,
            justifyContent: { xs: 'center', sm: 'flex-start' },
          }}>
            {photos.map((photo, idx) => {
              // Only show the slot if:
              // - it's the first slot
              // - or the previous slot is filled
              // - or this slot is already filled
              if (idx === 0 || photos[idx - 1]) {
                return (
                  <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
                    <ImageCropperFull
                      value={photo}
                      onChange={(file: File | null, url: string | null) => {
                        setPhotos(prev => {
                          const arr = [...prev];
                          arr[idx] = url;
                          return arr;
                        });
                        setPhotoFiles(prev => {
                          const arr = [...prev];
                          arr[idx] = file;
                          return arr;
                        });
                      }}
                      label={photo ? t('games_changePhoto') : t('games_uploadPhoto')}
                      aspect={1.33}
                      cropShape="rect"
                      cropSize={500}
                      avatarProps={{ variant: 'rounded', sx: { width: 106, height: 80, bgcolor: 'grey.200', mb: 1 } }}
                      icon={<PhotoCameraIcon />}
                      allowDelete
                    />
                  </Box>
                );
              }
              return null;
            })}
          </Box>
        </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, minWidth: 0 }}>
               {/* Console Selection */}
              <FormControl fullWidth required>
                <InputLabel>{t('games_console')}</InputLabel>
                <Select
                  value={formData.consoleId}
                  label={t('games_console')}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, consoleId: e.target.value }));
                  }}
                >
                  {userConsoles.map((userConsole) => (
                    <MenuItem key={userConsole.id} value={String(userConsole.console.id)}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                        <span>{userConsole.console.name}</span>
                        <Chip 
                          size="small" 
                          label={userConsole.status === "OWNED" ? t('games_owned') : t('games_wishlist')}
                          color={userConsole.status === "OWNED" ? "success" : "primary"}
                          sx={{ ml: "auto" }}
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {/* Conditions Selection */}
              <FormControl fullWidth>
                <InputLabel>{t("games_condition")}</InputLabel>
                <Select
                  value={formData.condition}
                  label={t("games_condition")}
                  onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                >
                  {['SEALED','MINT','VERY_GOOD', 'GOOD','FAIR','POOR'].map((condition) => (
                    <MenuItem key={condition} value={condition}>
                      {(t as any)(`games_condition_${condition.toLowerCase()}`) || condition}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, minWidth: 0 }}>
              {/* Completeness Selection */}
              <FormControl fullWidth>
                  <InputLabel>{t('games_completeness')}</InputLabel>
                  <Select
                    value={formData.completeness}
                    label={t('games_completeness')}
                    onChange={e => setFormData(prev => ({ ...prev, completeness: e.target.value }))}
                  >
                  {["CIB", "GAME_BOX", "GAME_MANUAL", "LOOSE"].map((val) => (
                    <MenuItem key={val} value={val}>
                      {(t as any)(`games_completeness_${val.toLowerCase()}`) || val}
                    </MenuItem>
                  ))}
                  </Select>
                </FormControl>
                {/* Region Selection */}
                <FormControl fullWidth>
                  <InputLabel>{t('games_region')}</InputLabel>
                  <Select
                    value={formData.region}
                    label={t('games_region')}
                    onChange={e => setFormData(prev => ({ ...prev, region: e.target.value }))}
                  >
                  {["REGION_FREE", "NTSC_U", "NTSC_J", "PAL"].map((val) => (
                    <MenuItem key={val} value={val}>
                      {(t as any)(`games_region_${val.toLowerCase()}`) || val}
                    </MenuItem>
                  ))}
                  </Select>
                </FormControl>
            </Box>

            {/* Booleans Props*/}
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, minWidth: 0 }}> <FormControlLabel
                control={<Checkbox checked={formData.labelDamage} onChange={e => setFormData(prev => ({ ...prev, labelDamage: e.target.checked }))} />}
                label={t('games_labelDamage')}
              />
              <FormControlLabel
                control={<Checkbox checked={formData.discoloration} onChange={e => setFormData(prev => ({ ...prev, discoloration: e.target.checked }))} />}
                label={t('games_discoloration')}
              />
              <FormControlLabel
                control={<Checkbox checked={formData.rentalSticker} onChange={e => setFormData(prev => ({ ...prev, rentalSticker: e.target.checked }))} />}
                label={t('games_rentalSticker')}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, minWidth: 0 }}>
              <FormControlLabel
                control={<Checkbox checked={formData.testedWorking} onChange={e => setFormData(prev => ({ ...prev, testedWorking: e.target.checked }))} />}
                label={t('games_testedWorking')}
              />
              <FormControlLabel
                control={<Checkbox checked={formData.reproduction} onChange={e => setFormData(prev => ({ ...prev, reproduction: e.target.checked }))} />}
                label={t('games_reproduction')}
              />
              <FormControlLabel
                control={<Checkbox checked={formData.steelbook} onChange={e => setFormData(prev => ({ ...prev, steelbook: e.target.checked }))} />}
                label={t('games_steelbook')}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label={t("games_price")}
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                InputProps={{
                  startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>$</Typography>,
                }}
                sx={{ minWidth: 0 }}
              />

              <TextField
                fullWidth
                label={t('games_purchaseDate')}
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ minWidth: 0 }}
              />
            </Box>

            <TextField
              fullWidth
              label={t("games_notes")}
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder={t('games_notes_placeholder')}
              sx={{ minWidth: 0 }}
            />

            {/* Advanced Edit Block (edit mode only) */}
            {mode === 'edit' && (
              <>
              <AdvancedGameFieldsAccordion
                value={advancedFields}
                onChange={setAdvancedFields}
                genreOptions={genreOptions}
                platformOptions={platformOptions}
                loadingGenres={loadingGenres}
                loadingPlatforms={loadingPlatforms}
              />
              </>
            )}
          </Box>
      </DialogContent>

      <DialogActions sx={{ px: { xs: 1, sm: 3 }, py: 2, borderTop: 1, borderColor: 'divider', flexWrap: 'wrap', gap: 1, minWidth: 0 }}>
        <Button onClick={onClose} disabled={loading}>
          {t("common_cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.consoleId}
          startIcon={loading ? <CircularProgress size={16} /> : <AddCircleIcon />}
        >
          {mode === 'edit'
            ? (loading ? t('common_saving') : t('common_save'))
            : (loading ? t('common_adding') : t('games_addToCollection'))}
        </Button>
      </DialogActions>
      </Dialog>
      <Backdrop open={uploading} sx={{ zIndex: (theme) => theme.zIndex.modal + 1, color: '#fff' }}>
        <CircularProgress color="inherit" />
        <Typography sx={{ ml: 2 }}>{(t as any)('games_uploading') || 'Uploading images...'}</Typography>
      </Backdrop>
    </>
  );
}
