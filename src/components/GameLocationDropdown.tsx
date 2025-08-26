import React from "react";
import { Autocomplete, TextField } from "@mui/material";

export function GameLocationDropdown({ value, locations, onChange, disabled }: {
  value: string | null;
  locations: { id: string, name: string }[];
  onChange: (id: string | null) => void;
  disabled?: boolean;
}) {
  // Sort locations alphabetically by name
  const sortedLocations = [...locations].sort((a, b) => a.name.localeCompare(b.name));
  
  // Add "None" option at the beginning
  const allOptions = [
    { id: '', name: 'None' },
    ...sortedLocations
  ];
  
  // Find the current selected option
  const selectedOption = allOptions.find(loc => loc.id === (value || '')) || null;

  return (
    <Autocomplete
      size="small"
      fullWidth
      disabled={disabled}
      options={allOptions}
      getOptionLabel={(option) => option.name}
      value={selectedOption}
      onChange={(event, newValue) => {
        onChange(newValue ? (newValue.id === '' ? null : newValue.id) : null);
      }}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Location"
          placeholder="Select or type location..."
        />
      )}
      noOptionsText="No locations found"
      clearOnBlur
      selectOnFocus
    />
  );
}
