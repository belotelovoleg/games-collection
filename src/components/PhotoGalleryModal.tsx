import React from "react";
import { useState } from "react";
import { useSwipeable } from "react-swipeable";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import { useTranslations } from "@/hooks/useTranslations";

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
  const { t } = useTranslations();
  const galleryItems = images.map((url) => ({
    original: url || '',
    thumbnail: url || '',
  }));
  const [current, setCurrent] = useState(startIndex);
  const handlePrev = () => setCurrent((prev) => galleryItems.length > 1 ? (prev === 0 ? galleryItems.length - 1 : prev - 1) : 0);
  const handleNext = () => setCurrent((prev) => galleryItems.length > 1 ? (prev === galleryItems.length - 1 ? 0 : prev + 1) : 0);
  const handleThumbClick = (idx: number) => setCurrent(idx);
  // Ensure current index is always valid
  React.useEffect(() => {
    if (galleryItems.length === 1) setCurrent(0);
    else if (current >= galleryItems.length) setCurrent(0);
  }, [galleryItems.length, current]);
  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrev,
    trackMouse: true,
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 3, pt: 2 }}>
        <Typography variant="h6">{title}</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Box sx={{ p: 3, minHeight: 400, display: "flex", flexDirection: "column", alignItems: "center", width: '100%' }}>
        {galleryItems.length > 0 ? (
          <Box {...swipeHandlers} sx={{ width: '100%', maxWidth: { xs: '100%', sm: '100%', md: '900px', lg: '1200px' }, mx: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: { xs: 220, sm: 320, md: 400 }, height: '70vh' }}>
            <Box sx={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: { xs: 220, sm: 320, md: 400 }, height: '70vh' }}>
              {galleryItems.length > 1 && (
                <IconButton onClick={handlePrev} sx={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 2, bgcolor: 'background.paper', opacity: 0.7, width: 48, height: 48, borderRadius: '50%' }}>
                  {'<'}
                </IconButton>
              )}
              <Box sx={{ width: { xs: '100%', sm: '80%', md: '70%' }, maxHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {galleryItems[current] && (
                  <img src={galleryItems[current].original} alt={`Photo ${current + 1}`} style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 8 }} />
                )}
              </Box>
              {galleryItems.length > 1 && (
                <IconButton onClick={handleNext} sx={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 2, bgcolor: 'background.paper', opacity: 0.7, width: 48, height: 48, borderRadius: '50%' }}>
                  {'>'}
                </IconButton>
              )}
            </Box>
            {/* Dots */}
            {/* Dots removed, thumbnails below */}
            {/* Thumbnails */}
            {galleryItems.length > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, gap: 1, flexWrap: 'wrap' }}>
                {galleryItems.map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{ border: idx === current ? '2px solid' : '1px solid', borderColor: idx === current ? 'primary.main' : 'grey.300', borderRadius: 2, p: 0.5, cursor: 'pointer', opacity: idx === current ? 1 : 0.7, transition: 'all 0.2s', bgcolor: 'background.paper' }}
                    onClick={() => handleThumbClick(idx)}
                  >
                    <img src={item.thumbnail} alt={`Thumbnail ${idx + 1}`} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }} />
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <SportsEsportsIcon sx={{ fontSize: 60, color: "text.disabled", mb: 2 }} />
            <Typography variant="body2" color="text.secondary">{t("games_noPhotos")}</Typography>
          </Box>
        )}
      </Box>
    </Dialog>
  );
};
