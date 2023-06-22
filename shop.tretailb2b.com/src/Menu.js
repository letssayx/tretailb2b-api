import React from 'react';
import { makeStyles,createStyles, Theme } from '@material-ui/core/styles';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import Chip from '@material-ui/core/Chip';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import DraftsIcon from '@material-ui/icons/Drafts';
import SendIcon from '@material-ui/icons/Send';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import StarBorder from '@material-ui/icons/StarBorder';
import { useSelector } from 'react-redux';
import { useMediaQuery } from '@material-ui/core';
import { MenuItemLink, getResources, DashboardMenuItem, useDataProvider } from 'react-admin';
import { usePermissions } from 'react-admin';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import PersonIcon from '@material-ui/icons/Person';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import AppsIcon from '@material-ui/icons/Apps';
import LocalGroceryStoreIcon from '@material-ui/icons/LocalGroceryStore';
import ReceiptIcon from '@material-ui/icons/Receipt';
import SettingsIcon from '@material-ui/icons/Settings';
import LanguageIcon from '@material-ui/icons/Language';
import CategoryIcon from '@material-ui/icons/Category';
import AppleIcon from '@material-ui/icons/Apple';
import ApartmentIcon from '@material-ui/icons/Apartment';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import SettingsApplicationsIcon from '@material-ui/icons/SettingsApplications';
import PeopleOutlineIcon from '@material-ui/icons/PeopleOutline';
import BookIcon from '@material-ui/icons/Book';
import FaceIcon from '@material-ui/icons/Face';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import DashboardIcon from '@material-ui/icons/Dashboard';
import CardGiftcardIcon from '@material-ui/icons/CardGiftcard';
import AssessmentIcon from '@material-ui/icons/Assessment';
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart';
import PickListIcon from '@material-ui/icons/List';
import MultilineChartIcon from '@material-ui/icons/MultilineChart';
import {useLocation, useHistory} from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
// import AnnouncementIcon from '@material-ui/icons/Announcement';
// import Cloud from '@material-ui/icons/Cloud';
// import EmojiPeopleIcon from '@material-ui/icons/EmojiPeople';
// import HouseIcon from '@material-ui/icons/House';
// import StoreIcon from '@material-ui/icons/Store';
const useStyles = makeStyles((theme) => ({
    root:
    {
        width: '100%',
        maxWidth: 360,
        backgroundColor: theme.palette.background.paper,
    },
    nested:
    {
        paddingLeft: theme.spacing(4),
    },
    nestedRoot:
    {
        paddingLeft: theme.spacing(6),
    },
    nestedChild:
    {
        paddingLeft: theme.spacing(7),
    },
    iconWidth:
    {
        minWidth: '40px',
    },
}));

const avatarStyles = makeStyles((theme) => createStyles({
    root:
    {
        display: 'flex', '& > *':
        {
            margin: theme.spacing(1),
        },
    },
    large:
    {
        width: theme.spacing(5),
        height: theme.spacing(5),
    },
}));


const Menu = ({ onMenuClick, logout }) =>
{
    const classes = useStyles();
    const [adminopen, setAdminOpen] = React.useState(false);
    const [storeopen, setStoreOpen] = React.useState(false);
    const [settingopen, setSettingOpen] = React.useState(false);
    const [productopen, setProductOpen] = React.useState(false);
    const [notificationopen, setNotificationOpen] = React.useState(false);
    const [orderopen, setOrderOpen] = React.useState(false);
    const [storesettingopen, setStoreSettingOpen] = React.useState(false);
    const [wmsopen,setWMSOpen] = React.useState(null);
    const [inventryopen,setInventryOpen] = React.useState(false);
    const [toolOpen,setToolOpen] = React.useState(false);
    const [picklistopen, setPickListOpen] = React.useState(false);
    const history = useHistory();
    const location=useLocation();
    const urlpathname=location.pathname;
    const slicedUrl=location.pathname.split("/")
    const avatarClasses = avatarStyles();
    const [userInfo, setUserInfo] = React.useState(null);
    const dataProvider = useDataProvider();


    React.useEffect(() =>
    {
        dataProvider.getOnly('profile')
        .then(({ data }) =>
        {
            setUserInfo(data);
        })
        .catch(error =>
        {
            console.log(error);
        });
    },[]);


    let client_profile_picture = null;
    let client_profile_text = ''
    let clientname = ''

    if(userInfo && userInfo.client && userInfo.client.name)
    {
        clientname = userInfo.client.name;
        client_profile_text = clientname.charAt(0);
    }

    if(userInfo && userInfo.client && userInfo.client.profile_picture)
    {
        client_profile_picture =  userInfo.client.profile_picture
    }

    if(slicedUrl[0]==='')
    slicedUrl.shift();
    React.useEffect(()=>
    {
        const productsPathNames=['brands','manufacturers','countries','categories','products','items','items-bulk','bundles'];
        const notificationsPathNames=['audit',]
        const storeSettingsPathNames=['settings','templates','teams']
        const ordersPathNames=['customers','orders','returns','transactions'];
        const settingsPathNames=['profile'];
        setAdminOpen(false);
        setStoreOpen(false);
        setProductOpen(false);
        setNotificationOpen(false);
        setOrderOpen(false);
        setStoreSettingOpen(false);
        setSettingOpen(false);
        if(slicedUrl[0]==='admin'){
        setAdminOpen(true);
        }else if(productsPathNames.indexOf(slicedUrl[0])!==-1){
        setStoreOpen(true);
        setProductOpen(true);
        }else if(ordersPathNames.indexOf(slicedUrl[0])!==-1){
        setStoreOpen(true);
        setOrderOpen(true);
        }else if(storeSettingsPathNames.indexOf(slicedUrl[0])!==-1){
        setStoreOpen(true);
        setStoreSettingOpen(true);
        }else if(settingsPathNames.indexOf(slicedUrl[0])!==-1){
        setSettingOpen(true);
        }
    },[location]);

    const handleAdminClick = () =>
    {
        setAdminOpen(!adminopen);
    };
    const handleStoreClick = () =>
    {
        setStoreOpen(!storeopen);
    };
    const handleSettingClick = () =>
    {
        setSettingOpen(!settingopen);
    };
    const handleProductClick = () =>
    {
        setProductOpen(!productopen);
    };
    const handleOrderClick = () =>
    {
        setOrderOpen(!orderopen);
    };
    const handleStoreSettingClick = () =>
    {
        setStoreSettingOpen(!storesettingopen);
    };
    // const handleWMSClick = () =>
    // {
    //     setWMSOpen(!wmsopen);
    // }
    // const handleInventryOpen = ()=>
    // {
    //     setInventryOpen(!inventryopen)
    // }
    const handleToolOpen = ()=>
    {
        setToolOpen(!toolOpen)
    }
    const handlePickListOpen = ()=>
    {
        setPickListOpen(!picklistopen)
    }
    const isXSmall = useMediaQuery(theme => theme.breakpoints.down('xl'));
    //const open = useSelector(state => state.admin.ui.sidebarOpen);
    //const resources = useSelector(getResources);
    //console.log(permissions);
    let user_permissions;
    const permissions  = usePermissions();
    // Show Company / Client name 
    const role = localStorage.getItem('permissions');
    const selected_store = localStorage.getItem('default_client_id');
    const role_json =  JSON.parse(role);
    let selected_client_name;
    role_json.stores.forEach(element =>
    {
        if(element.id == selected_store)
        {
            selected_client_name=element.client;
            //break;
        }
    });

    if(typeof permissions.permissions != "undefined")
    {
        user_permissions= JSON.parse(permissions.permissions);
        //console.log(user_permissions);
        return(
            <div>
                {/* Profile Section */}
                <ListItem button component="a" href="#/profile">
                    <ListItemIcon>
                        {
                            client_profile_picture
                            ?<Avatar alt={clientname} src={client_profile_picture} className={avatarClasses.large}/>
                            :<Avatar alt={clientname}>{client_profile_text}</Avatar>
                        }
                    </ListItemIcon>
                    <ListItemText primary={clientname}/>
                </ListItem>
                
                {/* <DashboardMenuItem button onClick={onMenuClick}/> */}
            
                {/* Analytics Menu */}
                <ListItem button onClick={()=>history.push('/')}> {/**'/analytics' */}
                    <ListItemIcon className={classes.iconWidth}>
                        <MultilineChartIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Analytics"/>
                </ListItem>

                {/* Admin Menu - Collapsible */}
                <div style={{display: user_permissions.others.is_admin === 1 ? '' : 'none' }}>
                    <ListItem button onClick={handleAdminClick}>
                        <ListItemIcon className={classes.iconWidth}>
                            <SupervisorAccountIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Admins"/>
                        {
                            adminopen
                            ?<ExpandLess/>
                            :<ExpandMore/>
                        }
                    </ListItem>
                    <Collapse in={adminopen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <MenuItemLink button className={classes.nested}
                                to={`/admin/users`}
                                primaryText={"Users"}
                                leftIcon={<PersonIcon/>}
                                onClick={onMenuClick}
                                sidebarIsOpen={adminopen}
                                selected={slicedUrl[0]==='admin'&& slicedUrl[1]==='users'}
                            />
                            <MenuItemLink button className={classes.nested}
                                to={`/admin/clients`}
                                primaryText={"Clients"}
                                leftIcon={<AccountBoxIcon/>}
                                onClick={onMenuClick}
                                sidebarIsOpen={adminopen}
                                selected={slicedUrl[0]==='admin'&& slicedUrl[1]==='clients'}
                            />
                            <MenuItemLink button className={classes.nested}
                                to={`/admin/requests`}
                                primaryText={"Requests"}
                                leftIcon={<AppsIcon/>}
                                onClick={onMenuClick}
                                sidebarIsOpen={adminopen}
                                selected={slicedUrl[0]==='admin'&& slicedUrl[1]==='requests'}
                            />
                            <MenuItemLink button className={classes.nested}
                                to={`/admin/logs`}
                                primaryText={"Logs"}
                                leftIcon={<BookIcon/>}
                                onClick={onMenuClick}
                                sidebarIsOpen={adminopen}
                                selected={slicedUrl[0]==='admin'&& slicedUrl[1]==='logs'}
                            />
                            <MenuItemLink button className={classes.nested}
                                to={`/admin/settings`}
                                primaryText={"Settings"}
                                leftIcon={<SettingsIcon/>}
                                onClick={onMenuClick}
                                sidebarIsOpen={adminopen}
                                selected={slicedUrl[0]==='admin'&& slicedUrl[1]==='logs'}
                            />
                        </List>
                    </Collapse>
                </div>

                {/*
                <ListItem button onClick={handleStoreClick}>
                    <ListItemIcon className={classes.iconWidth}>
                        <StoreIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Store"/>
                        {
                            storeopen
                            ?<ExpandLess/>
                            :<ExpandMore/>
                        }
                </ListItem>
                <Collapse in={storeopen} timeout="auto" unmountOnExit>
                </Collapse>
                */}

                {/*
                <ListItem button onClick={()=>history.push('/store')}>
                    <ListItemIcon className={classes.iconWidth}>
                        <StoreIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Store"/>
                </ListItem>
                */}

                {/*
                <div style={{display: user_permissions.store.client_permissions.logs === 'GET' || user_permissions.store.client_permissions.logs === 'POST' ? '' : 'none'}}>
                    <MenuItemLink button className={classes.nestedChild}
                        to={`/logs`}
                        primaryText={"Logs"}
                        leftIcon={<BookIcon/>}
                        onClick={onMenuClick}
                        sidebarIsOpen={storesettingopen}
                        selected={slicedUrl[0]==='logs'}
                    />
                </div>
                */}

                {/*
                <ListItem button  style={{display:'none'}} onClick={handleStoreSettingClick} disablePadding>
                    <ListItemIcon disablePadding className={classes.iconWidth}>
                        <SettingsIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Settings" disablePadding/>
                    {
                        storesettingopen
                        ?<ExpandLess/>
                        :<ExpandMore/>
                    }
                </ListItem>
                */}

                {/*
                <Collapse in={storesettingopen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <div style={{display:'none'}}> //style={{display: user_permissions.store.client_permissions.logs === 'GET' || user_permissions.store.client_permissions.logs === 'POST' ? '' : 'none'}}
                            <MenuItemLink button className={classes.nestedChild}
                                to={`/templates`}
                                primaryText={"Templates"}
                                leftIcon={<AnnouncementIcon/>}
                                onClick={onMenuClick}
                                sidebarIsOpen={storesettingopen}
                                selected={slicedUrl[0]==='templates'}
                            />
                        </div> 
                        <div style={{display:'none'}}>
                            <MenuItemLink button className={classes.nestedChild}
                                to={`/teams`}
                                primaryText={"Teams"}
                                leftIcon={<PeopleOutlineIcon/>}
                                onClick={onMenuClick}
                                sidebarIsOpen={storesettingopen}
                                selected={slicedUrl[0]==='teams'}
                            />
                        </div> 
                    </List>
                </Collapse>
                */}

                {/*
                <ListItem button onClick={handleWMSClick} >
                    <ListItemIcon className={classes.iconWidth}>
                        <HouseIcon/>
                    </ListItemIcon>
                    <ListItemText primary="WMS"/>
                    {
                        wmsopen
                        ?<ExpandLess/>
                        :<ExpandMore/>
                    }
                </ListItem>
                */}

                {/* <Collapse in={wmsopen} timeout="auto" unmountOnExit> */}
                {/*     <List component="div" disablePadding> */}
                {/*     </List> */}
                {/* </Collapse> */}
                
                {/* Products Menu - Collapsible */}
                <List component="div" disablePadding>
                    <ListItem button onClick={handleProductClick}  disablePadding>
                        <ListItemIcon disablePadding className={classes.iconWidth}>
                            <CardGiftcardIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Products" disablePadding/>
                        {
                            productopen
                            ?<ExpandLess/>
                            :<ExpandMore/>
                        }
                    </ListItem>
                    <Collapse in={productopen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <div style={{display: user_permissions.store.client_permissions.brands === 'GET' || user_permissions.store.client_permissions.brands === 'POST' ? '' : 'none'}}>
                                <MenuItemLink button className={classes.nestedChild}
                                    to={`/brands`}
                                    primaryText={"Brands"}
                                    leftIcon={<AppleIcon/>}
                                    onClick={onMenuClick}
                                    sidebarIsOpen={productopen}
                                    selected={slicedUrl[0]==='brands'}
                                />
                            </div>
                            <div style={{display: user_permissions.store.client_permissions.manufacturers === 'GET' || user_permissions.store.client_permissions.manufacturers === 'POST' ? '' : 'none'}}>
                                <MenuItemLink button className={classes.nestedChild}
                                    to={`/manufacturers`}
                                    primaryText={"Manufacturers"}
                                    leftIcon={<ApartmentIcon/>}
                                    onClick={onMenuClick}
                                    sidebarIsOpen={productopen}
                                    selected={slicedUrl[0]==='manufacturers'}
                                />
                            </div>
                            <div style={{display: user_permissions.store.client_permissions.countries === 'GET' || user_permissions.store.client_permissions.countries === 'POST' ? '' : 'none'}}>
                                <MenuItemLink button className={classes.nestedChild}
                                    to={`/countries`}
                                    primaryText={"Countries"}
                                    leftIcon={<LanguageIcon/>}
                                    onClick={onMenuClick}
                                    sidebarIsOpen={productopen}
                                    selected={slicedUrl[0]==='countries'}
                                />
                            </div>
                            <div style={{display: user_permissions.store.client_permissions.categories === 'GET' || user_permissions.store.client_permissions.categories === 'POST' ? '' : 'none'}}>
                                <MenuItemLink button className={classes.nestedChild}
                                    to={`/categories`}
                                    primaryText={"Categories"}
                                    leftIcon={<CategoryIcon/>}
                                    onClick={onMenuClick}
                                    sidebarIsOpen={productopen}
                                    selected={slicedUrl[0]==='categories'}
                                />
                            </div>
                            <div style={{display: user_permissions.store.client_permissions.products === 'GET' || user_permissions.store.client_permissions.products === 'POST' ? '' : 'none'}}>
                                <MenuItemLink button className={classes.nestedChild}
                                    to={`/products`}
                                    primaryText={"Products"}
                                    leftIcon={<LocalGroceryStoreIcon/>}
                                    onClick={onMenuClick}
                                    sidebarIsOpen={productopen}
                                    selected={slicedUrl[0]==='products' || slicedUrl[0]==='items-bulk'}
                                />
                            </div>
                            <div style={{display: user_permissions.store.client_permissions.items === 'GET' || user_permissions.store.client_permissions.items === 'POST' ? '' : 'none'}}>
                                <MenuItemLink button className={classes.nestedChild}
                                    to={`/bundles`}
                                    primaryText={"Bundles"}
                                    leftIcon={<CardGiftcardIcon/>}
                                    onClick={onMenuClick}
                                    sidebarIsOpen={productopen}
                                    selected={slicedUrl[0]==='bundles'}
                                />
                            </div>
                            {/*
                            <div style={{display: user_permissions.store.client_permissions.items === 'GET' || user_permissions.store.client_permissions.items === 'POST' ? '' : 'none'}}>
                                <MenuItemLink button className={classes.nestedChild}
                                    to={`/items`}
                                    primaryText={"Inventory"}
                                    leftIcon={<PickListIcon/>}
                                    onClick={onMenuClick}
                                    sidebarIsOpen={productopen}
                                    selected={slicedUrl[0]==='bundles'}
                                />
                            </div>
                            */}
                        </List>
                    </Collapse>

                {/* Orders Menu */}
                <ListItem button  onClick={()=>history.push('/orders')} disablePadding>
                    <ListItemIcon className={classes.iconWidth}>
                        <AddShoppingCartIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Orders"/>
                </ListItem>

                {/* Transactions Menu */}
                <ListItem button onClick={()=>history.push('/transactions')}  disablePadding>
                    <ListItemIcon disablePadding className={classes.iconWidth}>
                        <AttachMoneyIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Transactions" disablePadding/>
                </ListItem>


                {/* Customers Menu */}
                <ListItem button onClick={()=>history.push('/customers')}>
                    <ListItemIcon className={classes.iconWidth}>
                        <PersonIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Customers"/>
                </ListItem>

                {/* Teams Menu */}            
                <ListItem button  onClick={()=>history.push('/teams')}>
                    <ListItemIcon className={classes.iconWidth}>
                        <PeopleOutlineIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Teams"/>
                </ListItem>

                {/* Reports Menu */}
                <ListItem  button  disablePadding  onClick={()=>history.push('/reports')}>
                    <ListItemIcon disablePadding className={classes.iconWidth}>
                        <AssessmentIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Reports"/>
                </ListItem>

                {/* Logs Menu */}
                <ListItem button  onClick={()=>history.push('/logtab/user_logs')}>
                    <ListItemIcon className={classes.iconWidth}>
                        <BookIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Logs"/>
                </ListItem>

                {/* New Inventory Menu */}
                <ListItem button  onClick={()=>history.push('/wms-inbound/items')} disablePadding>
                    <ListItemIcon className={classes.iconWidth}>
                        <AccountBalanceIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Inventory"/>
                </ListItem>

                {/* Inventory Menu */}
                {/*
                <ListItem button onClick={handleInventryOpen} disablePadding>
                    <ListItemIcon disablePadding className={classes.iconWidth}>
                        <AccountBoxIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Inventory" disablePadding/>
                    {
                        inventryopen
                        ?<ExpandLess/>
                        :<ExpandMore/>
                    }
                </ListItem>
                <Collapse in={inventryopen} timeout="auto"  unmountOnExit>
                    <div>
                        <List>
                            <MenuItemLink button disablePadding  className={classes.nestedChild}
                                to={`/wms-inbound/operation_type`}
                                primaryText={"Inventory Operation"}
                                leftIcon={<AccountBalanceIcon/>}
                                onClick={onMenuClick}
                                sidebarIsOpen={wmsopen}
                            />
                        </List>
                    </div>
                    <div style={{display: user_permissions.store.client_permissions.items === 'GET' || user_permissions.store.client_permissions.items === 'POST' ? '' : 'none'}}>
                        <MenuItemLink button className={classes.nestedChild}
                            to={`/items`}
                            primaryText={"Inventory"}
                            leftIcon={<AccountBalanceIcon/>}
                            onClick={onMenuClick}
                            selected={slicedUrl[0]==='items'}
                        />
                    </div>
                </Collapse>
                */}
                {/* Shipments Menu */}
                <ListItem button  onClick={()=>history.push('/picklist')} disablePadding>
                    <ListItemIcon className={classes.iconWidth}>
                        <BookIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Shipments"/>
                </ListItem>

                {/* Dispatch Menu */}
                <ListItem button  onClick={()=>history.push('/coming-soon')} disablePadding>
                    <ListItemIcon className={classes.iconWidth}>
                        <BookIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Dispatch"/>
                </ListItem>

                {/*
                <ListItem button onClick={handleToolOpen} disablePadding>
                    <ListItemIcon disablePadding className={classes.iconWidth}>
                        <AccountBoxIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Tool" disablePadding/>
                    {
                        toolOpen
                        ?<ExpandLess/>
                        :<ExpandMore/>
                    }
                </ListItem>
                <Collapse in={toolOpen} timeout="auto"  unmountOnExit>
                    <div style={{paddingRight:'10px'}}>
                        <List>
                            <MenuItemLink button disablePadding className={classes.nestedChild}
                                to={`/`}
                                primaryText={"Create Barcode"}
                                leftIcon={<PersonIcon/>}
                                onClick={onMenuClick}
                                sidebarIsOpen={toolOpen}
                            />
                        </List>
                    </div>
                </Collapse>
                */}
                {/*
                <ListItem button onClick={()=>history.push('/logs/create')}>
                    <ListItemIcon className={classes.iconWidth}>
                        <Cloud/>
                    </ListItemIcon> 
                    <ListItemText primary="Create barcode/Qr Code"/>
                </ListItem>
                */}

                {/* Notifications Menu */}
                <ListItem button  onClick={()=>history.push('/notifications')} disablePadding>
                    <ListItemIcon className={classes.iconWidth}>
                        <BookIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Notifications"/>
                </ListItem>

                {/* Settings Menu - Collapsible */}
                <ListItem button onClick={handleSettingClick}>
                    <ListItemIcon className={classes.iconWidth}>
                        <SettingsIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Settings"/>
                    {
                        settingopen
                        ?<ExpandLess/>
                        :<ExpandMore/>
                    }
                </ListItem>
                <Collapse in={settingopen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <MenuItemLink button className={classes.nested}
                            to={`/profile`}
                            primaryText={"Switch Account"}
                            leftIcon={<FaceIcon/>}
                            onClick={onMenuClick}
                            sidebarIsOpen={settingopen}
                            selected={slicedUrl[0]==='profile'}
                        />
                        <div style={{display: user_permissions.store.client_permissions.settings === 'GET' || user_permissions.store.client_permissions.settings === 'POST' ? '' : 'none'}}>
                            <MenuItemLink button className={classes.nested}
                                to={`/settings`}
                                primaryText={"Channels"}
                                leftIcon={<SettingsApplicationsIcon/>}
                                onClick={onMenuClick}
                                sidebarIsOpen={settingopen}
                                selected={slicedUrl[0]==='channels'}
                            />
                        </div>
                        <div style={{display: user_permissions.store.client_permissions.settings === 'GET' || user_permissions.store.client_permissions.settings === 'POST' ? '' : 'none'}}>
                            <MenuItemLink button className={classes.nested}
                                to={`/inventrysync`}
                                primaryText={"Inventory Sync"}
                                leftIcon={<SettingsApplicationsIcon/>}
                                onClick={onMenuClick}
                                sidebarIsOpen={settingopen}
                                selected={slicedUrl[0]==='inventrysync'}
                            />
                        </div>
                        <MenuItemLink button className={classes.nested}
                            to={`/profileOption`}
                            primaryText={"Profile"}
                            leftIcon={<FaceIcon/>}
                            onClick={onMenuClick}
                            sidebarIsOpen={settingopen}
                            selected={slicedUrl[0]==='Profile'} 
                        />
                    </List>
                </Collapse>
                {logout}
                </List>
            </div>
        );
    }
    else
    {
        return (<div></div>);
    }
};

export default Menu;
