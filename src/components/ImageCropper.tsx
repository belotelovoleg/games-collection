import React, { useState, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { Box, Button } from '@mui/material';

interface ImageCropperProps {
  file: File;
  aspect: number;
  cropShape?: 'rect' | 'round';
  initialCrop?: { x: number; y: number };
  initialZoom?: number;
  onCancel: () => void;
  onCrop: (croppedFile: File, previewUrl: string) => void;
  cropSize?: number; // output size in px
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  file,
  aspect,
  cropShape = 'rect',
  initialCrop = { x: 0, y: 0 },
  initialZoom = 1,
  onCancel,
  onCrop,
  cropSize = 400,
}) => {
  const [crop, setCrop] = useState(initialCrop);
  const [zoom, setZoom] = useState(initialZoom);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Create and clean up blob URL for the file
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  // Helper to crop and return a blob
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

  const handleCrop = async () => {
    if (!croppedAreaPixels) return;
    const blob = await getCroppedImg(file, croppedAreaPixels, cropSize);
    const croppedFile = new File([blob], file.name.replace(/\.[^.]+$/, '') + '-cropped.jpg', { type: 'image/jpeg' });
    const previewUrl = URL.createObjectURL(croppedFile);
    onCrop(croppedFile, previewUrl);
  };

  return (
    <Box sx={{ position: 'relative', width: cropSize, height: cropSize, mt: 2 }}>
      {imageUrl && (
        <Cropper
          image={imageUrl}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          cropShape={cropShape}
          showGrid={true}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_c, area) => setCroppedAreaPixels(area)}
        />
      )}
      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <Button size="small" onClick={onCancel}>Cancel</Button>
        <Button size="small" variant="contained" onClick={handleCrop}>Crop</Button>
      </Box>
    </Box>
  );
};

export default ImageCropper;
