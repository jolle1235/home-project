"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Paper,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Grid2 as Grid } from '@mui/material';


interface CalendarDialogProps {
  open: boolean;
  onClose: () => void;
  onDone: (selectedDates: string[]) => void;
  availableDates: Date[];
}

export default function CalendarDialog({
  open,
  onClose,
  onDone,
  availableDates,
}: CalendarDialogProps) {
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const theme = useTheme();

  const toggleDate = (date: Date) => {
    const dateKey = date.toISOString().split("T")[0];
    const newSet = new Set(selectedDates);
    if (newSet.has(dateKey)) {
      newSet.delete(dateKey);
    } else {
      newSet.add(dateKey);
    }
    setSelectedDates(newSet);
  };

  const handleDone = () => {
    onDone(Array.from(selectedDates));
    setSelectedDates(new Set());
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Select Dates</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {availableDates.map((date) => {
            const dateKey = date.toISOString().split("T")[0];
            const isSelected = selectedDates.has(dateKey);
            return (
              <Grid size={3} key={dateKey}>
                <Paper
                  onClick={() => toggleDate(date)}
                  sx={{
                    p: 1,
                    textAlign: "center",
                    cursor: "pointer",
                    backgroundColor: isSelected
                      ? theme.palette.primary.main
                      : theme.palette.background.default,
                    color: isSelected
                      ? theme.palette.primary.contrastText
                      : theme.palette.text.primary,
                  }}
                >
                  <Typography variant="body2">
                    {date.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </Typography>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleDone} variant="contained">
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
