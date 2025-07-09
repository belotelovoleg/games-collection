import React, { useState, useEffect, useRef } from 'react';
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
  IconButton
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
    consoleId: selectedConsole?.console?.id ? String(selectedConsole.console.id) : '',
    condition: 'GOOD',
    price: '',
    purchaseDate: getToday(),
    notes: '',
    photo: ''
  });

  // Image upload/crop state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropping, setCropping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputFileRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update consoleId when selectedConsole changes
  useEffect(() => {
    if (selectedConsole) {
      setFormData(prev => ({ ...prev, consoleId: selectedConsole.console?.id ? String(selectedConsole.console.id) : '' }));
    }
  }, [selectedConsole]);

  const handleSubmit = async () => {
    if (!formData.consoleId) {
      setError('Console is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      let photoUrl = formData.photo;
      // If a new image is selected and cropped, upload it
      if (selectedImage && croppedAreaPixels) {
        setUploading(true);
        const croppedBlob = await getCroppedImg(selectedImage, croppedAreaPixels, 500);
        const form = new FormData();
        form.append('file', croppedBlob, 'game-photo.jpg');
        form.append('userId', game.userId || '');
        const uploadRes = await fetch('/api/games/upload-photo', { method: 'POST', body: form });
        if (!uploadRes.ok) throw new Error('Failed to upload photo');
        const { url } = await uploadRes.json();
        photoUrl = url;
        setUploading(false);
      }
      const response = await fetch('/api/games/add-to-collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          igdbGameId: game.id,
          consoleId: Number(formData.consoleId),
          condition: formData.condition,
          price: formData.price || null,
          purchaseDate: formData.purchaseDate || null,
          notes: formData.notes || null,
          photo: photoUrl || null,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add game to collection');
      }
      const result = await response.json();
      if (onSuccess) onSuccess(result.game);
      setFormData({
        consoleId: selectedConsole?.console?.id ? String(selectedConsole.console.id) : '',
        condition: 'GOOD',
        price: '',
        purchaseDate: getToday(),
        notes: '',
        photo: ''
      });
      setSelectedImage(null);
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

  if (!game) return null;

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

        {/* Game Info */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
          <Avatar
            src={getGameCoverUrl(game.cover) || undefined}
            variant="rounded"
            sx={{ 
              width: 80, 
              height: 100,
              bgcolor: 'grey.200'
            }}
          >
            <SportsEsportsIcon />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              {game.name}
            </Typography>
            {game.summary && (
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  mb: 1
                }}
              >
                {game.summary}
              </Typography>
            )}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {game.genres?.slice(0, 3).map((genre: any) => (
                <Chip 
                  key={genre.id} 
                  label={genre.name} 
                  size="small" 
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        </Box>

        {/* Photo Upload & Crop */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{t('games_photo') || 'Photo'}</Typography>
          {formData.photo && !selectedImage && (
            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar src={formData.photo} sx={{ width: 80, height: 80 }} />
              <IconButton onClick={() => setFormData(prev => ({ ...prev, photo: '' }))}><DeleteIcon /></IconButton>
            </Box>
          )}
          {!formData.photo && !selectedImage && (
            <Button
              variant="outlined"
              startIcon={<PhotoCameraIcon />}
              onClick={() => inputFileRef.current?.click()}
              disabled={uploading}
            >
              {t('games_uploadPhoto') || 'Upload Photo'}
            </Button>
          )}
          <input
            ref={inputFileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={e => {
              if (e.target.files && e.target.files[0]) {
                setSelectedImage(e.target.files[0]);
                setCropping(true);
              }
            }}
          />
          {selectedImage && cropping && (
            <Box sx={{ position: 'relative', width: 300, height: 300, mt: 2 }}>
              <Cropper
                image={URL.createObjectURL(selectedImage)}
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
                <Button size="small" onClick={() => { setSelectedImage(null); setCropping(false); }}>Cancel</Button>
                <Button size="small" variant="contained" onClick={async () => {
                  setCropping(false);
                  // Save preview (not upload yet)
                  const blob = await getCroppedImg(selectedImage, croppedAreaPixels as any, 500);
                  setFormData(prev => ({ ...prev, photo: URL.createObjectURL(blob) }));
                }}>Crop</Button>
              </Box>
            </Box>
          )}
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
