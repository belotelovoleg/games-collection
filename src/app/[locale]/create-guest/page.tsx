"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import React from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  Checkbox,
  ListItemIcon
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import { useTranslations } from "@/hooks/useTranslations";
import { MainLayout } from "@/components/MainLayout";

interface GuestAccount {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  guestPlatformPermissions?: {
    console: {
      id: number;
      name: string;
      photo?: string;
      abbreviation?: string;
    };
  }[];
}

export default function CreateGuestPage({ params }: { params: Promise<{ locale: string }> }) {
  const unwrappedParams = React.use(params);
  const { t } = useTranslations();
  const router = useRouter();
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Guest management state
  const [guests, setGuests] = useState<GuestAccount[]>([]);
  const [guestsLoading, setGuestsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [guestToDelete, setGuestToDelete] = useState<GuestAccount | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Console selection state
  const [userConsoles, setUserConsoles] = useState<any[]>([]);
  const [selectedConsoles, setSelectedConsoles] = useState<number[]>([]);
  const [consolesLoading, setConsolesLoading] = useState(true);

  // Fetch existing guest accounts and user consoles
  useEffect(() => {
    if (session?.user?.id) {
      fetchGuests();
      fetchUserConsoles();
    }
  }, [session?.user?.id]);

  const fetchGuests = async () => {
    try {
      setGuestsLoading(true);
      const response = await fetch('/api/auth/my-guests');
      if (response.ok) {
        const data = await response.json();
        setGuests(data.guests || []);
      }
    } catch (error) {
      console.error('Error fetching guests:', error);
    } finally {
      setGuestsLoading(false);
    }
  };

  const fetchUserConsoles = async () => {
    try {
      setConsolesLoading(true);
      const response = await fetch('/api/user/consoles');
      if (response.ok) {
        const data = await response.json();
        setUserConsoles(data || []);
      }
    } catch (error) {
      console.error('Error fetching user consoles:', error);
    } finally {
      setConsolesLoading(false);
    }
  };

  const handleDeleteClick = (guest: GuestAccount) => {
    setGuestToDelete(guest);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!guestToDelete) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/auth/delete-guest/${guestToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(t("guest_deleteSuccess", { email: guestToDelete.email }));
        setGuests(guests.filter(g => g.id !== guestToDelete.id));
      } else {
        const errorData = await response.json();
        setError(errorData.error || t("guest_deleteError"));
      }
    } catch (error) {
      setError(t("guest_deleteError"));
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setGuestToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setGuestToDelete(null);
  };

  const handleConsoleChange = (event: SelectChangeEvent<typeof selectedConsoles>) => {
    const value = event.target.value;
    setSelectedConsoles(typeof value === 'string' ? value.split(',').map(Number) : value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (selectedConsoles.length === 0) {
      setError(t("guest_selectConsolesError") || "Please select at least one console");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/create-guest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          platformIds: selectedConsoles,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("guest_createError"));
      }

      setSuccess(t("guest_createSuccess", { email }));
      setEmail("");
      setPassword("");
      setSelectedConsoles([]);
      
      // Refresh the guest list
      fetchGuests();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Only allow USER and ADMIN roles to create guests
  if (session?.user?.role !== 'USER' && session?.user?.role !== 'ADMIN') {
    return (
      <MainLayout locale={unwrappedParams.locale}>
        <Container maxWidth="sm" sx={{ mt: 4 }}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              {t("guest_accessDeniedTitle")}
            </Typography>
            <Typography>
              {t("guest_accessDeniedMessage")}
            </Typography>
          </Paper>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout locale={unwrappedParams.locale}>
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center">
            {t("guest_createTitle")}
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
            {t("guest_createDescription")}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label={t("guest_emailLabel")}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 2 }}
              disabled={loading}
            />

            <TextField
              fullWidth
              label={t("guest_passwordLabel")}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 3 }}
              disabled={loading}
              helperText={t("guest_passwordHelper")}
            />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="console-select-label">{t("guest_selectConsolesLabel")}</InputLabel>
              <Select
                labelId="console-select-label"
                multiple
                value={selectedConsoles}
                onChange={handleConsoleChange}
                input={<OutlinedInput label={t("guest_selectConsolesLabel")} />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((consoleId) => {
                      const console = userConsoles.find(uc => uc.console.id === consoleId);
                      return (
                        <Chip 
                          key={consoleId} 
                          label={console?.console.name || `Console ${consoleId}`}
                          size="small"
                        />
                      );
                    })}
                  </Box>
                )}
                disabled={loading || consolesLoading}
              >
                {userConsoles.map((userConsole) => (
                  <MenuItem key={userConsole.console.id} value={userConsole.console.id}>
                    <Checkbox checked={selectedConsoles.indexOf(userConsole.console.id) > -1} />
                    <ListItemText primary={userConsole.console.name} />
                  </MenuItem>
                ))}
              </Select>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                {t("guest_selectConsolesHelper")}
              </Typography>
            </FormControl>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || !email || !password || selectedConsoles.length === 0}
              sx={{ mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : t("guest_createButton")}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              onClick={() => router.back()}
              disabled={loading}
            >
              {t("common_cancel")}
            </Button>
          </Box>
        </Paper>

        {/* Guest List Section */}
        {guests.length > 0 && (
          <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              {t("guest_yourGuestsTitle")}
            </Typography>
            <List>
              {guests.map((guest) => (
                <ListItem key={guest.id} divider alignItems="flex-start">
                  <ListItemText
                    primary={guest.email}
                    secondary={
                      <>
                        {t("guest_createdLabel", { date: new Date(guest.createdAt).toLocaleDateString() })}
                        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {guest.guestPlatformPermissions && guest.guestPlatformPermissions.length > 0 ? (
                            guest.guestPlatformPermissions.map((perm: any) => (
                              <Chip
                                key={perm.console.id}
                                label={perm.console.name}
                                size="small"
                                avatar={perm.console.photo ? <img src={perm.console.photo} alt={perm.console.name} width={24} height={24} /> : undefined}
                              />
                            ))
                          ) : (
                            <Typography variant="caption" color="text.secondary">{t("guest_noPlatforms")}</Typography>
                          )}
                        </Box>
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      color="error"
                      onClick={() => handleDeleteClick(guest)}
                      disabled={loading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>{t("guest_deleteConfirmTitle")}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t("guest_deleteConfirmMessage")}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>{t("common_cancel")}</Button>
            <Button onClick={handleDeleteConfirm} color="error">
              {t("common_delete")}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MainLayout>
  );
}
