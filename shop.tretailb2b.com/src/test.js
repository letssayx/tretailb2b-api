<Admin title="" loginPage={MyLoginPage} logoutButton={MyLogoutButton} layout={MyLayout} dashboard={Dashboard} authProvider={authProvider} dataProvider={dataProvider} customRoutes={customRoutes}>
{permissions => [
       
    // Only include the resource for admin users
    JSON.parse(permissions).others.is_admin === 1
        ? <Resource name="admin/users" options={{ label: 'Users', tags: 'admin' }} list={UserList} show={UserShow} edit={JSON.parse(permissions).others.is_super === 1 ? UserEdit : null} create={JSON.parse(permissions).others.is_super === 1 ? UserCreate : null} />
        : null,
     JSON.parse(permissions).others.is_admin === 1
        ? <Resource name="admin/clients" options={{ label: 'Clients', tags: 'admin' }} list={ClientList}  show={ClientShow}  create={ClientCreate} edit={ClientEdit}/>
        : null, 
    JSON.parse(permissions).others.is_admin === 1
        ? <Resource name="admin/roles" options={{ label: 'Roles', tags: 'admin' }} {...roles} />
        : null,     
    
    // for store operations

    //Brands
    JSON.parse(permissions).store.client_permissions.brands == 'GET' || JSON.parse(permissions).store.client_permissions.brands === 'POST'
    ? <Resource name="brands" options={{ label: 'Brands' }} list={BrandList} edit={JSON.parse(permissions).store.client_permissions.brands === 'POST' ? BrandEdit : null} create={JSON.parse(permissions).store.client_permissions.brands === 'POST' ? BrandCreate : null} />
    : null,
     //Manufacturers 
     JSON.parse(permissions).store.client_permissions.manufacturers == 'GET' || JSON.parse(permissions).store.client_permissions.manufacturers === 'POST'
     ? <Resource name="manufacturers" options={{ label: 'Manufacturers' }} list={ManufacturerList} edit={JSON.parse(permissions).store.client_permissions.manufacturers === 'POST' ? ManufacturerEdit : null} create={JSON.parse(permissions).store.client_permissions.manufacturers === 'POST' ? ManufacturerCreate : null} />
     : null,
     //Countries 
    JSON.parse(permissions).store.client_permissions.countries == 'GET' || JSON.parse(permissions).store.client_permissions.countries === 'POST'
     ? <Resource name="countries" options={{ label: 'Countries' }} list={CountryList} edit={JSON.parse(permissions).store.client_permissions.countries === 'POST' ? CountryEdit : null} create={JSON.parse(permissions).store.client_permissions.countries === 'POST' ? CountryCreate : null} />
     : null, 
    //Categories
    JSON.parse(permissions).store.client_permissions.categories == 'GET' || JSON.parse(permissions).store.client_permissions.categories === 'POST'
    ? <Resource name="categories" options={{ label: 'Categories' }} list={CategoryList} edit={JSON.parse(permissions).store.client_permissions.categories === 'POST' ? CategoryEdit : null} create={JSON.parse(permissions).store.client_permissions.categories === 'POST' ? CategoryCreate : null} />
    : null,
    
    //SubCategories
    JSON.parse(permissions).store.client_permissions.subcategories == 'GET' || JSON.parse(permissions).store.client_permissions.subcategories === 'POST'
    ? <Resource name="subcategories" options={{ label: 'SubCategories' }} create={JSON.parse(permissions).store.client_permissions.subcategories === 'POST' ? SubCategoryCreate : null} />
    : null, 

    //Products
   JSON.parse(permissions).store.client_permissions.products == 'GET' || JSON.parse(permissions).store.client_permissions.products === 'POST'
    ? <Resource name="products" options={{ label: 'Products' }} list={ProductList} edit={JSON.parse(permissions).store.client_permissions.products === 'POST' ? ProductEdit : null} create={JSON.parse(permissions).store.client_permissions.products === 'POST' ? ProductCreate : null} />
    : null,

    //Items
    JSON.parse(permissions).store.client_permissions.items == 'GET' || JSON.parse(permissions).store.client_permissions.items === 'POST'
    ? <Resource name="items" options={{ label: 'Items' }} list={ItemList} create={JSON.parse(permissions).store.client_permissions.items === 'POST' ? ItemCreate : null} edit={JSON.parse(permissions).store.client_permissions.items === 'POST' ? ItemEdit : null} />
    : null,
     //Items - bulk
     JSON.parse(permissions).store.client_permissions.items == 'GET' || JSON.parse(permissions).store.client_permissions.items === 'POST'
     ? <Resource name="items-bulk" options={{ label: 'Items - Bulk' }}  edit={JSON.parse(permissions).store.client_permissions.items === 'POST' ? ItemBulkEdit : null} />
     : null,
    

    //Customers 
    JSON.parse(permissions).store.client_permissions.customers == 'GET' || JSON.parse(permissions).store.client_permissions.customers === 'POST'
    ? <Resource name="customers" options={{ label: 'Customers' }} list={CustomerList} edit={JSON.parse(permissions).store.client_permissions.customers === 'POST' ? CustomerEdit : null} create={JSON.parse(permissions).store.client_permissions.customers === 'POST' ? CustomerCreate : null} />
    : null,
    //Orders
   JSON.parse(permissions).store.client_permissions.orders == 'GET' || JSON.parse(permissions).store.client_permissions.orders === 'POST'
    ? <Resource name="orders" options={{ label: 'Orders' }} list={OrderList} edit={JSON.parse(permissions).store.client_permissions.orders === 'POST' ? OrderEdit : null} create={JSON.parse(permissions).store.client_permissions.orders === 'POST' ? OrderCreate : null} />
    : null, 
    
    //logs 
    JSON.parse(permissions).store.client_permissions.logs == 'GET' || JSON.parse(permissions).store.client_permissions.logs === 'POST'
    ? <Resource name="logs" options={{ label: 'Logs' }} list={LogList} show={JSON.parse(permissions).store.client_permissions.logs === 'POST' ? LogShow: null} />
    : null,
]}

</Admin>