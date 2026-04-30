import { useState } from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';

import { Formik } from 'formik';
import * as yup from 'yup';

import * as userRolesApi from 'api/user-roles';
import useAuth from 'hooks/useAuth';

const validationSchema = yup.object({
  name: yup.string().required('Name is required'),
  scope: yup.string().required('Scope is required')
});

export default function RoleCreateDialog({ open, onClose, onCreated }) {
  const { user } = useAuth();
  const [error, setError] = useState('');

  const isMerchant = user?.role?.scope === 'MERCHANT';

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setError('');
    try {
      await userRolesApi.createUserRole(values);
      resetForm();
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Failed to create role');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <Formik
        initialValues={{ name: '', scope: isMerchant ? 'MERCHANT' : 'SYSTEM' }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, resetForm }) => (
          <form onSubmit={handleSubmit}>
            <DialogTitle>Create Role</DialogTitle>
            <DialogContent>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {typeof error === 'string' ? error : 'Failed to create role'}
                </Alert>
              )}
              <TextField
                fullWidth
                name="name"
                label="Role Name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.name && Boolean(errors.name)}
                helperText={touched.name && errors.name}
                sx={{ mb: 2, mt: 1 }}
              />
              {!isMerchant && (
                <FormControl fullWidth error={touched.scope && Boolean(errors.scope)}>
                  <InputLabel>Scope</InputLabel>
                  <Select name="scope" value={values.scope} onChange={handleChange} onBlur={handleBlur} label="Scope">
                    <MenuItem value="SYSTEM">System</MenuItem>
                    <MenuItem value="MERCHANT">Merchant</MenuItem>
                  </Select>
                  {touched.scope && errors.scope && <FormHelperText>{errors.scope}</FormHelperText>}
                </FormControl>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => { setError(''); resetForm(); onClose(); }} disabled={isSubmitting}>
                Cancel
              </Button>
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
