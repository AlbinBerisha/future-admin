// assets
import { IconUsers, IconShield, IconBuilding, IconBuildingStore } from '@tabler/icons-react';

// constant
const icons = { IconUsers, IconShield, IconBuilding, IconBuildingStore };

// ==============================|| USER MANAGEMENT MENU ITEMS ||============================== //

const userManagement = {
  id: 'user-management',
  title: 'User Management',
  type: 'group',
  children: [
    {
      id: 'users',
      title: 'Users',
      type: 'item',
      url: '/users',
      icon: icons.IconUsers,
      breadcrumbs: false,
      permission: 'VIEW_USER'
    },
    {
      id: 'roles',
      title: 'Roles',
      type: 'item',
      url: '/roles',
      icon: icons.IconShield,
      breadcrumbs: false,
      permission: 'VIEW_USER_ROLE'
    },
    {
      id: 'merchants',
      title: 'Merchants',
      type: 'item',
      url: '/merchants',
      icon: icons.IconBuilding,
      breadcrumbs: false,
      permission: 'VIEW_MERCHANT'
    },
    {
      id: 'stores',
      title: 'Stores',
      type: 'item',
      url: '/stores',
      icon: icons.IconBuildingStore,
      breadcrumbs: false,
      permission: 'VIEW_STORE'
    }
  ]
};

export default userManagement;
