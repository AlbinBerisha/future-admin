import { useState } from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';

import * as productsApi from 'api/products';

export default function ProductDeleteDialog({ open, onClose, product, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    try {
      await productsApi.deleteProduct(product.id);
      onDeleted();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete Product</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {typeof error === 'string' ? error : 'Failed to delete product'}
          </Alert>
        )}
        <Typography>
          Are you sure you want to delete product <strong>{product.names?.en || product.id}</strong>? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setError('');
            onClose();
          }}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} /> : null}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
