import React from 'react';
import { Admin, Resource, ListGuesser, fetchUtils, showNotification } from 'react-admin';
import logo from './logo.svg';
import MyLayout from './MyLayout';
import './App.css';
import authProvider from './authProvider';
import Dashboard from './analytics/Dashboard';
import dataProvider from './dataProvider';
import customRoutes from './customRoutes';

import MyLoginPage from './MyLoginPage';

import MyLogoutButton from './MyLogoutButton';
import { UserList, UserCreate, UserEdit, UserShow} from './admin/users/users';
import { ClientList, ClientCreate, ClientEdit, ClientShow} from './admin/clients/clients';
import { RequestList, RequestShow} from './admin/clients/requests';
import { BundleList,BundleCreate,BundleEdit } from './store/products/bundles';
import { ProductCreate, ProductEdit, ProductList} from './store/products/products';
import { BrandCreate, BrandEdit, BrandList} from './store/products/brands';
import { ManufacturerCreate, ManufacturerEdit, ManufacturerList} from './store/products/manufacturers';
import { CountryCreate, CountryEdit, CountryList} from './store/products/countries';
import { LogShow, LogList,LogCreate} from './store/logs/logs';
import { CategoryCreate, CategoryEdit, CategoryList} from './store/products/categories';
import { SubCategoryCreate } from './store/products/subcategories';
import { ItemCreate, ItemEdit, ItemList,ItemBulkEdit } from './store/products/items';
import { CustomerCreate, CustomerEdit, CustomerList} from './store/orders/customers';
import { OrderCreate, OrderEdit, OrderTabs, ReturnEdit, ReturnList} from './store/orders/orders';
// import { ReturnEdit, ReturnList} from './store/orders/returns';
import roles from './admin/roles/roles';
import { TeamCreate, TeamEdit, TeamList} from './store/teams/teams';
// import ChatwootWidget from './ChatwootWidget';
import {ProfilePictureCreate, ProfilePictureList} from './store/profile/profile-picture';

function App() {
  return ( 
    <Admin loginPage={MyLoginPage} logoutButton={MyLogoutButton} layout={MyLayout} dashboard={Dashboard} authProvider={authProvider} dataProvider={dataProvider} customRoutes={customRoutes}>
      {( permissions ) => {
        return [
          // Only include the resource for Admin users
          JSON.parse(permissions).others.is_admin === 1
          ? <Resource name="admin/users" options={{ label: 'Users', tags: 'admin' }} list={UserList} show={UserShow} edit={JSON.parse(permissions).others.is_super === 1 ? UserEdit : null} create={JSON.parse(permissions).others.is_super === 1 ? UserCreate : null} />
          : null,

          JSON.parse(permissions).others.is_admin === 1
          ?<Resource name="admin/clients" options={{ label: 'Clients', tags: 'admin' }} list={ClientList}  show={ClientShow}  create={ClientCreate} edit={ClientEdit}/>
          :null,

          JSON.parse(permissions).others.is_admin === 1
          ?<Resource name="admin/roles" options={{ label: 'Roles', tags: 'admin' }} {...roles} />
          :null,

          JSON.parse(permissions).others.is_admin === 1
          ?<Resource name="admin/requests" options={{ label: 'Requests', tags: 'admin' }} list={RequestList}  show={RequestShow}  />
          :null,

          JSON.parse(permissions).others.is_admin === 1
          ?<Resource name="admin/profile-pictures" options={{ label: 'Profile Picture', tags:'admin' }} create={ProfilePictureCreate} list={ProfilePictureList}/>
          :null,     

          (JSON.parse(permissions).others.is_admin === 1)
          ?<Resource name="admin/logs" options={{ label: 'Admin Log' }} list={LogList} show={LogShow}  />
          :null,
          
          // For Store operations

          // Brands
          JSON.parse(permissions).store.client_permissions.brands == 'GET' || JSON.parse(permissions).store.client_permissions.brands === 'POST'
          ?<Resource name="brands" options={{ label: 'Brands' }} list={BrandList} edit={JSON.parse(permissions).store.client_permissions.brands === 'POST' ? BrandEdit : null} create={JSON.parse(permissions).store.client_permissions.brands === 'POST' ? BrandCreate : null} />
          :null,
          
          // Manufacturers 
          JSON.parse(permissions).store.client_permissions.manufacturers == 'GET' || JSON.parse(permissions).store.client_permissions.manufacturers === 'POST'
          ?<Resource name="manufacturers" options={{ label: 'Manufacturers' }} list={ManufacturerList} edit={JSON.parse(permissions).store.client_permissions.manufacturers === 'POST' ? ManufacturerEdit : null} create={JSON.parse(permissions).store.client_permissions.manufacturers === 'POST' ? ManufacturerCreate : null} />
          :null,
          
          // Countries 
          JSON.parse(permissions).store.client_permissions.countries == 'GET' || JSON.parse(permissions).store.client_permissions.countries === 'POST'
          ?<Resource name="countries" options={{ label: 'Countries' }} list={CountryList} edit={JSON.parse(permissions).store.client_permissions.countries === 'POST' ? CountryEdit : null} create={JSON.parse(permissions).store.client_permissions.countries === 'POST' ? CountryCreate : null} />
          :null, 

          // Categories
          JSON.parse(permissions).store.client_permissions.categories == 'GET' || JSON.parse(permissions).store.client_permissions.categories === 'POST'
          ?<Resource name="categories" options={{ label: 'Categories' }} list={CategoryList} edit={JSON.parse(permissions).store.client_permissions.categories === 'POST' ? CategoryEdit : null} create={JSON.parse(permissions).store.client_permissions.categories === 'POST' ? CategoryCreate : null} />
          :null,

          // SubCategories
          JSON.parse(permissions).store.client_permissions.subcategories == 'GET' || JSON.parse(permissions).store.client_permissions.subcategories === 'POST'
          ?<Resource name="subcategories" options={{ label: 'SubCategories' }} create={JSON.parse(permissions).store.client_permissions.subcategories === 'POST' ? SubCategoryCreate : null} />
          :null, 

          // Products
          JSON.parse(permissions).store.client_permissions.products == 'GET' || JSON.parse(permissions).store.client_permissions.products === 'POST'
          ?<Resource name="products" options={{ label: 'Products' }} list={ProductList} edit={JSON.parse(permissions).store.client_permissions.products === 'POST' ? ProductEdit : null} create={JSON.parse(permissions).store.client_permissions.products === 'POST' ? ProductCreate : null} />
          :null,

          // Bundle
          JSON.parse(permissions).store.client_permissions.bundles == 'GET' || JSON.parse(permissions).store.client_permissions.bundles === 'POST'
          ?<Resource name="bundles" options={{ label: 'Bundles' }} list={BundleList}  edit={JSON.parse(permissions).store.client_permissions.bundles === 'POST' ? BundleEdit : null}  create={JSON.parse(permissions).store.client_permissions.bundles === 'POST' ? BundleCreate : null} />
          :null,

          // Items
          JSON.parse(permissions).store.client_permissions.items == 'GET' || JSON.parse(permissions).store.client_permissions.items === 'POST'
          ?<Resource name="items" options={{ label: 'Items' }} list={ItemList} create={JSON.parse(permissions).store.client_permissions.items === 'POST' ? ItemCreate : null} edit={JSON.parse(permissions).store.client_permissions.items === 'POST' ? ItemEdit : null} />
          :null,

          // Items - Bulk
          JSON.parse(permissions).store.client_permissions.items == 'GET' || JSON.parse(permissions).store.client_permissions.items === 'POST'
          ?<Resource name="items-bulk" options={{ label: 'Items - Bulk' }}  edit={JSON.parse(permissions).store.client_permissions.items === 'POST' ? ItemBulkEdit : null} />
          :null,

          // Customers 
          JSON.parse(permissions).store.client_permissions.customers == 'GET' || JSON.parse(permissions).store.client_permissions.customers === 'POST'
          ?<Resource name="customers" options={{ label: 'Customers' }}  list={CustomerList} edit={JSON.parse(permissions).store.client_permissions.customers === 'POST' ? CustomerEdit : null} create={JSON.parse(permissions).store.client_permissions.customers === 'POST' ? CustomerCreate : null} />
          :null,

          // Orders
          JSON.parse(permissions).store.client_permissions.orders == 'GET' || JSON.parse(permissions).store.client_permissions.orders === 'POST'
          ?<Resource name="orders" options={{ label: 'Orders' }} list={OrderTabs} edit={JSON.parse(permissions).store.client_permissions.orders === 'POST' ? OrderEdit : null} create={JSON.parse(permissions).store.client_permissions.orders === 'POST' ? OrderCreate : null} />
          :null, 

          // Returns
          JSON.parse(permissions).store.client_permissions.returns == 'GET' || JSON.parse(permissions).store.client_permissions.returns === 'POST'
          ?<Resource name="returns" options={{ label: 'Returns' }} list={ReturnList} edit={JSON.parse(permissions).store.client_permissions.returns === 'POST' ? ReturnEdit : null} />
          :null, 

          // Transactions
          JSON.parse(permissions).store.client_permissions.transactions == 'GET' || JSON.parse(permissions).store.client_permissions.transactions === 'POST'
          ?<Resource name="transactions" options={{ label: 'Transactions' }} />
          :null,

          // logs 
          JSON.parse(permissions).store.client_permissions.logs == 'GET' || JSON.parse(permissions).store.client_permissions.logs === 'POST'
          ?<Resource name="logs" options={{ label: 'Logs' }} list={LogList} show={JSON.parse(permissions).store.client_permissions.logs === 'POST' ? LogShow: null} create={JSON.parse(permissions).store.client_permissions.logs === 'POST' ? LogCreate: null} />
          :null,

          // Teams
          JSON.parse(permissions).store.is_admin === 1
          ?<Resource name="teams" options={{ label: 'Teams' }} list={TeamList} edit={TeamEdit} create={TeamCreate} />
          :null, 

          // wms-inbound/items should be decleared as resource unless 
          // It can prevent datagrid expand feature of the custom DataGrid 
          // of wms-inbound/items
          <Resource name="wms-inbound/items"/>,

          // Dummy resource to load without Auth 
          // <Resource name="ping" options={{ label: 'ping' }} />,
          // <ChatwootWidget/>
        ]
      }}
    </Admin>
  );
}
export default App;
