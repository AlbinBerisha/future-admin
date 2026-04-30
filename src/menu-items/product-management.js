import { IconCategory, IconPackage } from '@tabler/icons-react';

const icons = { IconCategory, IconPackage };

const productManagement = {
  id: 'product-management',
  title: 'Product Management',
  type: 'group',
  children: [
    {
      id: 'products',
      title: 'Products',
      type: 'item',
      url: '/products',
      icon: icons.IconPackage,
      breadcrumbs: false
    },
    {
      id: 'categories',
      title: 'Categories',
      type: 'item',
      url: '/categories',
      icon: icons.IconCategory,
      breadcrumbs: false
    }
  ]
};

export default productManagement;
