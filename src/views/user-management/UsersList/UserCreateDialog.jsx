import { useState } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

import { Formik } from 'formik';
import * as yup from 'yup';

import * as usersApi from 'api/users';
import UserFormFields from './UserFormFields';

const validationSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  username: yup.string().required('Username is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  roleId: yup.string().required('Role is required'),
  enabled: yup.boolean()
});

export default function UserCreateDialog({ open, onClose, roles, onCreated }) {
  const [error, setError] = useState('');

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setError('');
    try {
      await usersApi.createUser(values);
      resetForm();
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Failed to create user');
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Formik
        initialValues={{ firstName: '', lastName: '', email: '', username: '', password: '', roleId: '', enabled: true }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, resetForm }) => (
          <form onSubmit={handleSubmit}>
            <DialogTitle>Create New User</DialogTitle>
            <DialogContent>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {typeof error === 'string' ? error : 'Failed to create user'}
                </Alert>
              )}
              <UserFormFields
                values={values}
                errors={errors}
                touched={touched}
                handleChange={handleChange}
                handleBlur={handleBlur}
                roles={roles}
                isEdit={false}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => handleClose(resetForm)} disabled={isSubmitting}>
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
