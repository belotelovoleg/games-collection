'use client';

import { use, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  Avatar,
  Fab,
  useMediaQuery,
  Card,
  CardContent,
  CardActions,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { MainLayout } from '@/components/MainLayout';
import { useTranslations } from '@/hooks/useTranslations';
import PlatformVersionDetails from '@/components/admin/PlatformVersionDetails';

interface Console {
  id: number;
  igdbPlatformID: number | null;
  igdbPlatformVersionID: number | null;
  name: string;
  photo: string | null;
  abbreviation: string | null;
  alternativeName: string | null;
  generation: number | null;
  platformFamily: string | null;
  platformType: string | null;
  createdAt: string;
  updatedAt: string;
}

interface IGDBPlatform {
  id: number;
  name: string;
  abbreviation?: string;
  alternative_name?: string;
  generation?: number;
  platform_family?: number;
  platform_logo?: {
    id: number;
    url: string;
  };
  versions?: Array<{
    id: number;
    name: string;
    platform_logo?: {
      id: number;
      url: string;
    };
    [key: string]: any;
  }>;
}

interface IGDBPlatformVersion {
  id: number;
  name: string;
  abbreviation?: string;
  alternative_name?: string;
  platform_logo?: {
    id: number;
    url: string;
  };
  main_manufacturer?: {
    id: number;
    name: string;
  };
  platform?: {
    id: number;
    name: string;
  };
}

const initialFormData = {
  igdbPlatformID: '',
  igdbPlatformVersionID: '',
  name: '',
  photo: '',
  abbreviation: '',
  alternativeName: '',
  generation: '',
  platformFamily: '',
  platformType: '',
  igdbPlatformData: null as any,
  igdbPlatformVersionData: null as any
};

export default function AdminConsolesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const { t } = useTranslations();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { data: session, status } = useSession();
  const router = useRouter();

  const [consoles, setConsoles] = useState<Console[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingConsole, setEditingConsole] = useState<Console | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [saving, setSaving] = useState(false);
  
  // IGDB Search state
  const [igdbSearchQuery, setIgdbSearchQuery] = useState('');
  const [igdbSearching, setIgdbSearching] = useState(false);
  const [igdbResults, setIgdbResults] = useState<{
    platforms: IGDBPlatform[];
    platformVersions: IGDBPlatformVersion[];
  } | null>(null);
  const [igdbDialogOpen, setIgdbDialogOpen] = useState(false);
  const [igdbTesting, setIgdbTesting] = useState(false);
  
  // Platform Version Details state
  const [platformVersionDetailsOpen, setPlatformVersionDetailsOpen] = useState(false);
  const [selectedPlatformVersion, setSelectedPlatformVersion] = useState<IGDBPlatformVersion | null>(null);
  
  // Selected Platform Versions state
  const [selectedPlatformForVersions, setSelectedPlatformForVersions] = useState<IGDBPlatform | null>(null);

  // Check if user is admin
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'ADMIN') {
      router.push(`/${locale}`);
      return;
    }
  }, [session, status, router, locale]);

  // Fetch consoles
  const fetchConsoles = async () => {
    try {
      const response = await fetch('/api/admin/consoles');
      if (response.ok) {
        const data = await response.json();
        setConsoles(data);
      } else {
        setError(t('common_error'));
      }
    } catch (error) {
      setError(t('common_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchConsoles();
    }
  }, [session]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAdd = () => {
    setEditingConsole(null);
    setFormData(initialFormData);
    setDialogOpen(true);
  };

  const handleEdit = (console: Console) => {
    setEditingConsole(console);
    setFormData({
      igdbPlatformID: console.igdbPlatformID?.toString() || '',
      igdbPlatformVersionID: console.igdbPlatformVersionID?.toString() || '',
      name: console.name,
      photo: console.photo || '',
      abbreviation: console.abbreviation || '',
      alternativeName: console.alternativeName || '',
      generation: console.generation?.toString() || '',
      platformFamily: console.platformFamily || '',
      platformType: console.platformType || '',
      igdbPlatformData: null, // For editing existing consoles, we don't re-send IGDB data
      igdbPlatformVersionData: null
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError(t('console_name') + ' is required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const url = editingConsole 
        ? `/api/admin/consoles/${editingConsole.id}`
        : '/api/admin/consoles';
      
      const method = editingConsole ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setDialogOpen(false);
        fetchConsoles();
        setError('');
      } else {
        const data = await response.json();
        setError(data.error || t('common_error'));
      }
    } catch (error) {
      setError(t('common_error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (console: Console) => {
    setEditingConsole(console);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!editingConsole) return;

    try {
      const response = await fetch(`/api/admin/consoles/${editingConsole.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setDeleteDialogOpen(false);
        fetchConsoles();
        setError('');
      } else {
        setError(t('common_error'));
      }
    } catch (error) {
      setError(t('common_error'));
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingConsole(null);
    setFormData(initialFormData);
    setError('');
  };

  // IGDB Search Functions
  const handleIgdbSearch = async () => {
    if (!igdbSearchQuery.trim() || igdbSearchQuery.trim().length < 2) {
      setError(t('igdb_searchMinLength'));
      return;
    }

    setIgdbSearching(true);
    setError('');

    try {
      const response = await fetch('/api/admin/igdb/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: igdbSearchQuery.trim() })
      });

      if (response.ok) {
        const data = await response.json();
        setIgdbResults(data);
        setIgdbDialogOpen(true);
      } else {
        const errorData = await response.json();
        setError(errorData.error || t('common_error'));
      }
    } catch (error) {
      setError(t('common_error'));
    } finally {
      setIgdbSearching(false);
    }
  };

  const handleSelectPlatform = (platform: IGDBPlatform) => {
    setFormData({
      igdbPlatformID: platform.id.toString(),
      igdbPlatformVersionID: '',
      name: platform.name,
      photo: platform.platform_logo?.url ? `https:${platform.platform_logo.url}` : '',
      abbreviation: platform.abbreviation || '',
      alternativeName: platform.alternative_name || '',
      generation: platform.generation?.toString() || '',
      platformFamily: platform.platform_family?.toString() || '',
      platformType: 'platform',
      // Include raw IGDB data for caching
      igdbPlatformData: platform,
      igdbPlatformVersionData: null
    });
    setIgdbDialogOpen(false);
    setDialogOpen(true);
    setEditingConsole(null);
  };

  // Handle showing platform versions (fetch full version data using IDs)
  const handleShowPlatformVersions = async (platform: IGDBPlatform) => {
    if (!platform.versions || platform.versions.length === 0) {
      console.log('[PLATFORM VERSIONS] No versions found for platform:', platform.name);
      return;
    }

    console.log('[PLATFORM VERSIONS] Fetching full data for version IDs:', platform.versions);

    try {
      // Create a query to fetch full version data using the IDs
      const versionIds = platform.versions.map(v => typeof v === 'number' ? v : v.id).join(',');
      
      const response = await fetch('/api/admin/igdb/platform-versions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ versionIds: versionIds })
      });

      if (response.ok) {
        const responseData = await response.json();
        const fullVersions = responseData.platformVersions || [];
        console.log('[PLATFORM VERSIONS] Fetched full version data:', fullVersions);
        
        // Update the platform object with full version data
        const platformWithFullVersions = {
          ...platform,
          versions: fullVersions
        };
        
        setSelectedPlatformForVersions(platformWithFullVersions);
      } else {
        console.error('[PLATFORM VERSIONS] Failed to fetch version data');
        setError('Failed to fetch platform version details');
      }
    } catch (error) {
      console.error('[PLATFORM VERSIONS] Error fetching version data:', error);
      setError('Error fetching platform version details');
    }
  };

  const handleSelectPlatformVersion = (platformVersion: IGDBPlatformVersion) => {
    setSelectedPlatformVersion(platformVersion);
    setIgdbDialogOpen(false);
    setPlatformVersionDetailsOpen(true);
  };

  const handlePlatformVersionDetailsClose = () => {
    setPlatformVersionDetailsOpen(false);
    // Re-open the IGDB search results dialog so user can see the previous results
    // Only if IGDB results still exist (not cleared by selection)
    if (igdbResults) {
      setIgdbDialogOpen(true);
    }
  };

  const handlePlatformVersionSelect = (consoleData: any) => {
    // This is called when user clicks "Add as Console" in the details component
    console.log('[MainPage] === RECEIVING CONSOLE DATA ===');
    console.log('[MainPage] Received console data:', consoleData);
    
    // First clear IGDB results to prevent dialog reopening
    setIgdbResults(null);
    
    // Map the platform version data properly with new field names
    const formattedData = {
      igdbPlatformID: consoleData.igdbPlatformID?.toString() || '',
      igdbPlatformVersionID: consoleData.igdbPlatformVersionID?.toString() || '',
      name: consoleData.name || '',
      photo: consoleData.photo || '',
      abbreviation: consoleData.abbreviation || '',
      alternativeName: consoleData.alternativeName || '',
      generation: consoleData.generation?.toString() || '',
      platformFamily: consoleData.platformFamily || '',
      platformType: consoleData.platformType || 'console',
      // Include IGDB data for caching
      igdbPlatformData: consoleData.igdbPlatformData,
      igdbPlatformVersionData: consoleData.igdbPlatformVersionData
    };
    
    console.log('[MainPage] Formatted form data:', formattedData);
    console.log('[MainPage] === END RECEIVING DATA ===');
    
    setFormData(formattedData);
    
    // Close platform version details dialog
    setPlatformVersionDetailsOpen(false);
    // Make sure IGDB dialog is closed
    setIgdbDialogOpen(false);
    // Open the add console dialog
    setDialogOpen(true);
    setEditingConsole(null);
  };

  // Don't render if not admin
  if (status === 'loading') {
    return (
      <MainLayout locale={locale}>
        <Container maxWidth="lg">
          <Box sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <CircularProgress />
          </Box>
        </Container>
      </MainLayout>
    );
  }
  if (!session || session.user?.role !== 'ADMIN') return null;

  return (
    <MainLayout locale={locale}>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1">
              {t('console_title')}
            </Typography>
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  size="small"
                  placeholder={t('igdb_searchPlaceholder')}
                  value={igdbSearchQuery}
                  onChange={(e) => setIgdbSearchQuery(e.target.value)}
                  sx={{ minWidth: 200 }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleIgdbSearch();
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={handleIgdbSearch}
                  disabled={igdbSearching || !igdbSearchQuery.trim()}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {igdbSearching ? t('igdb_searching') : t('igdb_findButton')}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAdd}
                >
                  {t('console_addNew')}
                </Button>
              </Box>
            )}
          </Box>

          {/* Mobile IGDB Search */}
          {isMobile && (
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                size="small"
                placeholder={t('igdb_searchPlaceholder')}
                value={igdbSearchQuery}
                onChange={(e) => setIgdbSearchQuery(e.target.value)}
                sx={{ mb: 2 }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleIgdbSearch();
                  }
                }}
              />
              <Button
                fullWidth
                variant="outlined"
                onClick={handleIgdbSearch}
                disabled={igdbSearching || !igdbSearchQuery.trim()}
                sx={{ mb: 1 }}
              >
                {igdbSearching ? t('igdb_searching') : t('igdb_findButton')}
              </Button>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Typography>{t('common_loading')}</Typography>
          ) : (
            <>
              {isMobile ? (
                // Mobile Card View
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {consoles.length === 0 ? (
                    <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
                      {t('console_noData')}
                    </Typography>
                  ) : (
                    consoles.map((console) => (
                      <Card key={console.id}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            {console.photo && (
                              <Avatar 
                                src={console.photo} 
                                sx={{ width: 40, height: 40, mr: 2 }}
                              />
                            )}
                            <Box>
                              <Typography variant="h6" component="h3">
                                {console.name}
                              </Typography>
                              {console.abbreviation && (
                                <Chip 
                                  label={console.abbreviation} 
                                  size="small" 
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </Box>
                          
                          {console.generation && (
                            <Typography variant="body2" color="text.secondary">
                              {t('console_generation')}: {console.generation}
                            </Typography>
                          )}
                          
                          {console.platformFamily && (
                            <Typography variant="body2" color="text.secondary">
                              {t('console_platformFamily')}: {console.platformFamily}
                            </Typography>
                          )}
                        </CardContent>
                        
                        <CardActions>
                          <IconButton 
                            size="small" 
                            onClick={() => handleEdit(console)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteClick(console)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </CardActions>
                      </Card>
                    ))
                  )}
                </Box>
              ) : (
                // Desktop Table View
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('console_photo')}</TableCell>
                        <TableCell>{t('console_name')}</TableCell>
                        <TableCell>{t('console_abbreviation')}</TableCell>
                        <TableCell>{t('console_generation')}</TableCell>
                        <TableCell>{t('console_platformFamily')}</TableCell>
                        <TableCell align="right">{t('common_edit')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {consoles.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            {t('console_noData')}
                          </TableCell>
                        </TableRow>
                      ) : (
                        consoles.map((console) => (
                          <TableRow key={console.id}>
                            <TableCell>
                              {console.photo && (
                                <Avatar src={console.photo} sx={{ width: 40, height: 40 }} />
                              )}
                            </TableCell>
                            <TableCell>{console.name}</TableCell>
                            <TableCell>
                              {console.abbreviation && (
                                <Chip label={console.abbreviation} size="small" variant="outlined" />
                              )}
                            </TableCell>
                            <TableCell>{console.generation}</TableCell>
                            <TableCell>{console.platformFamily}</TableCell>
                            <TableCell align="right">
                              <IconButton onClick={() => handleEdit(console)} color="primary">
                                <EditIcon />
                              </IconButton>
                              <IconButton onClick={() => handleDeleteClick(console)} color="error">
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}

          {/* Mobile FAB */}
          {isMobile && (
            <>
              <Fab
                color="primary"
                aria-label="add"
                sx={{ position: 'fixed', bottom: 80, right: 16 }}
                onClick={handleAdd}
              >
                <AddIcon />
              </Fab>
              <Fab
                color="secondary"
                aria-label="igdb-search"
                sx={{ position: 'fixed', bottom: 16, right: 16 }}
                onClick={handleIgdbSearch}
                disabled={igdbTesting}
              >
                <SearchIcon />
              </Fab>
            </>
          )}
        </Box>
      </Container>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          {editingConsole ? t('console_edit') : t('console_addNew')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label={t('console_name')}
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label={t('console_abbreviation')}
              value={formData.abbreviation}
              onChange={(e) => handleInputChange('abbreviation', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label={t('console_alternativeName')}
              value={formData.alternativeName}
              onChange={(e) => handleInputChange('alternativeName', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label={t('console_photo')}
              value={formData.photo}
              onChange={(e) => handleInputChange('photo', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label={t('console_generation')}
              type="number"
              value={formData.generation}
              onChange={(e) => handleInputChange('generation', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label={t('console_platformFamily')}
              value={formData.platformFamily}
              onChange={(e) => handleInputChange('platformFamily', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label={t('console_platformType')}
              value={formData.platformType}
              onChange={(e) => handleInputChange('platformType', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label={t('console_igdbId')}
              type="number"
              value={formData.igdbPlatformID}
              onChange={(e) => handleInputChange('igdbPlatformID', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label={t('console_igdbVersionId')}
              type="number"
              value={formData.igdbPlatformVersionID}
              onChange={(e) => handleInputChange('igdbPlatformVersionID', e.target.value)}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>
            {t('common_cancel')}
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={saving}
            startIcon={<SaveIcon />}
          >
            {saving ? t('common_loading') : t('common_save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('console_delete')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('console_confirmDelete')}
          </Typography>
          {editingConsole && (
            <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
              {editingConsole.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t('common_cancel')}
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            {t('common_delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* IGDB Search Results Dialog */}
      <Dialog 
        open={igdbDialogOpen} 
        onClose={() => setIgdbDialogOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          {t('igdb_findButton')} - "{igdbSearchQuery}"
        </DialogTitle>
        <DialogContent>
          {igdbResults && (
            <Box sx={{ pt: 2 }}>
              {/* Platforms Section */}
              <Typography variant="h6" sx={{ mb: 2 }}>
                {t('igdb_platforms')} ({igdbResults.platforms.length})
              </Typography>
              
              {igdbResults.platforms.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {t('igdb_noResults')}
                </Typography>
              ) : (
                <Box sx={{ maxHeight: 200, overflow: 'auto', mb: 3 }}>
                  {igdbResults.platforms.map((platform) => (
                    <Card key={platform.id} sx={{ mb: 1 }}>
                      <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {platform.platform_logo?.url && (
                              <Avatar 
                                src={`https:${platform.platform_logo.url}`}
                                sx={{ width: 32, height: 32 }}
                              />
                            )}
                            <Box>
                              <Typography variant="subtitle1">{platform.name}</Typography>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                {platform.abbreviation && (
                                  <Chip label={platform.abbreviation} size="small" variant="outlined" />
                                )}
                                {platform.generation && (
                                  <Chip 
                                    label={`${t('igdb_generation')}: ${platform.generation}`} 
                                    size="small" 
                                    variant="outlined" 
                                  />
                                )}
                                {platform.versions && platform.versions.length > 0 && (
                                  <Chip 
                                    label={`${platform.versions.length} versions`} 
                                    size="small" 
                                    variant="outlined" 
                                    color="primary"
                                  />
                                )}
                              </Box>
                            </Box>
                          </Box>
                          {platform.versions && platform.versions.length > 0 ? (
                            <Button 
                              size="small" 
                              variant="outlined"
                              onClick={() => handleShowPlatformVersions(platform)}
                            >
                              Show Versions ({platform.versions.length})
                            </Button>
                          ) : (
                            <Button 
                              size="small" 
                              variant="contained"
                              onClick={() => handleSelectPlatform(platform)}
                            >
                              {t('igdb_selectPlatform')}
                            </Button>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}

              {/* Platform Versions Section */}
              <Typography variant="h6" sx={{ mb: 2 }}>
                {t('igdb_platformVersions')} ({igdbResults.platformVersions.length})
              </Typography>
              
              {igdbResults.platformVersions.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {t('igdb_noResults')}
                </Typography>
              ) : (
                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {igdbResults.platformVersions.map((version) => (
                      <Card key={`search-${version.id}`} sx={{ mb: 1 }}>
                        <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              {version.platform_logo?.url && (
                                <Avatar 
                                  src={`https:${version.platform_logo.url}`}
                                  sx={{ width: 32, height: 32 }}
                                />
                              )}
                              <Box>
                                <Typography variant="subtitle1">{version.name}</Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  {version.abbreviation && (
                                    <Chip label={version.abbreviation} size="small" variant="outlined" />
                                  )}
                                  {version.main_manufacturer?.name && (
                                    <Chip 
                                      label={`${t('igdb_manufacturer')}: ${version.main_manufacturer.name}`} 
                                      size="small" 
                                      variant="outlined" 
                                    />
                                  )}
                                  {version.platform?.name && (
                                    <Chip 
                                      label={`${t('igdb_family')}: ${version.platform.name}`} 
                                      size="small" 
                                      variant="outlined" 
                                    />
                                  )}
                                </Box>
                              </Box>
                            </Box>
                            <Button 
                              size="small" 
                              variant="contained"
                              onClick={() => handleSelectPlatformVersion(version)}
                            >
                              {t('igdb_selectVersion')}
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                </Box>
              )}

              {/* Selected Platform Versions Section */}
              {selectedPlatformForVersions && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Platform Versions for "{selectedPlatformForVersions.name}" ({selectedPlatformForVersions.versions?.length || 0})
                </Typography>
                
                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {Array.isArray(selectedPlatformForVersions.versions) ? 
                    selectedPlatformForVersions.versions.map((version, index) => (
                      <Card key={`selected-${version.id || index}`} sx={{ mb: 1 }}>
                        <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              {version.platform_logo?.url && (
                                <Avatar 
                                  src={`https:${version.platform_logo.url}`}
                                  sx={{ width: 32, height: 32 }}
                                />
                              )}
                              <Box>
                                <Typography variant="subtitle1">{version.name}</Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  {version.abbreviation && (
                                    <Chip label={version.abbreviation} size="small" variant="outlined" />
                                  )}
                                  {version.main_manufacturer?.name && (
                                    <Chip 
                                      label={`${t('igdb_manufacturer')}: ${version.main_manufacturer.name}`} 
                                      size="small" 
                                      variant="outlined" 
                                    />
                                  )}
                                  {version.platform?.name && (
                                    <Chip 
                                      label={`${t('igdb_family')}: ${version.platform.name}`} 
                                      size="small" 
                                      variant="outlined" 
                                    />
                                  )}
                                </Box>
                              </Box>
                            </Box>
                            <Button 
                              size="small" 
                              variant="contained"
                              onClick={() => handleSelectPlatformVersion(version)}
                            >
                              {t('igdb_selectVersion')}
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    ))
                  : 
                    <Typography variant="body2" color="error">
                      Error: Versions data is not an array. Type: {typeof selectedPlatformForVersions.versions}
                    </Typography>
                  }
                </Box>
              </Box>
            )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIgdbDialogOpen(false)}>
            {t('common_cancel')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Platform Version Details Dialog */}
      <PlatformVersionDetails
        isOpen={platformVersionDetailsOpen}
        onClose={handlePlatformVersionDetailsClose}
        platformVersion={selectedPlatformVersion}
        onSelect={handlePlatformVersionSelect}
      />
    </MainLayout>
  );
}
