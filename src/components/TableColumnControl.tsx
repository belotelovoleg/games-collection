import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, Checkbox, IconButton, ListItemText, ListItemSecondaryAction } from "@mui/material";
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { GameTableColumnSetting } from "./gameTableColumns";

interface TableColumnControlProps {
  open: boolean;
  onClose: () => void;
  columns: GameTableColumnSetting[];
  onChange: (columns: GameTableColumnSetting[]) => void;
  t: any;
}

export const TableColumnControl: React.FC<TableColumnControlProps> = ({ open, onClose, columns, onChange, t }) => {
  const [localColumns, setLocalColumns] = useState<GameTableColumnSetting[]>(columns);

  // Handle show/hide
  const handleToggleVisible = (idx: number) => {
    const updated = [...localColumns];
    updated[idx].visible = !updated[idx].visible;
    setLocalColumns(updated);
  };

  // Handle reorder (simple up/down)
  const handleMove = (idx: number, direction: "up" | "down") => {
    const updated = [...localColumns];
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= updated.length) return;
    const temp = updated[idx];
    updated[idx] = updated[newIdx];
    updated[newIdx] = temp;
    setLocalColumns(updated);
  };

  // Save changes
  const handleApply = () => {
    // Update order property
    const withOrder = localColumns.map((col, idx) => ({ ...col, order: idx }));
    onChange(withOrder);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("games_tableColumnControl") || "Table Columns"}</DialogTitle>
      <DialogContent>
        <List>
          {localColumns.map((col, idx) => {
            const translationKey = `games_${col.key}`;
            return (
              <ListItem key={col.key} disableGutters>
                <Checkbox
                  checked={col.visible}
                  onChange={() => handleToggleVisible(idx)}
                />
                <ListItemText primary={t(translationKey) || col.label} />
                <ListItemSecondaryAction>
                  <IconButton onClick={() => handleMove(idx, "up")} disabled={idx === 0} size="small">
                    ↑
                  </IconButton>
                  <IconButton onClick={() => handleMove(idx, "down")} disabled={idx === localColumns.length - 1} size="small">
                    ↓
                  </IconButton>
                  <DragHandleIcon fontSize="small" sx={{ ml: 1, opacity: 0.5 }} />
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common_cancel") || "Cancel"}</Button>
        <Button onClick={handleApply} variant="contained">{t("common_apply") || "Apply"}</Button>
      </DialogActions>
    </Dialog>
  );
};
