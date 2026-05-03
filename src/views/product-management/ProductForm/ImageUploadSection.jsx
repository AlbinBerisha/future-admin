import { useState, useRef } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { IconUpload, IconX } from '@tabler/icons-react';

import * as filesApi from 'api/files';

export default function ImageUploadSection({ imageIds = [], imagePreviews = [], onChange, error }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const image = await filesApi.uploadFile(file);
      onChange(
        [...imageIds, image.id],
        [...imagePreviews, { id: image.id, url: filesApi.getFileUrl(image.id), name: image.originalFilename }]
      );
    } catch {
      // Silently fail — could add error state if needed
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = (imageId) => {
    const newIds = imageIds.filter((id) => id !== imageId);
    const newPreviews = imagePreviews.filter((img) => img.id !== imageId);
    onChange(newIds, newPreviews);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={uploading ? <CircularProgress size={14} /> : <IconUpload size={16} />}
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          Upload Image
        </Button>
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleUpload} />
        {error && (
          <Typography variant="caption" color="error">
            {error}
          </Typography>
        )}
      </Box>

      {imagePreviews.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {imagePreviews.map((img) => (
            <Box
              key={img.id}
              sx={{
                position: 'relative',
                width: 80,
                height: 80,
                borderRadius: 1,
                overflow: 'hidden',
                border: 1,
                borderColor: 'divider'
              }}
            >
              <img src={img.url} alt={img.name || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <IconButton
                size="small"
                onClick={() => handleRemove(img.id)}
                sx={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  bgcolor: 'rgba(255,255,255,0.8)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' },
                  width: 20,
                  height: 20
                }}
              >
                <IconX size={12} />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
