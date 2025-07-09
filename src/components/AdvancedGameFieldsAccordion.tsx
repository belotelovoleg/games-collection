import React, { useEffect, useState } from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, TextField, Button, Select, MenuItem, Autocomplete } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export interface AdvancedFields {
  alternativeNames: string[];
  genres: string[];
  franchises: string[];
  platforms: number[];
  developer: string[];
  publisher: string[];
  releaseYear: number | null;
}

interface PlatformOption {
  id: number;
  name: string;
}

interface AdvancedGameFieldsAccordionProps {
  value: AdvancedFields;
  onChange: (fields: AdvancedFields) => void;
  genreOptions: string[];
  platformOptions: PlatformOption[];
  loadingGenres: boolean;
  loadingPlatforms: boolean;
  yearOptions: number[];
}

export default function AdvancedGameFieldsAccordion({
  value,
  onChange,
  genreOptions,
  platformOptions,
  loadingGenres,
  loadingPlatforms,
  yearOptions,
}: AdvancedGameFieldsAccordionProps) {
  // Array field helpers
  const handleArrayChange = (field: keyof AdvancedFields, val: string | number, idx?: number) => {
    const arr = Array.isArray(value[field]) ? [...(value[field] as any[])] : [];
    if (typeof idx === 'number') {
      arr[idx] = val;
    } else {
      arr.push(val);
    }
    onChange({ ...value, [field]: arr });
  };
  const handleArrayRemove = (field: keyof AdvancedFields, idx: number) => {
    const arr = Array.isArray(value[field]) ? [...(value[field] as any[])] : [];
    arr.splice(idx, 1);
    onChange({ ...value, [field]: arr });
  };

  return (
    <Accordion sx={{ mt: 2 }} defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle2">Advanced Game Fields</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {/* alternativeNames */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>Alternative Names</Typography>
          {value.alternativeNames.map((name, idx) => (
            <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                value={name}
                onChange={e => handleArrayChange('alternativeNames', e.target.value, idx)}
                size="small"
                sx={{ flex: 1 }}
              />
              <Button onClick={() => handleArrayRemove('alternativeNames', idx)} size="small">-</Button>
            </Box>
          ))}
          <Button onClick={() => handleArrayChange('alternativeNames', '')} size="small">Add Name</Button>
        </Box>

        {/* genres */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>Genres</Typography>
          <Autocomplete
            multiple
            options={genreOptions}
            loading={loadingGenres}
            value={value.genres}
            onChange={(_, val) => onChange({ ...value, genres: val })}
            renderInput={params => <TextField {...params} size="small" label="Select Genres" />}
          />
        </Box>

        {/* franchises */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>Franchises</Typography>
          {value.franchises.map((name, idx) => (
            <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                value={name}
                onChange={e => handleArrayChange('franchises', e.target.value, idx)}
                size="small"
                sx={{ flex: 1 }}
              />
              <Button onClick={() => handleArrayRemove('franchises', idx)} size="small">-</Button>
            </Box>
          ))}
          <Button onClick={() => handleArrayChange('franchises', '')} size="small">Add Franchise</Button>
        </Box>

        {/* platforms */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>Platforms</Typography>
          <Autocomplete
            multiple
            options={platformOptions}
            loading={loadingPlatforms}
            getOptionLabel={opt => opt.name}
            value={platformOptions.filter(opt => value.platforms.includes(opt.id))}
            onChange={(_, val) => onChange({ ...value, platforms: val.map(v => v.id) })}
            renderInput={params => <TextField {...params} size="small" label="Select Platforms" />}
          />
        </Box>

        {/* developer */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>Developer(s)</Typography>
          {value.developer.map((name, idx) => (
            <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                value={name}
                onChange={e => handleArrayChange('developer', e.target.value, idx)}
                size="small"
                sx={{ flex: 1 }}
              />
              <Button onClick={() => handleArrayRemove('developer', idx)} size="small">-</Button>
            </Box>
          ))}
          <Button onClick={() => handleArrayChange('developer', '')} size="small">Add Developer</Button>
        </Box>

        {/* publisher */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>Publisher(s)</Typography>
          {value.publisher.map((name, idx) => (
            <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                value={name}
                onChange={e => handleArrayChange('publisher', e.target.value, idx)}
                size="small"
                sx={{ flex: 1 }}
              />
              <Button onClick={() => handleArrayRemove('publisher', idx)} size="small">-</Button>
            </Box>
          ))}
          <Button onClick={() => handleArrayChange('publisher', '')} size="small">Add Publisher</Button>
        </Box>

        {/* releaseYear */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>Release Year</Typography>
          <Select
            value={value.releaseYear || ''}
            onChange={e => onChange({ ...value, releaseYear: Number(e.target.value) })}
            displayEmpty
            size="small"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value=""><em>None</em></MenuItem>
            {yearOptions.map(y => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </Select>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
