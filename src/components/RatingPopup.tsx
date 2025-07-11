import React from "react";
import { Popover, Box, Typography, Button } from "@mui/material";

interface RatingPopupProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  value: number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>, value: number) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export const RatingPopup: React.FC<RatingPopupProps> = ({
  open,
  anchorEl,
  value,
  onChange,
  onClose,
  onSubmit,
}) => {
  // Snap value to nearest step (5) for initial render
  const snappedValue = Math.round(value / 5) * 5;
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
    >
      <Box sx={{ p: 2, minWidth: 220 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Set Rating (1-100)
        </Typography>
        <Box sx={{ px: 1 }}>
          <input
            type="range"
            min={1}
            max={100}
            step={5}
            value={snappedValue}
            onChange={e => onChange(e, Number(e.target.value))}
            style={{ width: "100%" }}
          />
          <Typography variant="body2" sx={{ textAlign: "center", mt: 1 }}>
            {snappedValue}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, gap: 1 }}>
          <Button size="small" onClick={onClose}>
            Cancel
          </Button>
          <Button size="small" variant="contained" onClick={onSubmit}>
            OK
          </Button>
        </Box>
      </Box>
    </Popover>
  );
};
