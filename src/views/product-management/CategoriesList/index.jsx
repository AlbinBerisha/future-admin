import { useState, useEffect, useCallback } from 'react';

import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { IconCategoryPlus } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import usePermissions from 'hooks/usePermissions';
import * as categoriesApi from 'api/categories';
import { buildCategoryTree } from 'api/categories';

import CategoryRow from './CategoryRow';
import CategoryEditDialog from './CategoryEditDialog';
import FiltersDialog from './FiltersDialog';

export default function CategoriesList() {
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission('CREATE_PRODUCT_CATEGORY');
  const canEdit = hasPermission('UPDATE_PRODUCT_CATEGORY');
  const canDelete = hasPermission('DELETE_PRODUCT_CATEGORY');
  const canManageFilters = hasPermission('CREATE_PRODUCT_FILTER');
  const hasAnyAction = canEdit || canCreate || canDelete || canManageFilters;
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [expandedIds, setExpandedIds] = useState(new Set());

  const [editOpen, setEditOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [editParentId, setEditParentId] = useState(null);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filtersCategory, setFiltersCategory] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await categoriesApi.getCategories();
      const flat = data.content || data || [];
      setCategories(buildCategoryTree(flat));
    } catch {
      setNotification({ open: true, message: 'Failed to load categories', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleEdit = (category) => {
    setEditCategory(category);
    setEditParentId(null);
    setEditOpen(true);
  };

  const handleAddChild = (parentCategory) => {
    setEditCategory(null);
    setEditParentId(parentCategory.id);
    setEditOpen(true);
  };

  const handleCreateRoot = () => {
    setEditCategory(null);
    setEditParentId(null);
    setEditOpen(true);
  };

  const handleManageFilters = (category) => {
    setFiltersCategory(category);
    setFiltersOpen(true);
  };

  const handleDelete = async (category) => {
    const name = category.names?.en || `Category #${category.id}`;
    if (!window.confirm(`Delete "${name}" and all its sub-categories?`)) return;
    try {
      await categoriesApi.deleteCategory(category.id);
      fetchCategories();
      showNotification('Category deleted');
    } catch {
      showNotification('Failed to delete category', 'error');
    }
  };

  const handleEditSaved = () => {
    setEditOpen(false);
    setEditCategory(null);
    setEditParentId(null);
    fetchCategories();
    showNotification(editCategory ? 'Category updated' : 'Category created');
  };

  return (
    <Grid container spacing={gridSpacing}>
      <Grid size={12}>
        <MainCard
          title="Product Categories"
          secondary={
            canCreate ? (
              <Button variant="contained" startIcon={<IconCategoryPlus size={18} />} onClick={handleCreateRoot}>
                Add Category
              </Button>
            ) : null
          }
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ pl: 3 }}>Name</TableCell>
                  <TableCell sx={{ width: 120 }}>Filters</TableCell>
                  {hasAnyAction && (
                    <TableCell sx={{ width: 200 }} align="right">
                      Actions
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">Loading...</Typography>
                    </TableCell>
                  </TableRow>
                )}
                {!loading && categories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No categories yet. Click "Add Category" to create one.</Typography>
                    </TableCell>
                  </TableRow>
                )}
                {categories.map((category) => (
                  <CategoryRow
                    key={category.id}
                    category={category}
                    level={0}
                    expandedIds={expandedIds}
                    onToggleExpand={toggleExpand}
                    onEdit={handleEdit}
                    onAddChild={handleAddChild}
                    onManageFilters={handleManageFilters}
                    onDelete={handleDelete}
                    canEdit={canEdit}
                    canCreate={canCreate}
                    canDelete={canDelete}
                    canManageFilters={canManageFilters}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </MainCard>
      </Grid>

      <CategoryEditDialog
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditCategory(null);
          setEditParentId(null);
        }}
        category={editCategory}
        parentId={editParentId}
        onSaved={handleEditSaved}
      />

      <FiltersDialog
        open={filtersOpen}
        onClose={() => {
          setFiltersOpen(false);
          setFiltersCategory(null);
        }}
        category={filtersCategory}
        onUpdated={fetchCategories}
      />

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={notification.severity} onClose={() => setNotification((p) => ({ ...p, open: false }))} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
}
