import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Divider
} from '@mui/material';

interface PlatformVersionDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  platformVersion: any; // Complete IGDB platform_version object with all fields
  onSelect?: (consoleData: any) => void;
}

const PlatformVersionDetails: React.FC<PlatformVersionDetailsProps> = ({
  isOpen,
  onClose,
  platformVersion,
  onSelect
}) => {
  // Store all IGDB data internally for future use
  const allPlatformData = platformVersion;
  const [parentPlatform, setParentPlatform] = useState<any>(null);
  const [loadingParent, setLoadingParent] = useState(false);
  const [platformTypeName, setPlatformTypeName] = useState<string>('console');
  const [loadingPlatformType, setLoadingPlatformType] = useState(false);

  // Fetch platform type name from IGDB API
  const fetchPlatformTypeName = async (platformTypeId: number): Promise<string> => {
    if (!platformTypeId) return 'console';
    
    setLoadingPlatformType(true);
    try {
      const response = await fetch('/api/admin/igdb/platform-type', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platformTypeId })
      });

      if (response.ok) {
        const data = await response.json();
        return data.name || 'console';
      } else {
        console.error('Failed to fetch platform type name');
        return 'console';
      }
    } catch (error) {
      console.error('Error fetching platform type name:', error);
      return 'console';
    } finally {
      setLoadingPlatformType(false);
    }
  };

  // Fetch parent platform data when dialog opens
  useEffect(() => {
    if (isOpen && platformVersion?.id) {
      fetchParentPlatform();
    } else if (!isOpen) {
      // Clear parent platform data when dialog closes
      setParentPlatform(null);
      setLoadingParent(false);
      setPlatformTypeName('console');
      setLoadingPlatformType(false);
    }
  }, [isOpen, platformVersion?.id]);

  // Fetch platform type name when parent platform is loaded
  useEffect(() => {
    if (parentPlatform?.platform_type?.id) {
      fetchPlatformTypeName(parentPlatform.platform_type.id).then(name => {
        setPlatformTypeName(name);
      });
    }
  }, [parentPlatform]);

  const fetchParentPlatform = async () => {
    if (!platformVersion?.id) return;
    
    setLoadingParent(true);
    try {
      const response = await fetch('/api/admin/igdb/parent-platform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ versionId: platformVersion.id })
      });

      if (response.ok) {
        const data = await response.json();
        setParentPlatform(data.platform);
      } else {
        console.error('Failed to fetch parent platform');
      }
    } catch (error) {
      console.error('Error fetching parent platform:', error);
    } finally {
      setLoadingParent(false);
    }
  };

  const handleSelect = () => {
    // Extract the specific fields needed for your console data
    // Prioritize parent platform data for some fields if available
    const consoleData = {
      // Basic platform version info
      name: platformVersion?.name || '',
      photo: platformVersion?.platform_logo?.url ? `https:${platformVersion.platform_logo.url}` : '',
      
      // Prefer platform version specific data, fallback to parent platform
      abbreviation: platformVersion?.abbreviation || parentPlatform?.abbreviation || '',
      alternativeName: platformVersion?.alternative_name || parentPlatform?.alternative_name || '',
      
      // Prefer parent platform for generation and family data
      generation: parentPlatform?.generation || platformVersion?.platform?.generation || platformVersion?.generation || '',
      platformFamily: parentPlatform?.name || platformVersion?.platform?.name || '',
      platformType: platformTypeName, // Use fetched platform type name
      
      // IGDB IDs - use new field names
      igdbPlatformID: parentPlatform?.id || platformVersion?.platform?.id || '',
      igdbPlatformVersionID: platformVersion?.id || '',
      
      // Include raw IGDB data for caching in database
      igdbPlatformData: parentPlatform,
      igdbPlatformVersionData: platformVersion,
      
      // Additional technical specifications from platform version
      manufacturer: platformVersion?.main_manufacturer?.name || '',
      CPU: platformVersion?.cpu || '',
      graphics: platformVersion?.graphics || '',
      memory: platformVersion?.memory || '',
      storage: platformVersion?.storage || '',
      os: platformVersion?.os || '',
      media: platformVersion?.media || '',
      summary: platformVersion?.summary || '',
      
      // Parent platform specific data for reference
      parentPlatformType: parentPlatform?.platform_type?.name || '',
      parentPlatformName: parentPlatform?.name || ''
    };
    
    console.log('[PlatformVersionDetails] === DATA MAPPING DEBUG ===');
    console.log('[PlatformVersionDetails] Platform Version:', platformVersion);
    console.log('[PlatformVersionDetails] Parent Platform:', parentPlatform);
    console.log('[PlatformVersionDetails] Final Console Data:', consoleData);
    console.log('[PlatformVersionDetails] === END DEBUG ===');
    
    onSelect?.(consoleData);
  };

  if (!platformVersion) {
    return null;
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Platform Version Details
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {/* Platform Version Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                {(() => {
                  // Try multiple possible image field paths
                  const imageUrl = platformVersion.platform_logo?.url || 
                                 platformVersion.logo?.url || 
                                 platformVersion.image?.url ||
                                 platformVersion.platform?.platform_logo?.url;
                  
                  return imageUrl ? (
                    <Avatar 
                      src={`https:${imageUrl}`}
                      sx={{ width: 64, height: 64 }}
                    />
                  ) : null;
                })()}
                <Box>
                  <Typography variant="h5" component="h3">
                    {platformVersion.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    {platformVersion.slug && (
                      <Chip label={platformVersion.slug} size="small" variant="outlined" />
                    )}
                    {platformVersion.abbreviation && (
                      <Chip label={platformVersion.abbreviation} size="small" variant="outlined" />
                    )}
                  </Box>
                </Box>
              </Box>
                
                {/* Technical Details */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                  {platformVersion.cpu && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">CPU</Typography>
                      <Typography variant="body2">{platformVersion.cpu}</Typography>
                    </Box>
                  )}
                  {platformVersion.graphics && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Graphics</Typography>
                      <Typography variant="body2">{platformVersion.graphics}</Typography>
                    </Box>
                  )}
                  {platformVersion.memory && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Memory</Typography>
                      <Typography variant="body2">{platformVersion.memory}</Typography>
                    </Box>
                  )}
                  {platformVersion.storage && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Storage</Typography>
                      <Typography variant="body2">{platformVersion.storage}</Typography>
                    </Box>
                  )}
                  {platformVersion.os && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">OS</Typography>
                      <Typography variant="body2">{platformVersion.os}</Typography>
                    </Box>
                  )}
                  {platformVersion.media && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Media</Typography>
                      <Typography variant="body2">{platformVersion.media}</Typography>
                    </Box>
                  )}
                </Box>

                {platformVersion.summary && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">Summary</Typography>
                    <Typography variant="body2">{platformVersion.summary}</Typography>
                  </Box>
                )}

                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  Platform Version ID: {platformVersion.id}
                </Typography>
              </CardContent>
            </Card>

          {/* Parent Platform Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                Parent Platform Information
              </Typography>
              
              {loadingParent ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2">Loading parent platform data...</Typography>
                </Box>
              ) : parentPlatform ? (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box>
                      <Typography variant="h6" component="h4">
                        {parentPlatform.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        {parentPlatform.abbreviation && (
                          <Chip label={parentPlatform.abbreviation} size="small" variant="outlined" color="primary" />
                        )}
                        {parentPlatform.generation && (
                          <Chip label={`Generation: ${parentPlatform.generation}`} size="small" variant="outlined" color="secondary" />
                        )}
                        {parentPlatform.platform_type && (
                          <Chip label={parentPlatform.platform_type.name} size="small" variant="outlined" />
                        )}
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Platform ID</Typography>
                      <Typography variant="body2">{parentPlatform.id}</Typography>
                    </Box>
                    {parentPlatform.alternative_name && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">Alternative Name</Typography>
                        <Typography variant="body2">{parentPlatform.alternative_name}</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No parent platform data found
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Manufacturer Info */}
          {(platformVersion.main_manufacturer || platformVersion.platform) && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Manufacturer: {platformVersion.main_manufacturer?.name || platformVersion.platform?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manufacturer ID: {platformVersion.main_manufacturer?.id || platformVersion.platform?.id}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Console Summary */}
          <Card sx={{ bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: 'success.800', mb: 2 }}>
                Console Data to Add
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, fontSize: '0.875rem' }}>
                <Box><strong>Name:</strong> {platformVersion.name}</Box>
                <Box><strong>Photo:</strong> {platformVersion.platform_logo?.url ? '✓ Available' : '✗ Not available'}</Box>
                <Box><strong>Abbreviation:</strong> {platformVersion.abbreviation || parentPlatform?.abbreviation || 'N/A'} 
                  {platformVersion.abbreviation && parentPlatform?.abbreviation && platformVersion.abbreviation !== parentPlatform.abbreviation && 
                    ` (parent: ${parentPlatform.abbreviation})`}
                </Box>
                <Box><strong>Alt Name:</strong> {platformVersion.alternative_name || parentPlatform?.alternative_name || 'N/A'}</Box>
                <Box><strong>Generation:</strong> {parentPlatform?.generation || platformVersion?.platform?.generation || platformVersion?.generation || 'N/A'}
                  {parentPlatform?.generation && ` (from parent)`}
                </Box>
                <Box><strong>Platform Family:</strong> {parentPlatform?.name || platformVersion?.platform?.name || 'N/A'}
                  {parentPlatform?.name && ` (parent platform)`}
                </Box>
                <Box><strong>Platform Type:</strong> {platformTypeName}
                  {loadingPlatformType && ' (loading...)'}
                  {parentPlatform?.platform_type && ` (from parent: ${parentPlatform.platform_type.name})`}
                </Box>
                <Box><strong>Manufacturer:</strong> {platformVersion.main_manufacturer?.name || 'N/A'}</Box>
                <Box><strong>IGDB Console ID:</strong> {parentPlatform?.id || platformVersion?.platform?.id || 'N/A'}
                  {parentPlatform?.id && ` (parent)`}
                </Box>
                <Box><strong>IGDB Version ID:</strong> {platformVersion?.id}</Box>
                {platformVersion.cpu && <Box><strong>CPU:</strong> {platformVersion.cpu}</Box>}
                {platformVersion.graphics && <Box><strong>Graphics:</strong> {platformVersion.graphics}</Box>}
                {platformVersion.memory && <Box><strong>Memory:</strong> {platformVersion.memory}</Box>}
                {platformVersion.storage && <Box><strong>Storage:</strong> {platformVersion.storage}</Box>}
              </Box>
              
              {(parentPlatform || platformVersion.cpu || platformVersion.graphics) && (
                <Box sx={{ mt: 2, p: 1, bgcolor: 'info.50', borderRadius: 1 }}>
                  <Typography variant="caption" color="info.main" sx={{ fontWeight: 'bold' }}>
                    Data Sources:
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    • Name, photo, specs: Platform Version ({platformVersion.name})
                    {parentPlatform && (
                      <>
                        <br />• Generation, family, console ID: Parent Platform ({parentPlatform.name})
                      </>
                    )}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleSelect}
          variant="contained"
          disabled={loadingParent || loadingPlatformType}
          startIcon={loadingParent || loadingPlatformType ? <CircularProgress size={16} /> : undefined}
        >
          {loadingParent || loadingPlatformType ? 'Loading...' : 'Add as Console'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlatformVersionDetails;