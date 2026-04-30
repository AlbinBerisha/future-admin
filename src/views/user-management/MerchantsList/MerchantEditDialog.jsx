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

import * as merchantsApi from 'api/merchants';

const validationSchema = yup.object({
  name: yup.string().required('Merchant name is required'),
  description: yup.string().required('Description is required')
});

export default function MerchantEditDialog({ open, onClose, merchant, onUpdated }) {
  const [error, setError] = useState('');

  const handleSubmit = async (values, { setSubmitting }) => {
    setError('');
    try {
      await merchantsApi.updateMerchant(merchant.id, values);
      onUpdated();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Failed to update merchant');
    } finally {
      setSubmitting(false);
    }
  };

  if (!merchant) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Formik
        initialValues={{ name: merchant.name || '', description: merchant.description || '' }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
          <form onSubmit={handleSubmit}>
            <DialogTitle>Edit Merchant</DialogTitle>
            <DialogContent>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {typeof error === 'string' ? error : 'Failed to update merchant'}
                </Alert>
              )}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                <TextField
                  fullWidth
                  name="name" label="Merchant Name"
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
                Save
              </Button>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Dialog>
  );
}
