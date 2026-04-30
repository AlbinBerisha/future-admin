import { useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { FieldArray, Formik } from 'formik';
import * as yup from 'yup';

import { IconPlus, IconTrash } from '@tabler/icons-react';

import * as merchantsApi from 'api/merchants';

const storeSchema = yup.object({
  name: yup.string().required('Store name is required'),
  description: yup.string().required('Description is required')
});

const validationSchema = yup.object({
  name: yup.string().required('Merchant name is required'),
  description: yup.string().required('Description is required'),
  mainUser: yup.object({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    username: yup.string().required('Username is required'),
    password: yup.string().min(6, 'Min 6 characters').required('Password is required'),
    roleId: yup.string().required('Role is required'),
    enabled: yup.boolean()
  }),
  stores: yup.array().of(storeSchema).min(1, 'At least one store is required')
});

export default function MerchantCreateDialog({ open, onClose, roles, onCreated }) {
  const [error, setError] = useState('');

  const merchantRoles = roles.filter((role) => role.scope === 'MERCHANT');

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setError('');
    try {
      await merchantsApi.createMerchant(values);
      resetForm();
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Failed to create merchant');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Formik
        initialValues={{
          name: '',
          description: '',
          mainUser: { firstName: '', lastName: '', email: '', username: '', password: '', roleId: '', enabled: true },
          stores: [{ name: '', description: '' }]
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, resetForm }) => (
          <form onSubmit={handleSubmit}>
            <DialogTitle>Create Merchant</DialogTitle>
            <DialogContent>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {typeof error === 'string' ? error : 'Failed to create merchant'}
                </Alert>
              )}

              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Merchant Details
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth size="small"
                    name="name" label="Merchant Name"
                    value={values.name} onChange={handleChange} onBlur={handleBlur}
                    error={touched.name && Boolean(errors.name)} helperText={touched.name && errors.name}
                  />
                </Box>
                <TextField
                  fullWidth size="small" multiline rows={2}
                  name="description" label="Description"
                  value={values.description} onChange={handleChange} onBlur={handleBlur}
                  error={touched.description && Boolean(errors.description)} helperText={touched.description && errors.description}
                />
              </Box>

              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Main User
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth size="small"
                    name="mainUser.firstName" label="First Name"
                    value={values.mainUser.firstName} onChange={handleChange} onBlur={handleBlur}
                    error={touched.mainUser?.firstName && Boolean(errors.mainUser?.firstName)}
                    helperText={touched.mainUser?.firstName && errors.mainUser?.firstName}
                  />
                  <TextField
                    fullWidth size="small"
                    name="mainUser.lastName" label="Last Name"
                    value={values.mainUser.lastName} onChange={handleChange} onBlur={handleBlur}
                    error={touched.mainUser?.lastName && Boolean(errors.mainUser?.lastName)}
                    helperText={touched.mainUser?.lastName && errors.mainUser?.lastName}
                  />
                </Box>
                <TextField
                  fullWidth size="small"
                  name="mainUser.email" label="Email" type="email"
                  value={values.mainUser.email} onChange={handleChange} onBlur={handleBlur}
                  error={touched.mainUser?.email && Boolean(errors.mainUser?.email)}
                  helperText={touched.mainUser?.email && errors.mainUser?.email}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth size="small"
                    name="mainUser.username" label="Username"
                    value={values.mainUser.username} onChange={handleChange} onBlur={handleBlur}
                    error={touched.mainUser?.username && Boolean(errors.mainUser?.username)}
                    helperText={touched.mainUser?.username && errors.mainUser?.username}
                  />
                  <TextField
                    fullWidth size="small"
                    name="mainUser.password" label="Password" type="password"
                    value={values.mainUser.password} onChange={handleChange} onBlur={handleBlur}
                    error={touched.mainUser?.password && Boolean(errors.mainUser?.password)}
                    helperText={touched.mainUser?.password && errors.mainUser?.password}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl fullWidth size="small" error={touched.mainUser?.roleId && Boolean(errors.mainUser?.roleId)}>
                    <InputLabel>Role</InputLabel>
                    <Select
                      name="mainUser.roleId" value={values.mainUser.roleId}
                      onChange={handleChange} onBlur={handleBlur} label="Role"
                    >
                      {merchantRoles.map((role) => (
                        <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />
              <FieldArray name="stores">
                {({ push, remove }) => (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Stores</Typography>
                      <Button size="small" startIcon={<IconPlus size={16} />} onClick={() => push({ name: '', description: '' })}>
                        Add Store
                      </Button>
                    </Box>
                    {typeof errors.stores === 'string' && (
                      <Alert severity="warning" sx={{ mb: 1 }}>{errors.stores}</Alert>
                    )}
                    {values.stores.map((store, index) => (
                      <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'flex-start' }}>
                        <TextField
                          fullWidth size="small"
                          name={`stores.${index}.name`} label="Store Name"
                          value={store.name} onChange={handleChange} onBlur={handleBlur}
                          error={touched.stores?.[index]?.name && Boolean(errors.stores?.[index]?.name)}
                          helperText={touched.stores?.[index]?.name && errors.stores?.[index]?.name}
                        />
                        <TextField
                          fullWidth size="small"
                          name={`stores.${index}.description`} label="Description"
                          value={store.description} onChange={handleChange} onBlur={handleBlur}
                          error={touched.stores?.[index]?.description && Boolean(errors.stores?.[index]?.description)}
                          helperText={touched.stores?.[index]?.description && errors.stores?.[index]?.description}
                        />
                        {values.stores.length > 1 && (
                          <IconButton size="small" color="error" onClick={() => remove(index)} sx={{ mt: 0.5 }}>
                            <IconTrash size={18} />
                          </IconButton>
                        )}
                      </Box>
                    ))}
                  </>
                )}
              </FieldArray>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => { setError(''); resetForm(); onClose(); }} disabled={isSubmitting}>Cancel</Button>
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
