import { useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { RoomConfig, RoomType, DimensionUnit } from '../types';

interface RoomConfigPanelProps {
  onComplete: (config: RoomConfig) => void;
}

const RoomConfigPanel = ({ onComplete }: RoomConfigPanelProps) => {
  const [roomType, setRoomType] = useState<RoomType>(RoomType.LIVING_ROOM);
  const [length, setLength] = useState<string>('5');
  const [width, setWidth] = useState<string>('4');
  const [height, setHeight] = useState<string>('3');
  const [unit, setUnit] = useState<DimensionUnit>(DimensionUnit.METERS);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const config: RoomConfig = {
      roomType,
      dimensions: {
        length: parseFloat(length),
        width: parseFloat(width),
        height: parseFloat(height),
        unit,
      },
    };

    onComplete(config);
  };

  const roomTypeLabels: Record<RoomType, string> = {
    [RoomType.LIVING_ROOM]: '客厅 Living Room',
    [RoomType.BEDROOM]: '卧室 Bedroom',
    [RoomType.DINING_ROOM]: '餐厅 Dining Room',
    [RoomType.HOME_OFFICE]: '书房 Home Office',
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        步骤 1: 配置房间 / Step 1: Configure Room
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        请输入您的房间信息 / Please enter your room information
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>房间类型 / Room Type</InputLabel>
          <Select
            value={roomType}
            label="房间类型 / Room Type"
            onChange={(e) => setRoomType(e.target.value as RoomType)}
          >
            {Object.entries(roomTypeLabels).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            单位 / Unit
          </Typography>
          <ToggleButtonGroup
            value={unit}
            exclusive
            onChange={(_, newUnit) => newUnit && setUnit(newUnit)}
            fullWidth
          >
            <ToggleButton value={DimensionUnit.METERS}>
              米 Meters
            </ToggleButton>
            <ToggleButton value={DimensionUnit.FEET}>
              英尺 Feet
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <TextField
          fullWidth
          label="长度 / Length"
          type="number"
          value={length}
          onChange={(e) => setLength(e.target.value)}
          inputProps={{ min: 1, max: 50, step: 0.1 }}
          sx={{ mb: 2 }}
          required
        />

        <TextField
          fullWidth
          label="宽度 / Width"
          type="number"
          value={width}
          onChange={(e) => setWidth(e.target.value)}
          inputProps={{ min: 1, max: 50, step: 0.1 }}
          sx={{ mb: 2 }}
          required
        />

        <TextField
          fullWidth
          label="高度 / Height"
          type="number"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          inputProps={{ min: 2, max: 6, step: 0.1 }}
          sx={{ mb: 3 }}
          required
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
        >
          下一步 / Next
        </Button>
      </Box>
    </Paper>
  );
};

export default RoomConfigPanel;
