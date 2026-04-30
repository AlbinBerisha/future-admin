import { useState, useEffect, useMemo } from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';

import { Formik } from 'formik';
import * as yup from 'yup';

import * as userRolesApi from 'api/user-roles';
import useAuth from 'hooks/useAuth';
import PermissionsTable from './PermissionsTable';

const validationSchema = yup.object({
  permissions: yup.array().of(yup.string().required()).min(1, 'At least one permission is required')
});

export default function RoleEditDialog({ open, onClose, role, onUpdated }) {
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [apiPermissions, setApiPermissions] = useState([]);

  const isSystemUser = user?.role?.scope === 'SYSTEM';
  const userPermissions = user?.role?.permissions || [];

  useEffect(() => {
    if (!open) return;
    userRolesApi.getUserPermissions().then((data) => setApiPermissions(data.content || [])).catch(() => setApiPermissions([]));
  }, [open]);

  const allowedPermissions = useMemo(() => {
    if (isSystemUser) {
      // System user editing a merchant role: show only merchant-scoped permissions
      if (role?.scope === 'MERCHANT') {
        return apiPermissions.filter((p) => p.scopes?.includes('MERCHANT')).map((p) => p.name);
      }
      return apiPermissions.map((p) => p.name);
    }
    // Merchant user: show only permissions from their own role
    return apiPermissions.map((p) => p.name).filter((name) => userPermissions.includes(name));
  }, [apiPermissions, isSystemUser, role?.scope, userPermissions]);

  const handleSubmit = async (values, { setSubmitting }) => {
    setError('');
    try {
      await userRolesApi.updateUserRole(role.id, { permissions: values.permissions });
      onUpdated();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Failed to update role');
    } finally {
      setSubmitting(false);
    }
  };

  if (!role) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Formik
        initialValues={{ permissions: role.permissions ? [...role.permissions] : [] }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, handleSubmit, isSubmitting, setFieldValue }) => (
          <form onSubmit={handleSubmit}>
            <DialogTitle>Edit Role &mdash; {role.name}</DialogTitle>
            <DialogContent>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {typeof error === 'string' ? error : 'Failed to update role'}
                </Alert>
              )}
              {touched.permissions && errors.permissions && typeof errors.permissions === 'string' && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {errors.permissions}
                </Alert>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select the permissions to assign to this role.
              </Typography>
              <PermissionsTable
                value={values.permissions}
                onChange={(perms) => setFieldValue('permissions', perms, true)}
                allowedPermissions={allowedPermissions}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => { setError(''); onClose(); }} disabled={isSubmitting}>
                Cancel
              </Button>
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
