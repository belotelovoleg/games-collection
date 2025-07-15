"use client";

import React, { useState } from "react";
import { Box, Typography, TextField, Button, Alert, CircularProgress, Paper } from "@mui/material";
import { useTranslations } from "@/hooks/useTranslations";
import { MainLayout } from "@/components/MainLayout";

// Remove duplicate variable declarations
export default function ChangePasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const unwrappedParams = React.use(params);
  const { t } = useTranslations();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // Remove duplicate isAuthenticated declaration
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  React.useEffect(() => {
    fetch('/api/auth/session').then(res => res.json()).then(data => {
      setIsAuthenticated(!!data?.user);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError(t("changePassword_fillAllFields") || "Please fill all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("changePassword_passwordsDontMatch") || "Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || t("changePassword_error") || "Failed to change password.");
      } else {
        setSuccess(t("changePassword_success") || "Password changed successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (e) {
      setError(t("changePassword_error") || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated === null) {
    return (
      <MainLayout locale={unwrappedParams.locale}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }
  if (!isAuthenticated) {
    return (
      <MainLayout locale={unwrappedParams.locale}>
        <Box sx={{ maxWidth: 400, mx: 'auto', mt: 6 }}>
          <Alert severity="error">You must be logged in to change your password.</Alert>
        </Box>
      </MainLayout>
    );
  }
  return (
    <MainLayout locale={unwrappedParams.locale}>
      <Box sx={{ maxWidth: 400, mx: "auto", mt: 6 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
            {t("changePassword_title") || "Change Password"}
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label={t("changePassword_current") || "Current Password"}
              type="password"
              fullWidth
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              sx={{ mb: 2 }}
              autoComplete="current-password"
            />
            <TextField
              label={t("changePassword_new") || "New Password"}
              type="password"
              fullWidth
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              sx={{ mb: 2 }}
              autoComplete="new-password"
            />
            <TextField
              label={t("changePassword_confirm") || "Confirm New Password"}
              type="password"
              fullWidth
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              sx={{ mb: 2 }}
              autoComplete="new-password"
            />
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
              {loading ? <CircularProgress size={24} /> : t("changePassword_submit") || "Change Password"}
            </Button>
          </form>
        </Paper>
      </Box>
    </MainLayout>
  );
}
