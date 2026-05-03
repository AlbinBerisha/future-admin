import { useState, useEffect, useCallback } from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router';

import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import * as productsApi from 'api/products';
import { getFileUrl } from 'api/files';
import usePermissions from 'hooks/usePermissions';
import ProductDeleteDialog from './ProductDeleteDialog';

export default function ProductsList() {
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productsApi.getProducts();
      setProducts(data.content || []);
    } catch {
      setNotification({ open: true, message: 'Failed to load products', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const columns = [
    {
      field: 'image',
      headerName: '',
      width: 60,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const imageId = params.row.images?.[0]?.id;
        return imageId ? (
          <Avatar src={getFileUrl(imageId)} variant="rounded" sx={{ width: 36, height: 36 }} />
        ) : (
          <Avatar variant="rounded" sx={{ width: 36, height: 36, bgcolor: 'grey.100' }}>
            <Typography variant="caption" color="text.secondary">
              —
            </Typography>
          </Avatar>
        );
      }
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 160,
      valueGetter: (value, row) => row.names?.en || '---'
    },
    {
      field: 'category',
      headerName: 'Category',
      flex: 0.8,
      minWidth: 140,
      renderCell: (params) =>
        params.row.category ? (
          <Chip label={params.row.category.names?.en || '---'} size="small" variant="outlined" />
        ) : (
          <Typography variant="body2" color="text.secondary">
            —
          </Typography>
        )
    },
    {
      field: 'rating',
      headerName: 'Rating',
      width: 90,
      renderCell: (params) => <Typography variant="body2">{params.value != null ? params.value.toFixed(1) : '—'}</Typography>
    },
    {
      field: 'variants',
      headerName: 'Variants',
      width: 90,
      renderCell: (params) => <Typography variant="body2">{params.row.variants?.length || 0}</Typography>
    },
    ...(hasPermission('UPDATE_PRODUCT') || hasPermission('DELETE_PRODUCT')
      ? [
          {
            field: 'actions',
            headerName: '',
            flex: 0.5,
            minWidth: 100,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
              <Box sx={{ display: 'flex' }}>
                {hasPermission('UPDATE_PRODUCT') && (
                  <IconButton size="small" color="primary" onClick={() => navigate(`/products/${params.row.id}/edit`)}>
                    <IconEdit size={18} />
                  </IconButton>
                )}
                {hasPermission('DELETE_PRODUCT') && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      setSelectedProduct(params.row);
                      setDeleteOpen(true);
                    }}
                  >
                    <IconTrash size={18} />
                  </IconButton>
                )}
              </Box>
            )
          }
        ]
      : [])
  ];

  return (
    <Grid container spacing={gridSpacing}>
      <Grid size={12}>
        <MainCard
          title="Products"
          secondary={
            hasPermission('CREATE_PRODUCT') ? (
              <Button variant="contained" startIcon={<IconPlus size={18} />} onClick={() => navigate('/products/new')}>
                Add Product
              </Button>
            ) : null
          }
        >
          <DataGrid
            rows={products}
            columns={columns}
            getRowId={(row) => row.id}
            loading={loading}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableRowSelectionOnClick
            sx={{ border: 'none', '& .MuiDataGrid-columnHeaders': { borderRadius: 0 } }}
          />
        </MainCard>
      </Grid>

      <ProductDeleteDialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onDeleted={() => {
          fetchProducts();
          showNotification('Product deleted successfully');
          setDeleteOpen(false);
          setSelectedProduct(null);
        }}
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
