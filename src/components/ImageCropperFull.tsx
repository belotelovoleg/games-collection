import React, { useState, useRef, useEffect } from 'react';
import { Box, Avatar, Button, Dialog, DialogContent, DialogActions } from '@mui/material';
import Cropper from 'react-easy-crop';

interface ImageCropperFullProps {
  value: string | null;
  onChange: (file: File | null, url: string | null) => void;
  aspect: number;
  cropShape?: 'rect' | 'round';
  cropSize?: number;
  label?: string;
  avatarProps?: any;
  icon?: React.ReactNode;
  accept?: string;
  disabled?: boolean;
  allowDelete?: boolean;
}

const ImageCropperFull: React.FC<ImageCropperFullProps> = ({
  value,
  onChange,
  aspect,
  cropShape = 'rect',
  cropSize = 400,
  label = 'Upload Image',
  avatarProps = {},
  icon = null,
  accept = 'image/*',
  disabled = false,
  allowDelete = false,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [cropping, setCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  // Track the cropper preview blob URL for cleanup
  const cropperPreviewUrlRef = useRef<string | null>(null);

  // Clean up preview blob URL (for the final cropped preview)
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Clean up cropper preview blob URL (for the cropper image preview)
  useEffect(() => {
    return () => {
      if (cropperPreviewUrlRef.current) {
        URL.revokeObjectURL(cropperPreviewUrlRef.current);
        cropperPreviewUrlRef.current = null;
      }
    };
  }, []);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setCropping(true);
    }
  };

  const handleCrop = async () => {
    if (!file || !croppedAreaPixels) return;
    const blob = await getCroppedImg(file, croppedAreaPixels, cropSize);
    const croppedFile = new File([blob], file.name.replace(/\.[^.]+$/, '') + '-cropped.jpg', { type: 'image/jpeg' });
    // Revoke previous previewUrl before setting new one
    setPreviewUrl(prev => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    const url = URL.createObjectURL(croppedFile);
    setPreviewUrl(url);
    onChange(croppedFile, url);
    setCropping(false);
    setFile(null);
  };

  const handleCancel = () => {
    setCropping(false);
    setFile(null);
  };


  // Manage cropper preview URL for the current file
  const [cropperPreviewUrl, setCropperPreviewUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file) {
      if (cropperPreviewUrlRef.current) {
        URL.revokeObjectURL(cropperPreviewUrlRef.current);
        cropperPreviewUrlRef.current = null;
      }
      setCropperPreviewUrl(null);
      return;
    }
    // Clean up previous
    if (cropperPreviewUrlRef.current) {
      URL.revokeObjectURL(cropperPreviewUrlRef.current);
      cropperPreviewUrlRef.current = null;
    }
    const url = URL.createObjectURL(file);
    cropperPreviewUrlRef.current = url;
    setCropperPreviewUrl(url);
    return () => {
      if (cropperPreviewUrlRef.current) {
        URL.revokeObjectURL(cropperPreviewUrlRef.current);
        cropperPreviewUrlRef.current = null;
      }
    };
  }, [file]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2 }}>
      <Avatar
        src={previewUrl || value || undefined}
        {...avatarProps}
      >
        {icon}
      </Avatar>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button size="small" variant="outlined" onClick={() => inputRef.current?.click()} disabled={disabled}>
          {value ? 'Change' : label}
        </Button>
        {allowDelete && value && (
          <Button size="small" color="error" onClick={() => onChange(null, null)} sx={{ minWidth: 0, px: 1 }}>
            ✕
          </Button>
        )}
      </Box>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <Dialog open={cropping && !!file} onClose={handleCancel} maxWidth="xs" fullWidth>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
          {file && cropperPreviewUrl && (
            <Box sx={{ position: 'relative', width: cropSize, height: cropSize }}>
              <Cropper
                image={cropperPreviewUrl}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                cropShape={cropShape}
                showGrid={true}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_c, area) => setCroppedAreaPixels(area)}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button size="small" onClick={handleCancel}>Cancel</Button>
          <Button size="small" variant="contained" onClick={handleCrop}>Crop</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ImageCropperFull;
