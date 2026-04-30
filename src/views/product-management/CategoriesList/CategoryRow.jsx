import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { IconChevronDown, IconChevronRight, IconEdit, IconTrash, IconPlus, IconFilter } from '@tabler/icons-react';

export default function CategoryRow({ category, level, expandedIds, onToggleExpand, onEdit, onAddChild, onManageFilters, onDelete, canEdit, canCreate, canDelete, canManageFilters }) {
  const hasChildren = category.children && category.children.length > 0;
  const isExpanded = expandedIds.has(category.id);
  const indent = level * 20;
  const displayName = category.names?.en || `Category #${category.id}`;
  const filterCount = category.filters?.length || 0;

  const rows = [];

  rows.push(
    <TableRow
      key={category.id}
      hover
      sx={{
        backgroundColor: level > 0 ? `rgba(0,0,0,${level * 0.02})` : 'inherit'
      }}
    >
      <TableCell sx={{ pl: 3 + indent }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => onToggleExpand(category.id)}
            disabled={!hasChildren}
            sx={{ visibility: hasChildren ? 'visible' : 'hidden' }}
          >
            {isExpanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
          </IconButton>
          <Typography variant="body1" fontWeight={level === 0 ? 600 : 400}>
            {displayName}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        {filterCount > 0 ? (
          <Chip
            label={`${filterCount} filter${filterCount > 1 ? 's' : ''}`}
            size="small"
            variant="outlined"
            onClick={() => onManageFilters(category)}
            sx={{ cursor: 'pointer' }}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            &mdash;
          </Typography>
        )}
      </TableCell>
      {(canEdit || canCreate || canDelete || canManageFilters) && (
        <TableCell align="right">
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            {canEdit && (
              <IconButton size="small" color="primary" onClick={() => onEdit(category)} title="Edit">
                <IconEdit size={18} />
              </IconButton>
            )}
            {canCreate && level < 2 && (
              <IconButton size="small" color="primary" onClick={() => onAddChild(category)} title="Add sub-category">
                <IconPlus size={18} />
              </IconButton>
            )}
            {canManageFilters && (
              <IconButton size="small" color="primary" onClick={() => onManageFilters(category)} title="Manage filters">
                <IconFilter size={18} />
              </IconButton>
            )}
            {canDelete && (
              <IconButton size="small" color="error" onClick={() => onDelete(category)} title="Delete">
                <IconTrash size={18} />
              </IconButton>
            )}
          </Box>
        </TableCell>
      )}
    </TableRow>
  );

  if (hasChildren && isExpanded) {
    category.children.forEach((child) => {
      const childRows = CategoryRow({
        category: child,
        level: level + 1,
        expandedIds,
        onToggleExpand,
        onEdit,
        onAddChild,
        onManageFilters,
        onDelete,
        canEdit,
        canCreate,
        canDelete,
        canManageFilters
      });
      if (Array.isArray(childRows)) {
        rows.push(...childRows);
      } else {
        rows.push(childRows);
      }
    });
  }

  return rows;
}
