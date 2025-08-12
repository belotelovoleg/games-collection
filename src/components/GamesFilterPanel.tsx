import React, { useState } from "react";
import { useTheme, useMediaQuery } from "@mui/material";
const TableColumnControl = React.lazy(() => import("./TableColumnControl").then(mod => ({ default: mod.TableColumnControl })));
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
  Autocomplete,
} from "@mui/material";

//
export interface GamesFilterPanelProps {
  filters: any;
  setFilters: (filters: any) => void;
  allPlatforms: any[];
  allConsoleSystems?: any[];
  t: any;
  sortBy: string;
  setSortBy: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (value: 'asc' | 'desc') => void;
  gameLocations: { id: string, name: string }[];
  tableColumns: import("@/components/gameTableColumns").GameTableColumnSetting[];
  setTableColumns: (columns: import("@/components/gameTableColumns").GameTableColumnSetting[]) => void | Promise<void>;
  mobileCardViewMode: number;
  setMobileCardViewMode: (mode: number) => void;
}

export const FILTER_FIELDS = [
  { key: "name", label: "games_filter_title", type: "text" },
  { key: "notes", label: "games_filter_notes", type: "text" },
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
          <MenuItem value="createdAt">{t('games_createdAt') || 'Created At'}</MenuItem>
          <MenuItem value="gameLocation">{t('games_gameLocation') || t('common_location') || 'Location'}</MenuItem>
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

// Remove duplicate declaration
export default function GamesFilterPanel({ filters, setFilters, allPlatforms, t, sortBy, setSortBy, sortOrder, setSortOrder, gameLocations, tableColumns, setTableColumns, mobileCardViewMode, setMobileCardViewMode }: GamesFilterPanelProps) {
  const [notesError, setNotesError] = useState(false);
  const [dialogNameError, setDialogNameError] = useState(false);
  // Accept allConsoleSystems prop for future use (fixes warning)
  const [showMobileSortFilter, setShowMobileSortFilter] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters || {});
  const [quickName, setQuickName] = useState(filters.name || "");
  const [columnControlOpen, setColumnControlOpen] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleOpen = () => {
    // Synchronize dialog name filter with last applied filter value
    setLocalFilters({
      ...(filters || {})
    });
    setDialogNameError(false);
    setNotesError(false);
    setDialogOpen(true);
  };
  const handleClose = () => setDialogOpen(false);
  const handleApply = () => {
    let hasError = false;
    if ((localFilters.name || '').trim().length > 0 && (localFilters.name || '').trim().length < 3) {
      setDialogNameError(true);
      hasError = true;
    } else {
      setDialogNameError(false);
    }
    if ((localFilters.notes || '').trim().length > 0 && (localFilters.notes || '').trim().length < 3) {
      setNotesError(true);
      hasError = true;
    } else {
      setNotesError(false);
    }
    if (hasError) return;
    setFilters(localFilters);
    setQuickName(localFilters.name || "");
    setDialogOpen(false);
  };
  const handleChange = (key: string, value: any) => {
    setLocalFilters((prev: any) => ({ ...prev, [key]: value }));
    // Reset error for dialog filter if input is valid or cleared
    if (key === 'name') {
      if (dialogNameError && (value.trim().length >= 3 || value.trim().length === 0)) setDialogNameError(false);
    }
    if (key === 'notes') {
      if (notesError && (value.trim().length >= 3 || value.trim().length === 0)) setNotesError(false);
    }
  };
  const [nameError, setNameError] = useState(false);
  const handleQuickNameSearch = () => {
    if (quickName.trim().length < 3) {
      setNameError(true);
      return;
    }
    setNameError(false);
    setFilters({ ...filters, name: quickName });
  }

  // Shared dialog for filters
  const filterDialog = (
    <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("games_setFilters") || "Set Filters"}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {FILTER_FIELDS.map(field => {
            if (field.type === "text") {
              let error = false;
              let helperText = '';
              if (field.key === 'name') {
                error = dialogNameError;
                helperText = error ? (t('games_search_min_length') || 'Enter at least 3 characters to search.') : '';
              } else if (field.key === 'notes') {
                error = notesError;
                helperText = error ? (t('games_search_min_length') || 'Enter at least 3 characters to search.') : '';
              }
              return (
                <TextField
                  key={field.key}
                  label={t(field.label) || field.label}
                  value={localFilters[field.key] || ""}
                  onChange={e => handleChange(field.key, e.target.value)}
                  size="small"
                  error={error}
                  helperText={helperText}
                />
              );
            }
            if (field.type === "select") {
              let options: any[] = [];
              if (field.key === "platform") options = allPlatforms;
              else if (field.key === "region") options = ["REGION_FREE", "NTSC_U", "NTSC_J", "PAL"];
              else if (field.key === "completeness") options = ["CIB", "GAME_BOX", "GAME_MANUAL", "LOOSE"];
              return (
                <React.Fragment key={field.key}>
                  <FormControl size="small" fullWidth>
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
                  {/* Game Location Autocomplete after select */}
                  {field.key === "platform" && gameLocations && gameLocations.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <FormControl size="small" fullWidth>
                        <Autocomplete
                          options={gameLocations}
                          getOptionLabel={(option: { id: string; name: string }) => option.name}
                          value={gameLocations.find(loc => loc.id === (localFilters.gameLocationId || "")) || gameLocations[0]}
                          onChange={(
                            _event: React.SyntheticEvent,
                            newValue: { id: string; name: string } | null
                          ) => {
                            handleChange("gameLocationId", newValue ? newValue.id : "");
                          }}
                          renderInput={(params: any) => (
                            <TextField
                              {...params}
                              label={t('common_location') || 'Location'}
                              variant="outlined"
                              size="small"
                            />
                          )}
                        />
                      </FormControl>
                    </Box>
                  )}
                </React.Fragment>
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
         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 120, flex: 1}}>
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
          <Button
            variant="outlined"
            size="small"
            sx={{ minWidth: 40, px: 1, borderColor: 'primary.main', color: 'primary.main', backgroundColor: 'background.paper' }}
            title={t('games_toggleViewMode') || 'Toggle View Mode'}
            onClick={async () => {
              let nextMode = mobileCardViewMode + 1;
              if (nextMode > 7) nextMode = 1;
              setMobileCardViewMode(nextMode);
              try {
                await fetch('/api/user/mobile-card-view', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ mobileCardViewMode: nextMode })
                });
              } catch (e) {
                // Optionally handle error
              }
            }}
          >
            <span role="img" aria-label="view mode">
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                <path d="M0 0h24v24H0V0z" fill="none"/>
                <path d="M4 5h4v4H4V5zm0 5h4v4H4v-4zm0 5h4v4H4v-4zm5-10h4v4h-4V5zm0 5h4v4h-4v-4zm0 5h4v4h-4v-4zm5-10h4v4h-4V5zm0 5h4v4h-4v-4zm0 5h4v4h-4v-4z" fill="currentColor"/>
              </svg>
            </span>
          </Button>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            size="small"
            label={t('games_filter_title') || 'Game Title'}
            value={quickName}
            onChange={e => {
              setQuickName(e.target.value);
              if (nameError && e.target.value.trim().length >= 3) setNameError(false);
            }}
            sx={{ minWidth: 180, flex: 1 }}
            onKeyDown={e => {
              if (e.key === 'Enter') handleQuickNameSearch();
            }}
            error={nameError}
            helperText={nameError ? t('games_search_min_length') || 'Enter at least 3 characters to search.' : ''}
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
  // Desktop 
  // Table column control state

  const handleColumnControlApply = (newColumns: any) => {
    // Call the parent callback to persist and update table
    if (typeof setTableColumns === 'function') {
      setTableColumns(newColumns);
    }
    setColumnControlOpen(false);
  };

  // Pass columns to GamesTable via prop
  // Find parent usage and update if needed
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
        onChange={e => {
          setQuickName(e.target.value);
          if (nameError && (e.target.value.trim().length >= 3 || e.target.value.trim().length === 0)) setNameError(false);
        }}
        sx={{ minWidth: 180 }}
        onKeyDown={e => {
          if (e.key === 'Enter') handleQuickNameSearch();
        }}
        error={nameError}
        helperText={nameError ? t('games_search_min_length') || 'Enter at least 3 characters to search.' : ''}
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
          sx={{ minWidth: 120, px: 2 }}
          title={t('games_resetFilters') || 'Reset Filters'}
          onClick={() => {
            setFilters({
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
            });
            setQuickName("");
          }}
        >
          {t('games_resetFilters') || 'Reset Filters'}
        </Button>
      )}
      {/* Table Column Control Button */}
      <Button
        variant="outlined"
        sx={{ minWidth: 120, px: 2 }}
        onClick={() => setColumnControlOpen(true)}
      >
        {t('games_tableColumnControl') || 'Table Columns'}
      </Button>
      {/* Table Column Control Popup */}
      <React.Suspense fallback={null}>
        {columnControlOpen && (
          <TableColumnControl
            open={columnControlOpen}
            onClose={() => setColumnControlOpen(false)}
            columns={tableColumns}
            onChange={handleColumnControlApply}
            t={t}
          />
        )}
      </React.Suspense>
      {filterDialog}
    </Box>
  );
}
