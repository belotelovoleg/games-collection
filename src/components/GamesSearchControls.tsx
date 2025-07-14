import React from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

export interface GamesSearchControlsProps {
  isMobile: boolean;
  showMobileControls?: boolean;
  setShowMobileControls?: (v: boolean | ((prev: boolean) => boolean)) => void;
  userConsoles: any[];
  selectedConsole: string;
  setSelectedConsole: (v: string) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  handleSearchKeyDown: (e: React.KeyboardEvent) => void;
  loading: boolean;
  searching: boolean;
  searchError: string;
  handleSearch: () => void;
  handleAddGame: () => void;
  t: any;
}

export const GamesSearchControls: React.FC<GamesSearchControlsProps> = ({
  isMobile,
  showMobileControls,
  setShowMobileControls,
  userConsoles,
  selectedConsole,
  setSelectedConsole,
  searchQuery,
  setSearchQuery,
  handleSearchKeyDown,
  loading,
  searching,
  searchError,
  handleSearch,
  handleAddGame,
  t,
}) => {
  // Mobile: expand/collapse
  if (isMobile) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="contained"
              size="medium"
              endIcon={showMobileControls ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              sx={{ mb: 1, fontWeight: 600, fontSize: '1rem' }}
              onClick={() => setShowMobileControls && setShowMobileControls((prev: boolean) => !prev)}
            >
              {t("games_addNew")}
            </Button>
            {showMobileControls && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {searchError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {searchError}
                  </Alert>
                )}
                <FormControl fullWidth size="small" sx={{ minWidth: 200 }}>
                  <InputLabel id="console-select-label">
                    {t("games_selectConsole")}
                  </InputLabel>
                  <Select
                    labelId="console-select-label"
                    value={selectedConsole}
                    label={t("games_selectConsole")}
                    onChange={(e) => setSelectedConsole(e.target.value)}
                    disabled={loading}
                    sx={{ minWidth: 120, width: '100%' }}
                  >
                    {userConsoles.map((userConsole) => (
                      <MenuItem key={userConsole.id} value={String(userConsole.console.id)}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                          <span>{userConsole.console.name}</span>
                          <Chip 
                            size="small" 
                            label={userConsole.status === "OWNED" ? t("consoles_owned") : t("consoles_wishlist")}
                            color={userConsole.status === "OWNED" ? "success" : "primary"}
                            sx={{ ml: "auto" }}
                          />
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  size="small"
                  label={t("games_searchGames")}
                  placeholder={t("games_searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  disabled={loading || !selectedConsole}
                  sx={{ minWidth: 200 }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={searching ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
                    onClick={handleSearch}
                    disabled={loading || searching || !selectedConsole || !searchQuery.trim()}
                    sx={{ flex: 1 }}
                  >
                    {searching ? t("common_searching") : t("common_search")}
                  </Button>
                  <Button
                    type="button"
                    variant="outlined"
                    size="small"
                    onClick={handleAddGame}
                    disabled={loading}
                    sx={{ flex: 1 }}
                  >
                    {t("games_addNew")}
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  }
  // Desktop
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        {searchError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {searchError}
          </Alert>
        )}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center' }}>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 30%' }, minWidth: { xs: 200, sm: 180 }, maxWidth: { xs: '100%', sm: 300 } }}>
            <FormControl fullWidth size="small" sx={{ minWidth: { xs: 200, sm: 180 } }}>
              <InputLabel id="console-select-label">
                {t("games_selectConsole")}
              </InputLabel>
              <Select
                labelId="console-select-label"
                value={selectedConsole}
                label={t("games_selectConsole")}
                onChange={(e) => setSelectedConsole(e.target.value)}
                disabled={loading}
                sx={{ minWidth: { xs: 120, sm: 180 }, width: '100%' }}
              >
                {userConsoles.map((userConsole) => (
                  <MenuItem key={userConsole.id} value={String(userConsole.console.id)}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                      <span>{userConsole.console.name}</span>
                      <Chip 
                        size="small" 
                        label={userConsole.status === "OWNED" ? t("consoles_owned") : t("consoles_wishlist")}
                        color={userConsole.status === "OWNED" ? "success" : "primary"}
                        sx={{ ml: "auto" }}
                      />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 40%' }, minWidth: { xs: 200, sm: 240 }, maxWidth: { xs: '100%', sm: 400 } }}>
            <TextField
              fullWidth
              size="small"
              label={t("games_searchGames")}
              placeholder={t("games_searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              disabled={loading || !selectedConsole}
              sx={{ minWidth: { xs: 200, sm: 240 } }}
            />
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 30%' }, display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={searching ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
              onClick={handleSearch}
              disabled={loading || searching || !selectedConsole || !searchQuery.trim()}
              sx={{ flex: 1 }}
            >
              {searching ? t("common_searching") : t("common_search")}
            </Button>
            <Button
              type="button"
              variant="outlined"
              size="small"
              onClick={handleAddGame}
              disabled={loading}
              sx={{ flex: 1 }}
            >
              {t("games_addNew")}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
