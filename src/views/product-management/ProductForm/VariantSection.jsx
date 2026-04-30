import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

import { IconTrash } from '@tabler/icons-react';

import ImageUploadSection from './ImageUploadSection';

export default function VariantSection({
  index,
  categoryFilters = [],
  stores = [],
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
  onRemove,
  canRemove
}) {
  const variantPrefix = `variants.${index}`;
  const variantErrors = errors?.variants?.[index];
  const variantTouched = touched?.variants?.[index];

  const handleImageChange = (imageIds, imagePreviews) => {
    setFieldValue(`${variantPrefix}.imageIds`, imageIds);
    setFieldValue(`${variantPrefix}._imagePreviews`, imagePreviews);
  };

  return (
    <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle2">Variant {index + 1}</Typography>
        {canRemove && (
          <IconButton size="small" color="error" onClick={onRemove}>
            <IconTrash size={16} />
          </IconButton>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          type="number"
          name={`${variantPrefix}.price`}
          label="Price"
          value={values.price ?? ''}
          onChange={handleChange}
          onBlur={handleBlur}
          error={variantTouched?.price && Boolean(variantErrors?.price)}
          helperText={variantTouched?.price && variantErrors?.price}
          inputProps={{ step: '0.01', min: 0 }}
        />
        <TextField
          fullWidth
          size="small"
          type="number"
          name={`${variantPrefix}.stockQuantity`}
          label="Stock Quantity"
          value={values.stockQuantity ?? ''}
          onChange={handleChange}
          onBlur={handleBlur}
          error={variantTouched?.stockQuantity && Boolean(variantErrors?.stockQuantity)}
          helperText={variantTouched?.stockQuantity && variantErrors?.stockQuantity}
          inputProps={{ min: 0 }}
        />
      </Box>

      {categoryFilters.length > 0 && (
        <>
          <Divider sx={{ my: 1.5 }} />
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Attributes
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {categoryFilters.map((filter, attrIndex) => {
              const attrPrefix = `${variantPrefix}.attributes.${attrIndex}`;
              const attrErrors = variantErrors?.attributes?.[attrIndex];
              const attrTouched = variantTouched?.attributes?.[attrIndex];

              return (
                <Box key={filter.id} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <TextField
                    fullWidth
                    size="small"
                    name={`${attrPrefix}.value`}
                    label={filter.names?.en || `Filter ${attrIndex + 1}`}
                    value={values.attributes?.[attrIndex]?.value || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={attrTouched?.value && Boolean(attrErrors?.value)}
                    helperText={attrTouched?.value && attrErrors?.value}
                    type={filter.type === 'NUMBER' ? 'number' : 'text'}
                    inputProps={filter.type === 'COLOR' ? { style: { color: values.attributes?.[attrIndex]?.value || '#000' } } : undefined}
                  />
                </Box>
              );
            })}
          </Box>
        </>
      )}

      {stores.length > 0 && (
        <>
          <Divider sx={{ my: 1.5 }} />
          <FormControl fullWidth size="small">
            <InputLabel>Available Stores</InputLabel>
            <Select
              multiple
              name={`${variantPrefix}.storeIds`}
              value={values.storeIds || []}
              onChange={handleChange}
              label="Available Stores"
            >
              {stores.map((store) => (
                <MenuItem key={store.id} value={store.id}>
                  {store.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </>
      )}

      <Divider sx={{ my: 1.5 }} />
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        Variant Images
      </Typography>
      <ImageUploadSection
        imageIds={values.imageIds || []}
        imagePreviews={values._imagePreviews || []}
        onChange={handleImageChange}
        error={variantTouched?.imageIds && variantErrors?.imageIds}
      />
    </Box>
  );
}
