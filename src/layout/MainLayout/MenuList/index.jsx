import { Activity, memo, useMemo, useState } from 'react';

import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import NavItem from './NavItem';
import NavGroup from './NavGroup';
import menuItems from 'menu-items';
import useAuth from 'hooks/useAuth';

import { useGetMenuMaster } from 'api/menu';

function hasPermission(userPermissions, required) {
  if (!required) return true;
  return userPermissions?.includes(required);
}

function filterMenuItems(items, userPermissions) {
  return items
    .map((item) => {
      if (item.children) {
        const filteredChildren = item.children.filter((child) => hasPermission(userPermissions, child.permission));
        if (filteredChildren.length === 0) return null;
        return { ...item, children: filteredChildren };
      }
      return hasPermission(userPermissions, item.permission) ? item : null;
    })
    .filter(Boolean);
}

// ==============================|| SIDEBAR MENU LIST ||============================== //

function MenuList() {
  const { user } = useAuth();
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  const [selectedID, setSelectedID] = useState('');

  const userPermissions = user?.role?.permissions || [];

  const filteredItems = useMemo(() => filterMenuItems(menuItems.items, userPermissions), [userPermissions]);

  const lastItem = null;

  let lastItemIndex = filteredItems.length - 1;
  let remItems = [];
  let lastItemId;

  if (lastItem && lastItem < filteredItems.length) {
    lastItemId = filteredItems[lastItem - 1].id;
    lastItemIndex = lastItem - 1;
    remItems = filteredItems.slice(lastItem - 1, filteredItems.length).map((item) => ({
      title: item.title,
      elements: item.children,
      icon: item.icon,
      ...(item.url && {
        url: item.url
      })
    }));
  }

  const navItems = filteredItems.slice(0, lastItemIndex + 1).map((item, index) => {
    switch (item.type) {
      case 'group':
        if (item.url && item.id !== lastItemId) {
          return (
            <List key={item.id}>
              <NavItem item={item} level={1} isParents setSelectedID={() => setSelectedID('')} />
              <Activity mode={index !== 0 ? 'visible' : 'hidden'}>
                <Divider sx={{ py: 0.5 }} />
              </Activity>
            </List>
          );
        }

        return (
          <NavGroup
            key={item.id}
            setSelectedID={setSelectedID}
            selectedID={selectedID}
            item={item}
            lastItem={lastItem}
            remItems={remItems}
            lastItemId={lastItemId}
          />
        );
      default:
        return (
          <Typography key={item.id} variant="h6" align="center" sx={{ color: 'error.main' }}>
            Menu Items Error
          </Typography>
        );
    }
  });

  return <Box {...(drawerOpen && { sx: { mt: 1.5 } })}>{navItems}</Box>;
}

export default memo(MenuList);
