import { useMemo } from 'react';

import Checkbox from '@mui/material/Checkbox';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

const ACTIONS = ['CREATE', 'VIEW', 'UPDATE', 'DELETE'];
const EXTRA_ACTIONS = { STORE: ['VIEW_STORE_FEATURE'], PRODUCT_FILTER: ['CREATE_PRODUCT_FILTER'] };

function getLabel(action) {
  switch (action) {
    case 'CREATE':
      return 'Create';
    case 'VIEW':
      return 'View';
    case 'UPDATE':
      return 'Update';
    case 'DELETE':
      return 'Delete';
    case 'VIEW_STORE_FEATURE':
      return 'View Feature';
    case 'CREATE_PRODUCT_FILTER':
      return 'Create Filter';
    default:
      return action;
  }
}

export default function PermissionsTable({ value, onChange, allowedPermissions }) {
  const resources = useMemo(() => {
    const map = {};
    value.forEach((p) => {
      const parts = p.split('_');
      // Handle multi-word resources like PRODUCT_CATEGORY, STORE_FEATURE, etc.
      let resource, action;
      if (p.startsWith('CREATE_PRODUCT_FILTER')) {
        resource = 'PRODUCT_FILTER';
        action = 'CREATE';
      } else if (p === 'VIEW_STORE_FEATURE') {
        resource = 'STORE_FEATURE';
        action = 'VIEW';
      } else {
        action = parts[0];
        resource = parts.slice(1).join('_');
      }
      if (!map[resource]) map[resource] = new Set();
      map[resource].add(action);
    });
    return map;
  }, [value]);

  const allPermissions = useMemo(() => {
    const perms = [...(allowedPermissions || [])];
    const grouped = {};

    perms.forEach((p) => {
      let resource, action;
      if (p === 'CREATE_PRODUCT_FILTER') {
        resource = 'PRODUCT_FILTER';
        action = 'CREATE';
      } else if (p === 'VIEW_STORE_FEATURE') {
        resource = 'STORE';
        action = 'VIEW_FEATURE';
      } else {
        const parts = p.split('_');
        action = parts[0];
        resource = parts.slice(1).join('_');
      }

      if (!grouped[resource]) grouped[resource] = [];
      grouped[resource].push({ action, permission: p });
    });

    return grouped;
  }, [allowedPermissions]);

  const toggle = (permission) => {
    if (value.includes(permission)) {
      onChange(value.filter((p) => p !== permission));
    } else {
      onChange([...value, permission]);
    }
  };

  const toggleAll = (perms) => {
    const allSelected = perms.every((p) => value.includes(p));
    if (allSelected) {
      onChange(value.filter((p) => !perms.includes(p)));
    } else {
      onChange([...new Set([...value, ...perms])]);
    }
  };

  const resourceLabels = {
    USER: 'Users',
    USER_ROLE: 'Roles',
    MERCHANT: 'Merchants',
    STORE: 'Stores',
    PRODUCT: 'Products',
    PRODUCT_CATEGORY: 'Product Categories'
  };

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Resource</TableCell>
            {ACTIONS.map((a) => (
              <TableCell key={a} align="center" sx={{ fontWeight: 600, minWidth: 72 }}>
                {getLabel(a)}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(allPermissions).map(([resource, perms]) => {
            const regularPerms = perms.filter((p) => ACTIONS.includes(p.action));
            const extraPerms = perms.filter((p) => !ACTIONS.includes(p.action));

            return (
              <TableRow key={resource}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Checkbox
                      size="small"
                      indeterminate={
                        regularPerms.some((p) => value.includes(p.permission)) &&
                        !regularPerms.every((p) => value.includes(p.permission))
                      }
                      checked={regularPerms.length > 0 && regularPerms.every((p) => value.includes(p.permission))}
                      onChange={() => toggleAll(regularPerms.map((p) => p.permission))}
                    />
                    <Typography variant="body2">{resourceLabels[resource] || resource}</Typography>
                  </Box>
                </TableCell>
                {ACTIONS.map((action) => {
                  const perm = regularPerms.find((p) => p.action === action);
                  return (
                    <TableCell key={action} align="center">
                      {perm ? (
                        <Checkbox
                          size="small"
                          checked={value.includes(perm.permission)}
                          onChange={() => toggle(perm.permission)}
                        />
                      ) : null}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
