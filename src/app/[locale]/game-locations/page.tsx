"use client";
import React, { useEffect, useState, useRef } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { MainLayout } from "@/components/MainLayout";
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import { Box, Typography, IconButton, Fab, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TableSortLabel } from "@mui/material";

type GameLocation = {
  id: string;
  name: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
  gamesCount?: number;
};

export default function Page({ params }: { params: Promise<{ locale: string }> }) {
  const [resolvedParams, setResolvedParams] = useState<{ locale: string } | null>(null);
  useEffect(() => {
    (async () => {
      setResolvedParams(await params);
    })();
  }, [params]);
  const locale = resolvedParams?.locale ?? "en";
  const dummyFocusRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);

  // ...existing code...

  // API helpers
  async function fetchLocations(): Promise<GameLocation[]> {
    const res = await fetch("/api/user/game-locations?withDetails=1");
    if (!res.ok) throw new Error("Failed to fetch locations");
    return res.json();
  }
  async function addLocation(name: string, note?: string): Promise<GameLocation> {
    const res = await fetch("/api/user/game-locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, note }),
    });
    if (!res.ok) throw new Error("Failed to add location");
    return res.json();
  }
  async function updateLocation(id: string, name: string, note?: string): Promise<GameLocation> {
    const res = await fetch("/api/user/game-locations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name, note }),
    });
    if (!res.ok) throw new Error("Failed to update location");
    return res.json();
  }
  async function deleteLocation(id: string): Promise<any> {
    const res = await fetch("/api/user/game-locations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) throw new Error("Failed to delete location");
    return res.json();
  }

  const { t } = useTranslations();
  const [locations, setLocations] = useState<GameLocation[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'gamesCount'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    fetchLocations()
      .then(setLocations)
      .catch(() => setError(t("gameLocations.loadError")))
      .finally(() => setLoading(false));
  }, []);

  // Focus input when dialog opens
  useEffect(() => {
    if (dialogOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [dialogOpen]);

  const handleAdd = () => {
    setEditId(null);
    setName("");
    setNote("");
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    // Defocus any element to avoid aria-hidden focus warning
    setTimeout(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      dummyFocusRef.current?.focus();
    }, 0);
  };
  const handleEdit = (loc: GameLocation) => {
    setEditId(loc.id);
    setName(loc.name);
    setNote(loc.note || "");
    setDialogOpen(true);
  };
  const handleDelete = async (id: string) => {
    if (!window.confirm(t("gameLocations.deleteConfirm"))) return;
    setSaving(true);
    try {
      await deleteLocation(id);
      setLocations((prev) => prev.filter((l) => l.id !== id));
    } catch {
      setError(t("gameLocations.deleteError"));
    } finally {
      setSaving(false);
    }
  };
  const handleDialogSave = async () => {
    if (name.trim().length < 2) return setError(t("gameLocations.nameShort"));
    setSaving(true);
    try {
      if (editId) {
        const updated = await updateLocation(editId, name.trim(), note.trim());
        setLocations((prev) => prev.map((l) => (l.id === editId ? updated : l)));
      } else {
        const created = await addLocation(name.trim(), note.trim());
        setLocations((prev) => [...prev, created]);
      }
      setDialogOpen(false);
      setName("");
      setNote("");
      setEditId(null);
      setError("");
    } catch {
      setError(t("gameLocations.saveError"));
    } finally {
      setSaving(false);
    }
  };

  if (!resolvedParams) {
    return <MainLayout locale="en"><Box sx={{ p: 2, maxWidth: 480, mx: "auto" }}><CircularProgress /></Box></MainLayout>;
  }

  return (
    <MainLayout locale={locale}>
      <button
        ref={dummyFocusRef}
        tabIndex={-1}
        aria-hidden="true"
        style={{ position: "absolute", width: 0, height: 0, opacity: 0, pointerEvents: "none" }}
      />
      <Box sx={{ p: 2, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h5" align="center" gutterBottom>
          {t("gameLocations.title")}
        </Typography>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 2, minWidth: '50vw', maxWidth: '90vw', boxShadow: 3 }}>
            <Table size="medium">
              <TableHead>
                <TableRow sx={{ height: 64 }}>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: 16 }}>{t('gameLocations.nameLabel') || 'Location'}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: 16 }}>{t('gameLocations.noteLabel') || 'Note'}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: 16 }}>
                    <TableSortLabel
                      active={sortBy === 'gamesCount'}
                      direction={sortBy === 'gamesCount' ? sortOrder : 'asc'}
                      onClick={() => {
                        if (sortBy === 'gamesCount') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        else { setSortBy('gamesCount'); setSortOrder('desc'); }
                      }}
                    >
                      {t('gameLocations.games') || 'Games'}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: 16 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {locations.length === 0 ? (
                  <TableRow sx={{ height: 56 }}>
                    <TableCell colSpan={4} align="center">
                      <Typography color="text.secondary" align="center" sx={{ mt: 2 }}>
                        {t("gameLocations.noLocations")}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  [...locations].sort((a, b) => {
                    let cmp = 0;
                    if (sortBy === 'name') {
                      cmp = (a.name || '').localeCompare(b.name || '');
                    } else if (sortBy === 'gamesCount') {
                      cmp = (a.gamesCount || 0) - (b.gamesCount || 0);
                    }
                    return sortOrder === 'asc' ? cmp : -cmp;
                  }).map((loc) => (
                    <TableRow key={loc.id} sx={{ height: 56 }}>
                      <TableCell>{loc.name}</TableCell>
                      <TableCell>{loc.note || ''}</TableCell>
                      <TableCell align="right">{loc.gamesCount ?? 0}</TableCell>
                      <TableCell align="right">
                        <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(loc)} size="medium">
                          <EditIcon fontSize="medium" />
                        </IconButton>
                        <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(loc.id)} size="medium">
                          <DeleteIcon fontSize="medium" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: "fixed", bottom: 32, right: 32, zIndex: 1000 }}
          onClick={handleAdd}
          ref={fabRef}
        >
          <AddIcon />
        </Fab>
        <Dialog open={dialogOpen} onClose={handleDialogClose} fullWidth>
          <DialogTitle>{editId ? t("gameLocations.editTitle") : t("gameLocations.addTitle")}</DialogTitle>
          <DialogContent>
            <TextField
              inputRef={inputRef}
              autoFocus
              margin="dense"
              label={t("gameLocations.nameLabel")}
              type="text"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
              sx={{ mb: 2 }}
            />
            <TextField
              label={t('gameLocations.noteLabel') || 'Note'}
              type="text"
              fullWidth
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={saving}
              multiline
              minRows={2}
              maxRows={6}
            />
            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} disabled={saving}>{t("common_cancel")}</Button>
            <Button onClick={handleDialogSave} disabled={saving || name.trim().length < 2} variant="contained">
              {editId ? t("common_save") : t("common_add")}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
}
