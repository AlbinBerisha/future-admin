import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { DataGrid } from '@mui/x-data-grid';

import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import * as userRolesApi from 'api/user-roles';
import useAuth from 'hooks/useAuth';
import usePermissions from 'hooks/usePermissions';
import RoleCreateDialog from './RoleCreateDialog';
import RoleEditDialog from './RoleEditDialog';
import RoleDeleteDialog from './RoleDeleteDialog';

export default function RolesList() {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userRolesApi.getUserRoles();
      setRoles(data.content || []);
    } catch {
      setNotification({ open: true, message: 'Failed to load roles', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const columns = [
    { field: 'name', headerName: 'Role Name', flex: 1, minWidth: 160 },
    {
      field: 'scope',
      headerName: 'Scope',
      flex: 0.7,
      minWidth: 120,
      renderCell: (params) => <Chip label={params.value} size="small" color={params.value === 'SYSTEM' ? 'primary' : 'secondary'} variant="outlined" />
    },
    {
      field: 'permissions',
      headerName: 'Permissions',
      flex: 2,
      minWidth: 300,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {(params.value || []).slice(0, 4).map((p) => (
            <Chip key={p} label={p} size="small" variant="outlined" />
          ))}
          {params.value?.length > 4 && <Chip label={`+${params.value.length - 4}`} size="small" />}
        </Box>
      )
    },
    ...(hasPermission('UPDATE_USER_ROLE') || hasPermission('DELETE_USER_ROLE')
      ? [{
          field: 'actions',
          headerName: '',
          flex: 0.5,
          minWidth: 100,
          sortable: false,
          filterable: false,
          renderCell: (params) => (
            <Box sx={{ display: 'flex' }}>
              {hasPermission('UPDATE_USER_ROLE') && (
                <IconButton size="small" color="primary" disabled={params.row.id === user?.role?.id} onClick={() => { setSelectedRole(params.row); setEditOpen(true); }}>
                  <IconEdit size={18} />
                </IconButton>
              )}
              {hasPermission('DELETE_USER_ROLE') && (
                <IconButton size="small" color="error" disabled={params.row.id === user?.role?.id} onClick={() => { setSelectedRole(params.row); setDeleteOpen(true); }}>
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
          title="Roles"
          secondary={
            hasPermission('CREATE_USER_ROLE') ? (
              <Button variant="contained" startIcon={<IconPlus size={18} />} onClick={() => setCreateOpen(true)}>
                Add Role
              </Button>
            ) : null
          }
        >
          <DataGrid
            rows={roles}
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

      <RoleCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => { fetchRoles(); showNotification('Role created successfully'); setCreateOpen(false); }}
      />

      <RoleEditDialog
        open={editOpen}
        onClose={() => { setEditOpen(false); setSelectedRole(null); }}
        role={selectedRole}
        onUpdated={() => { fetchRoles(); showNotification('Role updated successfully'); setEditOpen(false); setSelectedRole(null); }}
      />

      <RoleDeleteDialog
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setSelectedRole(null); }}
        role={selectedRole}
        onDeleted={() => { fetchRoles(); showNotification('Role deleted successfully'); setDeleteOpen(false); setSelectedRole(null); }}
      />

      <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification((p) => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={notification.severity} onClose={() => setNotification((p) => ({ ...p, open: false }))} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
}
