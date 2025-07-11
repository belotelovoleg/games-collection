import React from "react";
import ImageGallery from "react-image-gallery";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";

interface PhotoGalleryModalProps {
  open: boolean;
  images: string[];
  startIndex?: number;
  onClose: () => void;
  title?: string;
}

export const PhotoGalleryModal: React.FC<PhotoGalleryModalProps> = ({
  open,
  images,
  startIndex = 0,
  onClose,
  title = "Photos",
}) => {
  const galleryItems = images.map((url) => ({
    original: url,
    thumbnail: url,
  }));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 3, pt: 2 }}>
        <Typography variant="h6">{title}</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Box sx={{ p: 3, minHeight: 400, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {galleryItems.length > 0 ? (
          <ImageGallery
            items={galleryItems}
            startIndex={startIndex}
            showThumbnails={galleryItems.length > 1}
            showPlayButton={false}
            showFullscreenButton={false}
            showBullets={galleryItems.length > 1}
            showNav={galleryItems.length > 1}
            additionalClass="custom-photo-gallery"
          />
        ) : (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <SportsEsportsIcon sx={{ fontSize: 60, color: "text.disabled", mb: 2 }} />
            <Typography variant="body2" color="text.secondary">No photos</Typography>
          </Box>
        )}
      </Box>
    </Dialog>
  );
};
