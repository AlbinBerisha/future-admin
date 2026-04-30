import { useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';

import { Formik } from 'formik';
import * as yup from 'yup';

import { SUPPORTED_LANGUAGES } from 'config/languages';
import * as categoriesApi from 'api/categories';

function buildNamesSchema() {
  const shape = {};
  SUPPORTED_LANGUAGES.forEach((lang) => {
    shape[lang.code] = yup.string().required(`${lang.label} name is required`);
  });
  return yup.object(shape);
}

const validationSchema = yup.object({
  names: buildNamesSchema()
});

function buildInitialNames() {
  const names = {};
  SUPPORTED_LANGUAGES.forEach((lang) => {
    names[lang.code] = '';
  });
  return names;
}

export default function CategoryEditDialog({ open, onClose, category, parentId, onSaved }) {
  const [error, setError] = useState('');
  const isEdit = Boolean(category);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setError('');
    try {
      const payload = {
        names: values.names,
        parentCategoryId: isEdit ? (category.parentCategory?.id || null) : (parentId || null)
      };
      if (isEdit) {
        await categoriesApi.updateCategory(category.id, payload);
      } else {
        await categoriesApi.createCategory(payload);
      }
      resetForm();
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || `Failed to ${isEdit ? 'update' : 'create'} category`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = (resetForm) => {
    setError('');
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={() => onClose()} maxWidth="sm" fullWidth>
      <Formik
        initialValues={{
          names: category?.names || buildInitialNames()
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, resetForm }) => (
          <form onSubmit={handleSubmit}>
            <DialogTitle>{isEdit ? 'Edit Category' : 'Create Category'}</DialogTitle>
            <DialogContent>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {typeof error === 'string' ? error : `Failed to ${isEdit ? 'update' : 'create'} category`}
                </Alert>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <TextField
                    key={lang.code}
                    fullWidth
                    size="small"
                    name={`names.${lang.code}`}
                    label={`Name (${lang.label})`}
                    value={values.names?.[lang.code] || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.names?.[lang.code] && Boolean(errors.names?.[lang.code])}
                    helperText={touched.names?.[lang.code] && errors.names?.[lang.code]}
                  />
                ))}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => handleClose(resetForm)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={18} /> : null}
              >
                {isEdit ? 'Save' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Dialog>
  );
}
