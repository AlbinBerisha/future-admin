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

import * as storesApi from 'api/stores';

const validationSchema = yup.object({
  name: yup.string().required('Store name is required'),
  description: yup.string().required('Description is required')
});

export default function StoreCreateDialog({ open, onClose, onCreated }) {
  const [error, setError] = useState('');

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setError('');
    try {
      await storesApi.createStore(values);
      resetForm();
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Failed to create store');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Formik
        initialValues={{ name: '', description: '' }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
          <form onSubmit={handleSubmit}>
            <DialogTitle>Create Store</DialogTitle>
            <DialogContent>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {typeof error === 'string' ? error : 'Failed to create store'}
                </Alert>
              )}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                <TextField
                  fullWidth
                  name="name" label="Store Name"
                  value={values.name} onChange={handleChange} onBlur={handleBlur}
                  error={touched.name && Boolean(errors.name)} helperText={touched.name && errors.name}
                />
                <TextField
                  fullWidth multiline rows={3}
                  name="description" label="Description"
                  value={values.description} onChange={handleChange} onBlur={handleBlur}
                  error={touched.description && Boolean(errors.description)} helperText={touched.description && errors.description}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => { setError(''); onClose(); }} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={18} /> : null}>
                Create
              </Button>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Dialog>
  );
}
