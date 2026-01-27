import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { RoomType, DimensionUnit, RoomDimensions } from '../types/domain';

interface RoomConfigPanelProps {
  onConfigComplete: (config: { roomType: RoomType; dimensions: RoomDimensions }) => void;
}

export default function RoomConfigPanel({ onConfigComplete }: RoomConfigPanelProps) {
  const [roomType, setRoomType] = useState<RoomType>(RoomType.LIVING_ROOM);
  const [unit, setUnit] = useState<DimensionUnit>(DimensionUnit.METERS);
  const [length, setLength] = useState<string>('5');
  const [width, setWidth] = useState<string>('4');
  const [height, setHeight] = useState<string>('3');

  const handleSubmit = () => {
    const dimensions: RoomDimensions = {
      length: parseFloat(length),
      width: parseFloat(width),
      height: parseFloat(height),
      unit,
    };
    onConfigComplete({ roomType, dimensions });
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Room Configuration
      </Typography>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Room Type</InputLabel>
        <Select
          value={roomType}
          label="Room Type"
          onChange={(e) => setRoomType(e.target.value as RoomType)}
        >
          <MenuItem value={RoomType.LIVING_ROOM}>Living Room</MenuItem>
          <MenuItem value={RoomType.BEDROOM}>Bedroom</MenuItem>
          <MenuItem value={RoomType.DINING_ROOM}>Dining Room</MenuItem>
          <MenuItem value={RoomType.HOME_OFFICE}>Home Office</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Unit
        </Typography>
        <ToggleButtonGroup
          value={unit}
          exclusive
          onChange={(_, newUnit) => newUnit && setUnit(newUnit)}
          size="small"
        >
          <ToggleButton value={DimensionUnit.METERS}>Meters</ToggleButton>
          <ToggleButton value={DimensionUnit.FEET}>Feet</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <TextField
        fullWidth
        label="Length"
        type="number"
        value={length}
        onChange={(e) => setLength(e.target.value)}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Width"
        type="number"
        value={width}
        onChange={(e) => setWidth(e.target.value)}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Height"
        type="number"
        value={height}
        onChange={(e) => setHeight(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Button variant="contained" fullWidth onClick={handleSubmit}>
        Continue
      </Button>
    </Paper>
  );
}
