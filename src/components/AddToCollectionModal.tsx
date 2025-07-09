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
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  FormControlLabel,
  Checkbox,
  Slider
} from '@mui/material';
import Cropper from 'react-easy-crop';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
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
}

const CONDITIONS = [
  'MINT',
  'EXCELLENT', 
  'GOOD',
  'FAIR',
  'POOR'
];

export default function AddToCollectionModal({ 
  open, 
  onClose, 
  game,
  selectedConsole,
  userConsoles = [],
  onSuccess 
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
    condition: 'GOOD',
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

  const inputFileRefs = useRef<(HTMLInputElement | null)[]>([]);

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
      }));
      setCover(game.cover || null);
      setScreenshot(game.screenshot || null);
    } else if (!game) {
      setFormData(prev => ({ ...prev, title: '', summary: '', completed: false, favorite: false, rating: 50 }));
      setCover(null);
      setScreenshot(null);
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
      // 1. Create the game first
      // Only include igdbGameId if game exists and has id (IGDB add)
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
      };
      let response;


      // --- CREATE OR EDIT GAME FIRST (no cover/screenshot upload yet) ---
      if (game && game.id) {
        // Editing existing game
        response = await fetch(`/api/games/${game.id}/edit`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // Manual add: send all fields, including photos (but not cover/screenshot yet)
        payload.photos = photos.filter(Boolean);
        response = await fetch('/api/games/create-manual', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add game to collection');
      }
      const result = await response.json();
      const newGame = result.game;

      // --- UPLOAD COVER AND SCREENSHOT (if present) after game is created ---
      // --- WORKING, photo-like logic for cover ---
      let coverUrl = null;
      if (coverFile && cover) {
        setUploading(true);
        const fileToUpload = coverFile instanceof File ? coverFile : new File([coverFile], 'cover.jpg', { type: coverFile.type || 'image/jpeg' });
        coverUrl = await uploadImageToS3({
          file: fileToUpload,
          userId: newGame.userId,
          gameId: newGame.id,
          filename: 'cover.jpg',
        });
      }

      let screenshotUrl = null;
      if (screenshotFile && screenshot) {
        setUploading(true);
        const fileToUpload = screenshotFile instanceof File ? screenshotFile : new File([screenshotFile], 'screenshot.jpg', { type: screenshotFile.type || 'image/jpeg' });
        screenshotUrl = await uploadImageToS3({
          file: fileToUpload,
          userId: newGame.userId,
          gameId: newGame.id,
          filename: 'screenshot.jpg',
        });
      }

      // 4. Upload photos to S3 (one by one) using reusable uploader
      let uploadedUrls: string[] = [];
      for (let i = 0; i < 5; i++) {
        if (photoFiles[i]) {
          setUploading(true);
          const fileToUpload = photoFiles[i] instanceof File ? photoFiles[i] : new File([photoFiles[i] as Blob], `game-photo_${i + 1}.jpg`, { type: (photoFiles[i] as Blob).type || 'image/jpeg' });
          const url = await uploadImageToS3({
            file: fileToUpload,
            userId: newGame.userId,
            gameId: newGame.id,
            photoNumber: i + 1,
            filename: `game-photo_${i + 1}.jpg`,
          });
          uploadedUrls.push(url as any);
        } else {
          uploadedUrls.push(null as any);
        }
      }
      setUploading(false);

      // 5. PATCH the game with the array of photo URLs, cover, and screenshot
      const validUrls = uploadedUrls.filter(Boolean);
      const patchBody: any = {};
      if (validUrls.length > 0) patchBody.photos = validUrls;
      if (coverUrl) patchBody.cover = coverUrl;
      if (screenshotUrl) patchBody.screenshot = screenshotUrl;
      if (Object.keys(patchBody).length > 0) {
        await fetch(`/api/games/${newGame.id}/photos`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patchBody),
        });
      }

      if (onSuccess) onSuccess(newGame);
      setFormData({
        title: '',
        summary: '',
        consoleId: selectedConsole?.console?.id ? String(selectedConsole.console.id) : '',
        condition: 'GOOD',
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



  const getGameCoverUrl = (cover: any) => {
    if (!cover?.image_id) return null;
    return `https://images.igdb.com/igdb/image/upload/t_cover_big/${cover.image_id}.jpg`;
  };


  // Debug: Log the game data when the modal opens
  useEffect(() => {
    if (open && game) {
      // Log the full game object for inspection
      console.log('[AddToCollectionModal] Game data:', game);
    }
  }, [open, game]);

  // Allow modal to open for three cases:
  // 1. Adding new game manually (game is null or empty object)
  // 2. Editing existing game (game has id)
  // 3. Adding from IGDB (game has IGDB data)
  const isEmptyGame = !game || (Object.keys(game).length === 0 && game.constructor === Object);
  // Only block modal if open is false
  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
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
          {game && game.id ? t("common_edit") : t("games_addToCollection")}
        </Box>
        <Button onClick={onClose} size="small" sx={{ minWidth: 'auto' }}>
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ py: 3, px: { xs: 1, sm: 3 } }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Game Info (manual add/edit only) */}
        {(!game || !game.igdbGameId || game.id) && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              mb: 3,
              p: 2,
              bgcolor: 'background.default',
              borderRadius: 2,
              alignItems: { xs: 'stretch', sm: 'flex-start' },
            }}
          >
            {/* Text block: Title, Summary, Completed, Favorite */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
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
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControlLabel
                  control={<Checkbox checked={formData.completed} onChange={e => setFormData(prev => ({ ...prev, completed: e.target.checked }))} />}
                  label={<span>{t('games_completed') || 'Completed'} <span style={{ color: '#43A047', fontSize: 18, verticalAlign: 'middle' }}>✓</span></span>}
                />
                <FormControlLabel
                  control={<Checkbox checked={formData.favorite} onChange={e => setFormData(prev => ({ ...prev, favorite: e.target.checked }))} />}
                  label={<span>{t('games_favorite') || 'Favorite'} <span style={{ color: '#E91E63', fontSize: 18, verticalAlign: 'middle' }}>❤</span></span>}
                />
                <Box sx={{ flex: 1, ml: 2 }}>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>{t('games_rating') || 'Rating'}: <b>{formData.rating}</b></Typography>
                  <Slider
                    value={formData.rating}
                    min={1}
                    max={100}
                    step={1}
                    onChange={(_, value) => setFormData(prev => ({ ...prev, rating: value as number }))}
                    valueLabelDisplay="auto"
                    sx={{ width: '100px', display: 'inline-block', verticalAlign: 'middle' }}
                  />
                </Box>
              </Box>
            </Box>
            {/* Images block: Cover and Screenshot */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'row', sm: 'column' },
                alignItems: 'center',
                gap: 2,
                minWidth: { xs: '100%', sm: 120 },
                mt: { xs: 2, sm: 0 },
                justifyContent: { xs: 'center', sm: 'flex-start' },
              }}
            >
              <ImageCropperFull
                value={cover}
                onChange={(file: File | null, url: string | null) => { setCover(url); setCoverFile(file); }}
                label={cover ? 'Change Cover' : 'Upload Cover'}
                aspect={0.8}
                cropShape="rect"
                cropSize={400}
                avatarProps={{ variant: 'rounded', sx: { width: 80, height: 100, bgcolor: 'grey.200', mb: 1 } }}
                icon={<SportsEsportsIcon />}
              />
              <ImageCropperFull
                value={screenshot}
                onChange={(file: File | null, url: string | null) => { setScreenshot(url); setScreenshotFile(file); }}
                label={screenshot ? 'Change Screenshot' : 'Upload Screenshot'}
                aspect={1}
                cropShape="rect"
                cropSize={400}
                avatarProps={{ variant: 'rounded', sx: { width: 80, height: 80, bgcolor: 'grey.200', mb: 1 } }}
                icon={<SportsEsportsIcon />}
              />
            </Box>
          </Box>
        )}

        {/* Multi-Photo Upload & Crop (progressive slots) */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{t('games_photos') || 'Photos (up to 5)'}</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {photos.map((photo, idx) => {
              // Only show the slot if:
              // - it's the first slot
              // - or the previous slot is filled
              // - or this slot is already filled
              if (idx === 0 || photos[idx - 1]) {
                return (
                  <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                      label={photo ? 'Change Photo' : 'Upload Photo'}
                      aspect={1}
                      cropShape="rect"
                      cropSize={500}
                      avatarProps={{ variant: 'rounded', sx: { width: 80, height: 80, bgcolor: 'grey.200', mb: 1 } }}
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

        {/* Form Fields */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Console Selection */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Console</InputLabel>
              <Select
                value={formData.consoleId}
                label="Console"
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
                        label={userConsole.status === "OWNED" ? "Owned" : "Wishlist"}
                        color={userConsole.status === "OWNED" ? "success" : "primary"}
                        sx={{ ml: "auto" }}
                      />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>{t("games_condition")}</InputLabel>
              <Select
                value={formData.condition}
                label={t("games_condition")}
                onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
              >
                {CONDITIONS.map((condition) => (
                  <MenuItem key={condition} value={condition}>
                    {condition.charAt(0) + condition.slice(1).toLowerCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
            />

            <TextField
              fullWidth
              label="Purchase Date"
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>

          <TextField
            fullWidth
            label={t("games_notes")}
            multiline
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Any additional notes about this game in your collection..."
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: { xs: 1, sm: 3 }, py: 2, borderTop: 1, borderColor: 'divider', flexWrap: 'wrap', gap: 1 }}>
        <Button onClick={onClose} disabled={loading}>
          {t("common_cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.consoleId}
          startIcon={loading ? <CircularProgress size={16} /> : <AddCircleIcon />}
        >
          {loading ? (game && game.id ? t('common_saving') : t('common_adding')) : (game && game.id ? t('common_save') : t("games_addToCollection"))}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
