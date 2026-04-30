import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import { DataGrid } from '@mui/x-data-grid';

import { IconEdit, IconTrash, IconBuildingPlus } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import * as merchantsApi from 'api/merchants';
import * as userRolesApi from 'api/user-roles';
import usePermissions from 'hooks/usePermissions';
import MerchantCreateDialog from './MerchantCreateDialog';
import MerchantEditDialog from './MerchantEditDialog';
import MerchantDeleteDialog from './MerchantDeleteDialog';

export default function MerchantsList() {
  const { hasPermission } = usePermissions();
  const [merchants, setMerchants] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState(null);

  const fetchMerchants = useCallback(async () => {
    setLoading(true);
    try {
      const data = await merchantsApi.getMerchants();
      setMerchants(data.content || []);
    } catch {
      setNotification({ open: true, message: 'Failed to load merchants', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const data = await userRolesApi.getUserRoles();
      setRoles(data.content || []);
    } catch {
      // Roles will be empty
    }
  }, []);

  useEffect(() => {
    fetchMerchants();
    fetchRoles();
  }, [fetchMerchants, fetchRoles]);

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
    {
      field: 'mainUser',
      headerName: 'Main User',
      flex: 1,
      minWidth: 150,
      renderCell: (params) =>
        params.value ? (
          <Chip label={params.value.username} size="small" variant="outlined" />
        ) : (
          <Typography variant="body2" color="text.secondary">—</Typography>
        )
    },
    ...(hasPermission('UPDATE_MERCHANT') || hasPermission('DELETE_MERCHANT')
      ? [{
          field: 'actions',
          headerName: '',
          flex: 0.5,
          minWidth: 100,
          sortable: false,
          filterable: false,
          renderCell: (params) => (
            <Box sx={{ display: 'flex' }}>
              {hasPermission('UPDATE_MERCHANT') && (
                <IconButton size="small" color="primary" onClick={() => { setSelectedMerchant(params.row); setEditOpen(true); }}>
                  <IconEdit size={18} />
                </IconButton>
              )}
              {hasPermission('DELETE_MERCHANT') && (
                <IconButton size="small" color="error" onClick={() => { setSelectedMerchant(params.row); setDeleteOpen(true); }}>
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
          title="Merchants"
          secondary={
            hasPermission('CREATE_MERCHANT') ? (
              <Button variant="contained" startIcon={<IconBuildingPlus size={18} />} onClick={() => setCreateOpen(true)}>
                Add Merchant
              </Button>
            ) : null
          }
        >
          <DataGrid
            rows={merchants}
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

      <MerchantCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        roles={roles}
        onCreated={() => { fetchMerchants(); showNotification('Merchant created successfully'); setCreateOpen(false); }}
      />

      <MerchantEditDialog
        open={editOpen}
        onClose={() => { setEditOpen(false); setSelectedMerchant(null); }}
        merchant={selectedMerchant}
        onUpdated={() => { fetchMerchants(); showNotification('Merchant updated successfully'); setEditOpen(false); setSelectedMerchant(null); }}
      />

      <MerchantDeleteDialog
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setSelectedMerchant(null); }}
        merchant={selectedMerchant}
        onDeleted={() => { fetchMerchants(); showNotification('Merchant deleted successfully'); setDeleteOpen(false); setSelectedMerchant(null); }}
      />

      <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification((p) => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={notification.severity} onClose={() => setNotification((p) => ({ ...p, open: false }))} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
}
