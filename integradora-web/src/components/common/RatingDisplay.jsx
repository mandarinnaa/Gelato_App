// src/components/common/RatingDisplay.jsx

import React from 'react';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';

const RatingDisplay = ({ value, readOnly = true, size = "medium", showText = true, precision = 0.5, onChange }) => {
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Rating
        name="product-rating"
        value={parseFloat(value) || 0}
        precision={precision}
        readOnly={readOnly}
        size={size}
        onChange={(event, newValue) => {
          if (onChange && !readOnly) {
            onChange(newValue);
          }
        }}
        sx={{
          '& .MuiRating-iconFilled': {
            color: '#fbbf24', // Amarillo dorado
          },
          '& .MuiRating-iconHover': {
            color: '#f59e0b',
          },
        }}
      />
      {showText && (
        <span className="text-sm font-medium text-gray-700">
          {parseFloat(value).toFixed(1)}
        </span>
      )}
    </Stack>
  );
};

export default RatingDisplay;