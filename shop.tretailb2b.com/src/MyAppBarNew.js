import React from 'react';
import { setSidebarVisibility, useLogout, useDataProvider, useRedirect}
  from 'react-admin';
import { useDispatch } from 'react-redux';

import { fade, makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import { useMediaQuery } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import Badge from '@material-ui/core/Badge';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';

// Icons
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MailIcon from '@material-ui/icons/Mail';
import NotificationsIcon from '@material-ui/icons/Notifications';
import MoreIcon from '@material-ui/icons/MoreVert';

const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
      width: 'auto',
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
    },
  },
  sectionMobile: {
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
}));

export default function MyAppBar(props)  {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
  const dispatch = useDispatch()
  const [leftMenuOpen,setLeftMenuOpen] = React.useState(true);
  const isSmall = useMediaQuery(theme => theme.breakpoints.down('sm'));
  const logout = useLogout();
  const [userInfo,setUserInfo] = React.useState(null);
  const dataProvider = useDataProvider();
  const [msgCount,setmsgCount] = React.useState(1);


  const handleLeftMenuOpen = () => {
        const open = leftMenuOpen;
        setLeftMenuOpen(!open)
        dispatch( setSidebarVisibility( !open ) );
  }

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const redirect=useRedirect();
  const handleBadgeClick = () => {
    msgCount==1?setmsgCount(msgCount-1):setmsgCount(0);
    redirect(`/notifications`);
  };

  React.useEffect(() => {
           dataProvider.getOnly('profile')
           .then(({ data }) => {
                 setUserInfo(data);
            })
            .catch(error => {
                 console.log(error);
            })
  },[])

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={ handleMenuClose }
    >
      <MenuItem to={`/logout`} onClick={()=>logout()}>Logout</MenuItem>
    </Menu>
  );

  let userProfilePicture = null;
  let userProfileText = ''
  let username = ''

  if( userInfo && 
      userInfo.user && 
      userInfo.user.name
  ){
           username = userInfo.user.name;
           userProfileText = username.charAt(0);
           console.log('test', username);
  }

  if( userInfo      && 
      userInfo.user && 
      userInfo.user.profile_picture
  ){
       userProfilePicture =  userInfo.user.profile_picture
  }

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMobileMenuOpen}
      onClose={ handleMobileMenuClose }
    >
      <MenuItem onClick={ handleProfileMenuOpen }>
        <IconButton
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          { 
             userProfilePicture?
            <Avatar alt={username} src={userProfilePicture}/>:
            <Avatar>{ userProfileText }</Avatar>
          }
             
        </IconButton>
         <p>Profile</p>
      </MenuItem>
      <MenuItem to={`/logout`} onClick={()=>logout()}>Logout</MenuItem>
    </Menu>
  );

  return (
    <div className={classes.grow}>
      <AppBar {...props}>
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="open drawer"
            onClick={() => handleLeftMenuOpen()}
          >
            <MenuIcon />
          </IconButton>
          <Typography
                variant="h6"
                color="inherit"
                className={classes.title}
                id="react-admin-title"
          />
          <div className={classes.grow} />
          <div className={classes.sectionDesktop}>
            <IconButton
              aria-label="cart"
              edge="start"
            >
              <Badge
                badgeContent={msgCount}
                color="secondary"
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                onClick={ handleBadgeClick }
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={ handleProfileMenuOpen }
              color="inherit"
            >
              { 
                userProfilePicture?
                <Avatar alt={username} src={userProfilePicture}/>:
                <Avatar>{ userProfileText }</Avatar>
              }
            </IconButton>
          </div>
          <div className={classes.sectionMobile}>
            <IconButton
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={ handleMobileMenuOpen }
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {!isSmall && renderMenu}
    </div>
  );
}
