import React, { forwardRef } from 'react';
import { Layout, AppBar, UserMenu, useLocale, useSetLocale } from 'react-admin';
import { makeStyles, MenuItem, ListItemIcon } from '@material-ui/core';
import Language from '@material-ui/icons/Language';
import MyMenu from './Menu';
import MyAppBar from './MyAppBarNew';

const useStyles = makeStyles(theme => ({
    menuItem: {
        color: theme.palette.text.secondary,
    },
    icon: { minWidth: theme.spacing(5) },
}));

const SwitchStore= forwardRef((props, ref) => {
    const locale = useLocale();
    const setLocale = useSetLocale();
    const classes = useStyles();
    const role = localStorage.getItem('permissions');
    const selected_store = localStorage.getItem('default_client_id');
    const role_json =  JSON.parse(role);
   
    
    return (
        <MenuItem
        ref={ref}
        className={classes.menuItem}
        onClick={() => {
            setLocale(locale === 'en' ? 'fr' : 'en');
            props.onClick();
        }}
        >
        <ListItemIcon className={classes.icon}>
            <Language />
        </ListItemIcon>
        Switch Store
        </MenuItem>
       );
    
});

const MyUserMenu = props => (
    <UserMenu {...props}>
        {/* <SwitchStore />
        <SwitchStore /> */}
    </UserMenu>
);

const CustomAppBar = props => <MyAppBar {...props} userMenu={<MyUserMenu />} />;

const MyLayout = (props) => <Layout 
{...props} 
appBar={CustomAppBar}
menu={MyMenu} />;

export default MyLayout;