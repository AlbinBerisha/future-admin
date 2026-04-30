import { lazy } from 'react';

// project imports
import Loadable from 'ui-component/Loadable';
import AuthGuard from './AuthGuard';
import PermissionGuard from './PermissionGuard';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

// utilities routing
const UtilsTypography = Loadable(lazy(() => import('views/utilities/Typography')));
const UtilsColor = Loadable(lazy(() => import('views/utilities/Color')));
const UtilsShadow = Loadable(lazy(() => import('views/utilities/Shadow')));

// sample page routing
const SamplePage = Loadable(lazy(() => import('views/sample-page')));

// user management routing
const UsersList = Loadable(lazy(() => import('views/user-management/UsersList')));
const RolesList = Loadable(lazy(() => import('views/user-management/RolesList')));
const MerchantsList = Loadable(lazy(() => import('views/user-management/MerchantsList')));
const StoresList = Loadable(lazy(() => import('views/user-management/StoresList')));

// product management routing
const CategoriesList = Loadable(lazy(() => import('views/product-management/CategoriesList')));
const ProductsList = Loadable(lazy(() => import('views/product-management/ProductsList')));
const ProductForm = Loadable(lazy(() => import('views/product-management/ProductForm')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <AuthGuard />,
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },
    {
      path: 'typography',
      element: <UtilsTypography />
    },
    {
      path: 'color',
      element: <UtilsColor />
    },
    {
      path: 'shadow',
      element: <UtilsShadow />
    },
    {
      path: '/sample-page',
      element: <SamplePage />
    },
    {
      path: 'users',
      element: <PermissionGuard permission="VIEW_USER"><UsersList /></PermissionGuard>
    },
    {
      path: 'roles',
      element: <PermissionGuard permission="VIEW_USER_ROLE"><RolesList /></PermissionGuard>
    },
    {
      path: 'merchants',
      element: <PermissionGuard permission="VIEW_MERCHANT"><MerchantsList /></PermissionGuard>
    },
    {
      path: 'stores',
      element: <PermissionGuard permission="VIEW_STORE"><StoresList /></PermissionGuard>
    },
    {
      path: 'products',
      element: <PermissionGuard permission="VIEW_PRODUCT"><ProductsList /></PermissionGuard>
    },
    {
      path: 'products/new',
      element: <PermissionGuard permission="CREATE_PRODUCT"><ProductForm /></PermissionGuard>
    },
    {
      path: 'products/:id/edit',
      element: <PermissionGuard permission="UPDATE_PRODUCT"><ProductForm /></PermissionGuard>
    },
    {
      path: 'categories',
      element: <CategoriesList />
    }
  ]
};

export default MainRoutes;
