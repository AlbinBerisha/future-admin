import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { DataGrid } from '@mui/x-data-grid';

import { IconEdit, IconTrash, IconUserPlus } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import useAuth from 'hooks/useAuth';
import usePermissions from 'hooks/usePermissions';
import * as usersApi from 'api/users';
import * as userRolesApi from 'api/user-roles';
import UserCreateDialog from './UserCreateDialog';
import UserEditDialog from './UserEditDialog';
import UserDeleteDialog from './UserDeleteDialog';

export default function UsersList() {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await usersApi.getUsers();
      setUsers(data.content || []);
    } catch {
      setNotification({ open: true, message: 'Failed to load users', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const data = await userRolesApi.getUserRoles();
      setRoles(data.content || []);
    } catch {
      // Roles will be empty, forms will show empty dropdown
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditOpen(true);
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setDeleteOpen(true);
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const columns = [
    { field: 'username', headerName: 'Username', flex: 1, minWidth: 130 },
    {
      field: 'fullName',
      headerName: 'Full Name',
      flex: 1,
      minWidth: 180,
      valueGetter: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`
    },
    { field: 'email', headerName: 'Email', flex: 1.5, minWidth: 200 },
    {
      field: 'role',
      headerName: 'Role',
      flex: 0.8,
      minWidth: 130,
      renderCell: (params) => (
        <Chip label={params.value?.name || '—'} size="small" color="primary" variant="outlined" />
      )
    },
    {
      field: 'enabled',
      headerName: 'Status',
      flex: 0.6,
      minWidth: 100,
      renderCell: (params) => (
        <Chip label={params.value ? 'Active' : 'Disabled'} size="small" color={params.value ? 'success' : 'default'} />
      )
    },
    ...(hasPermission('UPDATE_USER') || hasPermission('DELETE_USER')
      ? [{
          field: 'actions',
          headerName: '',
          flex: 0.5,
          minWidth: 100,
          sortable: false,
          filterable: false,
          renderCell: (params) => (
            <Box sx={{ display: 'flex' }}>
              {hasPermission('UPDATE_USER') && (
                <IconButton size="small" color="primary" onClick={() => handleEdit(params.row)}>
                  <IconEdit size={18} />
                </IconButton>
              )}
              {hasPermission('DELETE_USER') && (
                <IconButton size="small" color="error" disabled={params.row.id === user?.id} onClick={() => handleDelete(params.row)}>
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
          title="User Management"
          secondary={
            hasPermission('CREATE_USER') ? (
              <Button variant="contained" startIcon={<IconUserPlus size={18} />} onClick={() => setCreateOpen(true)}>
                Add User
              </Button>
            ) : null
          }
        >
          <DataGrid
            rows={users}
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

      <UserCreateDialog open={createOpen} onClose={() => setCreateOpen(false)} roles={roles.filter((r) => r.scope === 'SYSTEM')} onCreated={() => { fetchUsers(); showNotification('User created successfully'); setCreateOpen(false); }} />

      <UserEditDialog open={editOpen} onClose={() => { setEditOpen(false); setSelectedUser(null); }} user={selectedUser} isSelf={selectedUser?.id === user?.id} roles={roles.filter((r) => selectedUser?.role?.scope === 'MERCHANT' ? r.scope === 'MERCHANT' : r.scope === 'SYSTEM')} onUpdated={() => { fetchUsers(); showNotification('User updated successfully'); setEditOpen(false); setSelectedUser(null); }} />

      <UserDeleteDialog open={deleteOpen} onClose={() => { setDeleteOpen(false); setSelectedUser(null); }} user={selectedUser} onDeleted={() => { fetchUsers(); showNotification('User deleted successfully'); setDeleteOpen(false); setSelectedUser(null); }} />

      <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification((p) => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={notification.severity} onClose={() => setNotification((p) => ({ ...p, open: false }))} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
}
