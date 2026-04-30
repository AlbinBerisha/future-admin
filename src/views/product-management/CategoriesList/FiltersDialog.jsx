import { useState, useEffect, useCallback } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { Formik } from 'formik';
import * as yup from 'yup';

import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';

import { SUPPORTED_LANGUAGES, FILTER_TYPES } from 'config/languages';
import * as categoriesApi from 'api/categories';

function buildNamesSchema() {
  const shape = {};
  SUPPORTED_LANGUAGES.forEach((lang) => {
    shape[lang.code] = yup.string().required(`${lang.label} name is required`);
  });
  return yup.object(shape);
}

const filterSchema = yup.object({
  names: buildNamesSchema(),
  type: yup.string().required('Filter type is required').oneOf(['TEXT', 'NUMBER', 'COLOR'], 'Invalid filter type')
});

function buildInitialNames() {
  const names = {};
  SUPPORTED_LANGUAGES.forEach((lang) => {
    names[lang.code] = '';
  });
  return names;
}

function FilterForm({ filter, onSave, onCancel }) {
  const isEdit = Boolean(filter?.id);

  return (
    <Formik
      initialValues={{
        names: filter?.names || buildInitialNames(),
        type: filter?.type || ''
      }}
      validationSchema={filterSchema}
      onSubmit={onSave}
      enableReinitialize
    >
      {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <TextField
                key={lang.code}
                fullWidth
                size="small"
                name={`names.${lang.code}`}
                label={`Filter Name (${lang.label})`}
                value={values.names?.[lang.code] || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.names?.[lang.code] && Boolean(errors.names?.[lang.code])}
                helperText={touched.names?.[lang.code] && errors.names?.[lang.code]}
              />
            ))}
            <FormControl fullWidth size="small" error={touched.type && Boolean(errors.type)}>
              <InputLabel>Filter Type</InputLabel>
              <Select name="type" value={values.type} onChange={handleChange} onBlur={handleBlur} label="Filter Type">
                {FILTER_TYPES.map((ft) => (
                  <MenuItem key={ft.value} value={ft.value}>
                    {ft.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button size="small" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                size="small"
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={14} /> : null}
              >
                {isEdit ? 'Save' : 'Add'}
              </Button>
            </Box>
          </Box>
        </form>
      )}
    </Formik>
  );
}

export default function FiltersDialog({ open, onClose, category, onUpdated }) {
  const [filters, setFilters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingFilter, setEditingFilter] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchFilters = useCallback(async () => {
    if (!category) return;
    setLoading(true);
    setError('');
    try {
      const data = await categoriesApi.getCategoryFilters(category.id);
      setFilters(data.content || data || []);
    } catch {
      setError('Failed to load filters');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    if (open && category) {
      fetchFilters();
      setShowForm(false);
      setEditingFilter(null);
    }
  }, [open, category, fetchFilters]);

  const handleSaveFilter = async (values, { setSubmitting, resetForm }) => {
    setError('');
    try {
      if (editingFilter) {
        await categoriesApi.updateFilter(editingFilter.id, { names: values.names });
      } else {
        await categoriesApi.createFilter({ ...values, productCategoryId: category.id });
      }
      resetForm();
      setEditingFilter(null);
      setShowForm(false);
      fetchFilters();
      onUpdated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save filter');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (filter) => {
    if (!window.confirm(`Delete filter "${filter.names?.en || ''}"?`)) return;
    try {
      await categoriesApi.deleteFilter(filter.id);
      fetchFilters();
      onUpdated();
    } catch {
      setError('Failed to delete filter');
    }
  };

  const categoryName = category?.names?.en || '';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Filters — {categoryName}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!showForm && (
          <Box sx={{ mb: 2 }}>
            <Button
              size="small"
              startIcon={<IconPlus size={16} />}
              onClick={() => {
                setEditingFilter(null);
                setShowForm(true);
              }}
            >
              Add Filter
            </Button>
          </Box>
        )}

        {showForm && (
          <Box sx={{ mb: 3, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {editingFilter ? 'Edit Filter' : 'New Filter'}
            </Typography>
            <FilterForm
              filter={editingFilter}
              onSave={handleSaveFilter}
              onCancel={() => {
                setShowForm(false);
                setEditingFilter(null);
              }}
            />
          </Box>
        )}

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <CircularProgress size={20} />
                  </TableCell>
                </TableRow>
              )}
              {!loading && filters.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No filters yet
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {filters.map((filter) => (
                <TableRow key={filter.id} hover>
                  <TableCell>{filter.names?.en || '—'}</TableCell>
                  <TableCell>{filter.type}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => {
                        setEditingFilter(filter);
                        setShowForm(true);
                      }}
                    >
                      <IconEdit size={16} />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(filter)}>
                      <IconTrash size={16} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
