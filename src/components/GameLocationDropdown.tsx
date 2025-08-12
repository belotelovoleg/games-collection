import React from "react";
import { MenuItem, Select, FormControl, InputLabel } from "@mui/material";

export function GameLocationDropdown({ value, locations, onChange, disabled }: {
  value: string | null;
  locations: { id: string, name: string }[];
  onChange: (id: string | null) => void;
  disabled?: boolean;
}) {
  return (
    <FormControl size="small" fullWidth>
      <InputLabel id="game-location-label">Location</InputLabel>
      <Select
        labelId="game-location-label"
        value={value || ''}
        label="Location"
        onChange={e => onChange(e.target.value === '' ? null : e.target.value as string)}
        disabled={disabled}
      >
        <MenuItem value="">None</MenuItem>
        {locations.map(loc => (
          <MenuItem key={loc.id} value={loc.id}>{loc.name}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
