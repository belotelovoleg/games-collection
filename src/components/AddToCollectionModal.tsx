import React, { useState, useEffect, useRef } from 'react';
import { uploadImageToS3 } from '../utils/s3Uploader';
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
  Checkbox
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
  });
  // Cover and screenshot upload state
  const [cover, setCover] = useState<string | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverCrop, setCoverCrop] = useState({ x: 0, y: 0 });
  const [coverZoom, setCoverZoom] = useState(1);
  const [coverCroppedAreaPixels, setCoverCroppedAreaPixels] = useState<any>(null);
  const [coverCropping, setCoverCropping] = useState(false);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotPreviewUrl, setScreenshotPreviewUrl] = useState<string | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotCrop, setScreenshotCrop] = useState({ x: 0, y: 0 });
  const [screenshotZoom, setScreenshotZoom] = useState(1);
  const [screenshotCroppedAreaPixels, setScreenshotCroppedAreaPixels] = useState<any>(null);
  const [screenshotCropping, setScreenshotCropping] = useState(false);
  const screenshotInputRef = useRef<HTMLInputElement | null>(null);
  // Support up to 5 photos
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null, null, null]);
  const [selectedImages, setSelectedImages] = useState<(File | null)[]>([null, null, null, null, null]);
  const [croppingIndex, setCroppingIndex] = useState<number | null>(null);

  // Image upload/crop state (per slot)
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const inputFileRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

    // Clean up cover preview blob URLs
  useEffect(() => {
    if (coverFile) {
      const url = URL.createObjectURL(coverFile);
      setCoverPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setCoverPreviewUrl(null);
    }
  }, [coverFile]);

  // Clean up screenshot preview blob URLs
  useEffect(() => {
    if (screenshotFile) {
      const url = URL.createObjectURL(screenshotFile);
      setScreenshotPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setScreenshotPreviewUrl(null);
    }
  }, [screenshotFile]);

  // Update form fields when editing or selectedConsole changes
  useEffect(() => {
    if (selectedConsole) {
      setFormData(prev => ({ ...prev, consoleId: selectedConsole.console?.id ? String(selectedConsole.console.id) : '' }));
    }
  }, [selectedConsole]);

  useEffect(() => {
    // If editing or manual add, prefill fields
    if (game && (!game.igdbGameId || game.id)) {
      setFormData(prev => ({
        ...prev,
        title: game.title || game.name || '',
        summary: game.summary || '',
        completed: !!game.completed,
        favorite: !!game.favorite,
      }));
      setCover(game.cover || null);
      setScreenshot(game.screenshot || null);
    } else if (!game) {
      setFormData(prev => ({ ...prev, title: '', summary: '', completed: false, favorite: false }));
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
        consoleId: Number(formData.consoleId),
        condition: formData.condition,
        price: formData.price || null,
        purchaseDate: formData.purchaseDate || null,
        notes: formData.notes || null,
      };
      let response;


      // --- CREATE GAME FIRST (no cover/screenshot upload yet) ---
      if (game && game.id) {
        payload.igdbGameId = game.id;
        response = await fetch('/api/games/add-to-collection', {
          method: 'POST',
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
        let blob: Blob;
        if (coverCroppedAreaPixels) {
          blob = await getCroppedImg(coverFile, coverCroppedAreaPixels, 400);
        } else {
          blob = coverFile as Blob;
        }
        const fileToUpload = blob instanceof File ? blob : new File([blob], 'cover.jpg', { type: blob.type || 'image/jpeg' });
        coverUrl = await uploadImageToS3({
          file: fileToUpload,
          userId: newGame.userId,
          gameId: newGame.id,
          filename: 'cover.jpg',
        });
      }

      // --- WORKING, photo-like logic for screenshot ---
      let screenshotUrl = null;
      if (screenshotFile && screenshot) {
        setUploading(true);
        let blob: Blob;
        if (screenshotCroppedAreaPixels) {
          blob = await getCroppedImg(screenshotFile, screenshotCroppedAreaPixels, 400);
        } else {
          blob = screenshotFile as Blob;
        }
        const fileToUpload = blob instanceof File ? blob : new File([blob], 'screenshot.jpg', { type: blob.type || 'image/jpeg' });
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
        if (selectedImages[i]) {
          setUploading(true);
          // Crop if needed (assume croppedAreaPixels is set for the current slot)
          let blob: Blob;
          if (croppingIndex === i && croppedAreaPixels) {
            blob = await getCroppedImg(selectedImages[i] as File, croppedAreaPixels, 500);
          } else {
            blob = selectedImages[i] as Blob;
          }
          // Always wrap as File for upload
          const fileToUpload = blob instanceof File ? blob : new File([blob], `game-photo_${i + 1}.jpg`, { type: blob.type || 'image/jpeg' });
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
      });
      setPhotos([null, null, null, null, null]);
      setSelectedImages([null, null, null, null, null]);
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

  // Cropper helpers
  const onCropComplete = (_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  // Utility to crop and return a blob
  async function getCroppedImg(file: File, crop: { x: number; y: number; width: number; height: number }, size: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const image = new window.Image();
      const url = URL.createObjectURL(file);
      image.src = url;
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('No canvas context'));
        ctx.drawImage(
          image,
          crop.x,
          crop.y,
          crop.width,
          crop.height,
          0,
          0,
          size,
          size
        );
        canvas.toBlob(blob => {
          URL.revokeObjectURL(url);
          if (!blob) return reject(new Error('Failed to crop image'));
          resolve(blob);
        }, 'image/jpeg', 0.95);
      };
      image.onerror = reject;
    });
  }

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
          {t("games_addToCollection")}
        </Box>
        <Button onClick={onClose} size="small" sx={{ minWidth: 'auto' }}>
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Game Info (manual add/edit only) */}
        {(!game || !game.igdbGameId || game.id) && (
          <Box sx={{ display: 'flex', gap: 2, mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
            {/* Cover uploader/cropper */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2 }}>
              <Avatar
                src={coverPreviewUrl || cover || undefined}
                variant="rounded"
                sx={{ width: 80, height: 100, bgcolor: 'grey.200', mb: 1 }}
              >
                <SportsEsportsIcon />
              </Avatar>
              <Button size="small" variant="outlined" onClick={() => coverInputRef.current?.click()}>{cover ? 'Change Cover' : 'Upload Cover'}</Button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setCoverFile(e.target.files[0]);
                    setCoverCropping(true);
                  }
                }}
              />
              {coverCropping && coverFile && (
                <Box sx={{ position: 'relative', width: 200, height: 250, mt: 2 }}>
                  <Cropper
                    image={coverPreviewUrl!}
                    crop={coverCrop}
                    zoom={coverZoom}
                    aspect={0.8}
                    cropShape="rect"
                    showGrid={true}
                    onCropChange={setCoverCrop}
                    onZoomChange={setCoverZoom}
                    onCropComplete={(_c, area) => setCoverCroppedAreaPixels(area)}
                  />
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Button size="small" onClick={() => { setCoverFile(null); setCoverCropping(false); }}>Cancel</Button>
                    <Button size="small" variant="contained" onClick={async () => {
                      setCoverCropping(false);
                      const blob = await getCroppedImg(coverFile, coverCroppedAreaPixels, 400);
                      const file = new File([blob], 'cover.jpg', { type: 'image/jpeg' });
                      const url = URL.createObjectURL(file);
                      setCover(url);
                      setCoverFile(file);
                    }}>Crop</Button>
                  </Box>
                </Box>
              )}
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                label={t('games_title') || 'Title'}
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label={t('games_summary') || 'Summary'}
                value={formData.summary}
                onChange={e => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                multiline
                rows={2}
                sx={{ mb: 2 }}
              />
              {/* Screenshot uploader/cropper */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Screenshot</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar src={screenshotPreviewUrl || screenshot || undefined} variant="rounded" sx={{ width: 80, height: 80, bgcolor: 'grey.200' }}>
                    <SportsEsportsIcon />
                  </Avatar>
                  <Button size="small" variant="outlined" onClick={() => screenshotInputRef.current?.click()}>{screenshot ? 'Change Screenshot' : 'Upload Screenshot'}</Button>
                  <input
                    ref={screenshotInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setScreenshotFile(e.target.files[0]);
                        setScreenshotCropping(true);
                      }
                    }}
                  />
                </Box>
                {screenshotCropping && screenshotFile && (
                  <Box sx={{ position: 'relative', width: 200, height: 200, mt: 2 }}>
                    <Cropper
                      image={screenshotPreviewUrl!}
                      crop={screenshotCrop}
                      zoom={screenshotZoom}
                      aspect={1}
                      cropShape="rect"
                      showGrid={true}
                      onCropChange={setScreenshotCrop}
                      onZoomChange={setScreenshotZoom}
                      onCropComplete={(_c, area) => setScreenshotCroppedAreaPixels(area)}
                    />
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Button size="small" onClick={() => { setScreenshotFile(null); setScreenshotCropping(false); }}>Cancel</Button>
                      <Button size="small" variant="contained" onClick={async () => {
                        setScreenshotCropping(false);
                        const blob = await getCroppedImg(screenshotFile, screenshotCroppedAreaPixels, 400);
                        const file = new File([blob], 'screenshot.jpg', { type: 'image/jpeg' });
                        const url = URL.createObjectURL(file);
                        setScreenshot(url);
                        setScreenshotFile(file);
                      }}>Crop</Button>
                    </Box>
                  </Box>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControlLabel
                  control={<Checkbox checked={formData.completed} onChange={e => setFormData(prev => ({ ...prev, completed: e.target.checked }))} />}
                  label={t('games_completed') || 'Completed'}
                />
                <FormControlLabel
                  control={<Checkbox checked={formData.favorite} onChange={e => setFormData(prev => ({ ...prev, favorite: e.target.checked }))} />}
                  label={t('games_favorite') || 'Favorite'}
                />
              </Box>
            </Box>
          </Box>
        )}

        {/* Multi-Photo Upload & Crop */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{t('games_photos') || 'Photos (up to 5)'}</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {photos.map((photo, idx) => (
              <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {photo ? (
                  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar src={photo} sx={{ width: 80, height: 80 }} />
                    <IconButton onClick={() => {
                      const newPhotos = [...photos];
                      newPhotos[idx] = null;
                      setPhotos(newPhotos);
                      const newSelected = [...selectedImages];
                      newSelected[idx] = null;
                      setSelectedImages(newSelected);
                    }}><DeleteIcon /></IconButton>
                  </Box>
                ) : (
                  <Button
                    variant="outlined"
                    startIcon={<PhotoCameraIcon />}
                    onClick={() => inputFileRefs.current[idx]?.click()}
                    disabled={uploading}
                  >
                    {t('games_uploadPhoto') || 'Upload Photo'}
                  </Button>
                )}
                <input
                  ref={(el) => {
                    inputFileRefs.current[idx] = el;
                  }}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      const newSelected = [...selectedImages];
                      newSelected[idx] = file;
                      setSelectedImages(newSelected);
                      setCroppingIndex(idx);
                    }
                  }}
                />
                {/* Cropper for this slot */}
                {croppingIndex === idx && selectedImages[idx] && (
                  <Box sx={{ position: 'relative', width: 300, height: 300, mt: 2 }}>
                    <Cropper
                      image={URL.createObjectURL(selectedImages[idx]!)}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      cropShape="rect"
                      showGrid={true}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                    />
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Button size="small" onClick={() => { 
                        const newSelected = [...selectedImages];
                        newSelected[idx] = null;
                        setSelectedImages(newSelected);
                        setCroppingIndex(null);
                      }}>Cancel</Button>
                      <Button size="small" variant="contained" onClick={async () => {
                        setCroppingIndex(null);
                        // Save preview (not upload yet)
                        const blob = await getCroppedImg(selectedImages[idx]!, croppedAreaPixels as any, 500);
                        const url = URL.createObjectURL(blob);
                        const newPhotos = [...photos];
                        newPhotos[idx] = url;
                        setPhotos(newPhotos);
                        const newSelected = [...selectedImages];
                        newSelected[idx] = blob as any as File;
                        setSelectedImages(newSelected);
                      }}>Crop</Button>
                    </Box>
                  </Box>
                )}
              </Box>
            ))}
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

      <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose} disabled={loading}>
          {t("common_cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.consoleId}
          startIcon={loading ? <CircularProgress size={16} /> : <AddCircleIcon />}
        >
          {loading ? 'Adding...' : t("games_addToCollection")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
