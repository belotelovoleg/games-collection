import React, { useState } from "react";
import TuneIcon from '@mui/icons-material/Tune';
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
  Avatar,
} from "@mui/material";

export type GamesFilterPanelProps = {
  filters: any;
  setFilters: (filters: any) => void;
  allPlatforms: any[];
  allConsoleSystems?: any[];
  t: any;
  sortBy: string;
  setSortBy: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (value: 'asc' | 'desc') => void;
};

export const FILTER_FIELDS = [
  { key: "name", label: "games_filter_title", type: "text" },
  { key: "platform", label: "games_platforms", type: "select" },
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

// Reusable sorting controls component
function SortingControls({ sortBy, setSortBy, sortOrder, setSortOrder, t }: {
  sortBy: string;
  setSortBy: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (value: 'asc' | 'desc') => void;
  t: any;
}) {
  return (
    <>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>{t('games_sortBy') || 'Sort by'}</InputLabel>
        <Select
          value={typeof sortBy !== 'undefined' ? sortBy : ''}
          label={t('games_sortBy') || 'Sort by'}
          onChange={e => setSortBy(e.target.value)}
        >
          <MenuItem value="title">{t('games_filter_title') || 'Title'}</MenuItem>
          <MenuItem value="rating">{t('games_rating') || 'Rating'}</MenuItem>
          <MenuItem value="completed">{t('games_completed') || 'Completed'}</MenuItem>
          <MenuItem value="favorite">{t('games_favorite') || 'Favorite'}</MenuItem>
          <MenuItem value="condition">{t('games_condition') || 'Condition'}</MenuItem>
          <MenuItem value="completeness">{t('games_completeness') || 'Completeness'}</MenuItem>
          <MenuItem value="region">{t('games_region') || 'Region'}</MenuItem>
          <MenuItem value="labelDamage">{t('games_labelDamage') || 'Label Damage'}</MenuItem>
          <MenuItem value="discoloration">{t('games_discoloration') || 'Discoloration'}</MenuItem>
          <MenuItem value="rentalSticker">{t('games_rentalSticker') || 'Rental Sticker'}</MenuItem>
          <MenuItem value="testedWorking">{t('games_testedWorking') || 'Tested/Working'}</MenuItem>
          <MenuItem value="reproduction">{t('games_reproduction') || 'Reproduction'}</MenuItem>
          <MenuItem value="steelbook">{t('games_steelbook') || 'Steelbook'}</MenuItem>
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 100 }}>
        <InputLabel>{t('games_sortOrder') || 'Order'}</InputLabel>
        <Select
          value={typeof sortOrder !== 'undefined' ? sortOrder : ''}
          label={t('games_sortOrder') || 'Order'}
          onChange={e => setSortOrder(e.target.value)}
        >
          <MenuItem value="asc">{t('games_sortOrderAscending') || 'Ascending'}</MenuItem>
          <MenuItem value="desc">{t('games_sortOrderDescending') || 'Descending'}</MenuItem>
        </Select>
      </FormControl>
    </>
  );
}

export default function GamesFilterPanel({ filters, setFilters, allPlatforms, t, sortBy, setSortBy, sortOrder, setSortOrder }: GamesFilterPanelProps) {
  // Accept allConsoleSystems prop for future use (fixes warning)
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileSortFilter, setShowMobileSortFilter] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters || {});
  const [quickName, setQuickName] = useState(filters.name || "");

  React.useEffect(() => {
  function handleResize() {
    setIsMobile(window.innerWidth < 600);
  }
  setIsMobile(window.innerWidth < 600);
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Shared dialog for filters
  const filterDialog = (
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          {opt.platformLogo?.url && (
                            <Avatar src={opt.platformLogo.url} alt={opt.name} sx={{ width: 28, height: 28, mr: 1 }} />
                          )}
                          {opt.name || t(`${field.label}_${String(opt).toLowerCase()}`) || String(opt)}
                        </Box>
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
  );

  if (isMobile) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
        <Box>
        <FormControl size="small" sx={{ minWidth: 120, width: '100%' }}>
        <InputLabel>{t('games_platforms') || 'Platform'}</InputLabel>
        <Select
          value={filters.platform || ""}
          label={t('games_platforms') || 'Platform'}
          onChange={e => setFilters({ ...filters, platform: e.target.value })}
        >
          <MenuItem value="">{t('games_none') || 'All'}</MenuItem>
          {allPlatforms.map(opt => (
            <MenuItem key={opt.id || opt} value={opt.id || opt}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {opt.platformLogo?.url && (
                  <Avatar src={opt.platformLogo.url} alt={opt.name} sx={{ width: 28, height: 28, mr: 1 }} />
                )}
                {opt.name || String(opt)}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            size="small"
            label={t('games_filter_title') || 'Game Title'}
            value={quickName}
            onChange={e => setQuickName(e.target.value)}
            sx={{ minWidth: 180, flex: 1 }}
            onKeyDown={e => {
              if (e.key === 'Enter') handleQuickNameSearch();
            }}
          />
          <Button
            variant="outlined"
            size="small"
            onClick={handleQuickNameSearch}
            sx={{ minWidth: 40, px: 1 }}
          >
            <span role="img" aria-label="search">🔍</span>
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setShowMobileSortFilter(v => !v)}
            sx={{ minWidth: 40, px: 1 }}
            title={t('games_sortingFiltering') || 'Sorting and Filtering'}
          >
            <TuneIcon />
          </Button>
          {/* Reset Filters Button: only show if any filter is set */}
          {Object.values(filters).some(v => v !== undefined && v !== "") && (
            <Button
              color="error"
              variant="outlined"
              size="small"
              sx={{ minWidth: 40, px: 1 }}
              title={t('games_resetFilters') || 'Reset Filters'}
              onClick={() => setFilters({
                name: "",
                platform: "",
                consoleId: "",
                completed: "",
                favorite: "",
                region: "",
                labelDamage: "",
                discoloration: "",
                rentalSticker: "",
                testedWorking: "",
                reproduction: "",
                completeness: "",
                steelbook: "",
              })}
            >
              <span role="img" aria-label="reset">🔄</span>
            </Button>
          )}
        </Box>
        {showMobileSortFilter && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <SortingControls
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              t={t}
            />
            <Button variant="outlined" onClick={handleOpen} sx={{ minWidth: 120 }}>
              {t("games_setFilters") || "Set Filters"}
            </Button>
          </Box>
        )}
        {filterDialog}
      </Box>
    );
  }
  // Desktop (unchanged)
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel>{t('games_platforms') || 'Platform'}</InputLabel>
        <Select
          value={filters.platform || ""}
          label={t('games_platforms') || 'Platform'}
          onChange={e => setFilters({ ...filters, platform: e.target.value })}
        >
          <MenuItem value="">{t('games_none') || 'All'}</MenuItem>
          {allPlatforms.map(opt => (
            <MenuItem key={opt.id || opt} value={opt.id || opt}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {opt.platformLogo?.url && (
                  <Avatar src={opt.platformLogo.url} alt={opt.name} sx={{ width: 28, height: 28, mr: 1 }} />
                )}
                {opt.name || String(opt)}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        size="small"
        label={t('games_filter_title') || 'Game Title'}
        value={quickName}
        onChange={e => setQuickName(e.target.value)}
        sx={{ minWidth: 180 }}
        onKeyDown={e => {
          if (e.key === 'Enter') handleQuickNameSearch();
        }}
      />
      <Button
        variant="outlined"
        size="small"
        onClick={handleQuickNameSearch}
        sx={{ minWidth: 40, px: 1 }}
      >
        <span role="img" aria-label="search">🔍</span>
      </Button>
      {/* Sorting controls */}
      <SortingControls
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        t={t}
      />
      {/* ...existing code... */}
      <Button variant="outlined" onClick={handleOpen} sx={{ minWidth: 120 }}>
        {t("games_setFilters") || "Set Filters"}
      </Button>
      {/* Reset Filters Button: only show if any filter is set */}
      {Object.values(filters).some(v => v !== undefined && v !== "") && (
        <Button
          variant="outlined"
          color="error"
          size="small"
          sx={{ minWidth: 120, px: 2 }}
          title={t('games_resetFilters') || 'Reset Filters'}
          onClick={() => setFilters({
            name: "",
            platform: "",
            consoleId: "",
            completed: "",
            favorite: "",
            region: "",
            labelDamage: "",
            discoloration: "",
            rentalSticker: "",
            testedWorking: "",
            reproduction: "",
            completeness: "",
            steelbook: "",
          })}
        >
          {t('games_resetFilters') || 'Reset Filters'}
        </Button>
      )}
      {filterDialog}
    </Box>
  );
}
