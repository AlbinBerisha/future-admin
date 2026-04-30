import { useState } from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';

import * as merchantsApi from 'api/merchants';

export default function MerchantDeleteDialog({ open, onClose, merchant, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    try {
      await merchantsApi.deleteMerchant(merchant.id);
      onDeleted();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Failed to delete merchant');
    } finally {
      setLoading(false);
    }
  };

  if (!merchant) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete Merchant</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {typeof error === 'string' ? error : 'Failed to delete merchant'}
          </Alert>
        )}
        <Typography>
          Are you sure you want to delete merchant <strong>{merchant.name}</strong>? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => { setError(''); onClose(); }} disabled={loading}>Cancel</Button>
        <Button onClick={handleDelete} variant="contained" color="error" disabled={loading} startIcon={loading ? <CircularProgress size={18} /> : null}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
