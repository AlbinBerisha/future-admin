import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import { DataGrid } from '@mui/x-data-grid';

import { IconEdit, IconTrash, IconBuildingStore } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import Chip from '@mui/material/Chip';

import * as storesApi from 'api/stores';
import usePermissions from 'hooks/usePermissions';
import useAuth from 'hooks/useAuth';
import StoreCreateDialog from './StoreCreateDialog';
import StoreEditDialog from './StoreEditDialog';
import StoreDeleteDialog from './StoreDeleteDialog';

export default function StoresList() {
  const { hasPermission } = usePermissions();
  const { user } = useAuth();
  const isSystemUser = user?.role?.scope === 'SYSTEM';
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const data = await storesApi.getStores();
      setStores(data.content || []);
    } catch {
      setNotification({ open: true, message: 'Failed to load stores', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 160 },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1.5,
      minWidth: 200,
      renderCell: (params) => (
        <Typography variant="body2" noWrap>{params.value}</Typography>
      )
    },
    ...(isSystemUser
      ? [{
          field: 'merchant',
          headerName: 'Merchant',
          flex: 1,
          minWidth: 150,
          renderCell: (params) =>
            params.value ? (
              <Chip label={params.value.name} size="small" variant="outlined" />
            ) : (
              <Typography variant="body2" color="text.secondary">—</Typography>
            )
        }]
      : []),
    ...(hasPermission('UPDATE_STORE') || hasPermission('DELETE_STORE')
      ? [{
          field: 'actions',
          headerName: '',
          flex: 0.5,
          minWidth: 100,
          sortable: false,
          filterable: false,
          renderCell: (params) => (
            <Box sx={{ display: 'flex' }}>
              {hasPermission('UPDATE_STORE') && (
                <IconButton size="small" color="primary" onClick={() => { setSelectedStore(params.row); setEditOpen(true); }}>
                  <IconEdit size={18} />
                </IconButton>
              )}
              {hasPermission('DELETE_STORE') && (
                <IconButton size="small" color="error" onClick={() => { setSelectedStore(params.row); setDeleteOpen(true); }}>
                  <IconTrash size={18} />
                </IconButton>
              )}
            </Box>
          )
        }]
      : [])
  ];

  return (
    <Grid container spacing={gridSpacing}>
      <Grid size={12}>
        <MainCard
          title="Stores"
          secondary={
            hasPermission('CREATE_STORE') ? (
              <Button variant="contained" startIcon={<IconBuildingStore size={18} />} onClick={() => setCreateOpen(true)}>
                Add Store
              </Button>
            ) : null
          }
        >
          <DataGrid
            rows={stores}
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

      <StoreCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => { fetchStores(); showNotification('Store created successfully'); setCreateOpen(false); }}
      />

      <StoreEditDialog
        open={editOpen}
        onClose={() => { setEditOpen(false); setSelectedStore(null); }}
        store={selectedStore}
        onUpdated={() => { fetchStores(); showNotification('Store updated successfully'); setEditOpen(false); setSelectedStore(null); }}
      />

      <StoreDeleteDialog
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setSelectedStore(null); }}
        store={selectedStore}
        onDeleted={() => { fetchStores(); showNotification('Store deleted successfully'); setDeleteOpen(false); setSelectedStore(null); }}
      />

      <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification((p) => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={notification.severity} onClose={() => setNotification((p) => ({ ...p, open: false }))} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
}
