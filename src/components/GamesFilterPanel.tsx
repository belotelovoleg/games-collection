import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

export interface GamesFilterPanelProps {
  filters: any;
  setFilters: (filters: any) => void;
  allPlatforms: any[];
  allConsoleSystems: any[];
  t: any;
}

export const FILTER_FIELDS = [
  { key: "name", label: "games_filter_title", type: "text" },
  { key: "platform", label: "games_platforms", type: "select" },
  { key: "consoleId", label: "games_console", type: "select" },
  { key: "completed", label: "games_completed", type: "boolean" },
  { key: "favorite", label: "games_favorite", type: "boolean" },
  { key: "region", label: "games_region", type: "select" },
  { key: "labelDamage", label: "games_labelDamage", type: "boolean" },
  { key: "discoloration", label: "games_discoloration", type: "boolean" },
  { key: "rentalSticker", label: "games_rentalSticker", type: "boolean" },
  { key: "testedWorking", label: "games_testedWorking", type: "boolean" },
  { key: "reproduction", label: "games_reproduction", type: "boolean" },
  { key: "steelbook", label: "games_steelbook", type: "boolean" },
  { key: "completeness", label: "games_completeness", type: "select" },
];

export default function GamesFilterPanel({ filters, setFilters, allPlatforms, allConsoleSystems, t }: GamesFilterPanelProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters || {});
  const [quickName, setQuickName] = useState(filters.name || "");

  const handleOpen = () => {
    setLocalFilters(filters || {});
    setDialogOpen(true);
  };
  const handleClose = () => setDialogOpen(false);
  const handleApply = () => {
    setFilters(localFilters);
    setDialogOpen(false);
  };
  const handleChange = (key: string, value: any) => {
    setLocalFilters((prev: any) => ({ ...prev, [key]: value }));
  };
  const handleQuickNameSearch = () => {
    setFilters({ ...filters, name: quickName });
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <TextField
        size="small"
        label={t('games_filter_title') || 'Game Title'}
        value={quickName}
        onChange={e => setQuickName(e.target.value)}
        sx={{ minWidth: 180 }}
      />
      <Button
        variant="outlined"
        size="small"
        onClick={handleQuickNameSearch}
        sx={{ minWidth: 40, px: 1 }}
      >
        <span role="img" aria-label="search">🔍</span>
      </Button>
      <Button variant="outlined" onClick={handleOpen} sx={{ minWidth: 120 }}>
        {t("games_setFilters") || "Set Filters"}
      </Button>
      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{t("games_setFilters") || "Set Filters"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {FILTER_FIELDS.map(field => {
              if (field.type === "text") {
                return (
                  <TextField
                    key={field.key}
                    label={t(field.label) || field.label}
                    value={localFilters[field.key] || ""}
                    onChange={e => handleChange(field.key, e.target.value)}
                    size="small"
                  />
                );
              }
              if (field.type === "select") {
                let options: any[] = [];
                if (field.key === "platform") options = allPlatforms;
                else if (field.key === "consoleId") options = allConsoleSystems;
                else if (field.key === "region") options = ["REGION_FREE", "NTSC_U", "NTSC_J", "PAL"];
                else if (field.key === "completeness") options = ["CIB", "GAME_BOX", "GAME_MANUAL", "LOOSE"];
                return (
                  <FormControl key={field.key} size="small" fullWidth>
                    <InputLabel>{t(field.label) || field.label}</InputLabel>
                    <Select
                      value={localFilters[field.key] || ""}
                      label={t(field.label) || field.label}
                      onChange={e => handleChange(field.key, e.target.value)}
                    >
                      <MenuItem value="">{t("games_none") || "None"}</MenuItem>
                      {options.map(opt => (
                        <MenuItem key={opt.id || opt} value={opt.id || opt}>
                          {opt.name || t(`${field.label}_${String(opt).toLowerCase()}`) || String(opt)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                );
              }
              if (field.type === "boolean") {
                return (
                  <FormGroup key={field.key}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={!!localFilters[field.key]}
                          onChange={e => handleChange(field.key, e.target.checked)}
                        />
                      }
                      label={t(field.label) || field.label}
                    />
                  </FormGroup>
                );
              }
              return null;
            })}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t("common_cancel") || "Cancel"}</Button>
          <Button onClick={handleApply} variant="contained">{t("common_apply") || "Apply"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
