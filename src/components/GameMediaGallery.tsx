import React from "react";
import { Box, Typography, ImageList, ImageListItem, Button } from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";

interface GameMediaGalleryProps {
  images: any[];
  title: string;
  icon: React.ReactNode;
  emptyText: string;
  getImageUrl: (img: any) => string | undefined;
  onOpenGallery: (images: any[]) => void;
  seeAllLabel: string;
  maxPreview?: number;
  badgeCount?: number;
  imageAltPrefix?: string;
}

export const GameMediaGallery: React.FC<GameMediaGalleryProps> = ({
  images,
  title,
  icon,
  emptyText,
  getImageUrl,
  onOpenGallery,
  seeAllLabel,
  maxPreview = 6,
  badgeCount,
  imageAltPrefix = "Image"
}) => {
  if (!images || images.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>{icon}</Box>
        <Typography variant="h6" color="text.secondary">
          {emptyText}
        </Typography>
      </Box>
    );
  }

  // Special case for cover: single image, different layout
  if (badgeCount === 1) {
    const coverUrl = getImageUrl(images[0]);
    return (
      <Box>
        <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {icon}
          {title}
        </Typography>
        <Box sx={{ textAlign: "center" }}>
          <img
            src={coverUrl || "undefined"}
            alt={title}
            onClick={() => onOpenGallery([images[0]])}
            style={{
              maxWidth: "100%",
              maxHeight: "60vh",
              objectFit: "contain",
              borderRadius: 8,
              cursor: "pointer",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              transition: "transform 0.2s ease-in-out"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "scale(1.02)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {seeAllLabel}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {icon}
        {title} ({images.length})
      </Typography>
      <ImageList
        variant="standard"
        cols={images.length}
        sx={{ display: "flex", flexDirection: "row", overflowX: "auto", gap: 8 }}
      >
        {images.slice(0, maxPreview).map((img: any, index: number) => {
          const url = getImageUrl(img);
          return url ? (
            <ImageListItem
              key={index}
              sx={{
                maxWidth: 120,
                cursor: "pointer",
                borderRadius: 2,
                overflow: "hidden"
              }}
              onClick={() => onOpenGallery(images)}
            >
              <img
                src={url}
                alt={`${imageAltPrefix} ${index + 1}`}
                loading="lazy"
                style={{ borderRadius: 8 }}
              />
            </ImageListItem>
          ) : null;
        })}
      </ImageList>
      {images.length > maxPreview && (
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Button
            variant="outlined"
            onClick={() => onOpenGallery(images)}
            startIcon={<FullscreenIcon />}
          >
            {seeAllLabel} ({images.length} {title.toLowerCase()})
          </Button>
        </Box>
      )}
    </Box>
  );
};
