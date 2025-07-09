import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslations } from '@/hooks/useTranslations';

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
}

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 60 }, (_, i) => currentYear - i);

export default function AdvancedGameFieldsAccordion(props: AdvancedGameFieldsAccordionProps) {
  const { value, onChange, genreOptions, platformOptions, loadingGenres, loadingPlatforms } = props;
  const { t } = useTranslations();
  // Helper for array fields
  const handleArrayChange = (field: keyof AdvancedFields, val: string, idx?: number) => {
    const arr = Array.isArray(value[field]) ? [...(value[field] as string[])] : [];
    if (typeof idx === 'number') {
      arr[idx] = val;
    } else {
      arr.push(val);
    }
    onChange({ ...value, [field]: arr });
  };
  const handleArrayRemove = (field: keyof AdvancedFields, idx: number) => {
    const arr = Array.isArray(value[field]) ? [...(value[field] as string[])] : [];
    arr.splice(idx, 1);
    onChange({ ...value, [field]: arr });
  };

  return (
    <Accordion sx={{ mt: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle2">{t('games_advancedFields') || 'Advanced Game Fields'}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {/* alternativeNames */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>{t('games_alternativeNames') || 'Alternative Names'}</Typography>
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
          <Button onClick={() => handleArrayChange('alternativeNames', '')} size="small">{t('games_addName') || 'Add Name'}</Button>
        </Box>

        {/* genres */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>{t('games_genres') || t('games_genre') || 'Genres'}</Typography>
          <Autocomplete
            multiple
            options={genreOptions}
            loading={loadingGenres}
            value={value.genres}
            onChange={(_, val) => onChange({ ...value, genres: val })}
            renderInput={params => <TextField {...params} size="small" label={t('games_selectGenres') || 'Select Genres'} />}
          />
        </Box>

        {/* franchises */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>{t('games_franchises') || 'Franchises'}</Typography>
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
          <Button onClick={() => handleArrayChange('franchises', '')} size="small">{t('games_addFranchise') || 'Add Franchise'}</Button>
        </Box>

        {/* platforms */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>{t('games_platforms') || 'Platforms'}</Typography>
          <Autocomplete
            multiple
            options={platformOptions}
            loading={loadingPlatforms}
            getOptionLabel={opt => opt.name}
            value={platformOptions.filter(opt => value.platforms.includes(opt.id))}
            onChange={(_, val) => onChange({ ...value, platforms: val.map(v => v.id) })}
            renderInput={params => <TextField {...params} size="small" label={t('games_selectPlatforms') || 'Select Platforms'} />}
          />
        </Box>

        {/* developer */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>{t('games_developer') || 'Developer(s)'}</Typography>
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
          <Button onClick={() => handleArrayChange('developer', '')} size="small">{t('games_addDeveloper') || 'Add Developer'}</Button>
        </Box>

        {/* publisher */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>{t('games_publisher') || 'Publisher(s)'}</Typography>
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
          <Button onClick={() => handleArrayChange('publisher', '')} size="small">{t('games_addPublisher') || 'Add Publisher'}</Button>
        </Box>

        {/* releaseYear */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>{t('games_releaseYear') || 'Release Year'}</Typography>
          <Select
            value={value.releaseYear || ''}
            onChange={e => onChange({ ...value, releaseYear: Number(e.target.value) })}
            displayEmpty
            size="small"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value=""><em>{t('games_none') || 'None'}</em></MenuItem>
            {yearOptions.map(y => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </Select>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
