import React , {useState} from 'react';
import { useNotify } from 'react-admin';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import {Loading} from 'react-admin';
import UnshippedListTab from './components/UnshippedListTab'
import ActivePickListTab from './components/ActivePickListTab';


function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function PickList() {
  const defaultCreatePickListFormInputs = {
    dispatchByFilter: 'today',
    orderItem: 'both' ,
    orderType: 'both' ,
    marketplaceName: 'all' ,
    status:'unshipped'
  }
  const classes = useStyles();
  const [tabValue, setTabValue] = React.useState(0);
  const [loading, setLoading] = React.useState(null);
  const [createPickListFormInputs, setCreatePickListInputs] = React.useState(defaultCreatePickListFormInputs);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  }

  const handleLoading = (loadState) => {
    setLoading(loadState)
  }

  const handleCreatePickListFormInput  = (input) => {
    setCreatePickListInputs({ ...createPickListFormInputs, ...input})
  }

  if(loading)
    return <Loading/>;

  return (
    <div className={classes.root}>
      <Paper className={classes.root}>
        <Tabs  value={tabValue} onChange={handleTabChange} aria-label="simple tabs example">
          <Tab label="Create Picklist"  {...a11yProps(0)} />
          <Tab label="Active Picklist" {...a11yProps(1)} />
          {/*
          <Tab label="Processed" {...a11yProps(2)} />
          <Tab label="Labels &  Invoice" {...a11yProps(3)} />
          <Tab label="Manifest" {...a11yProps(4)} />
          */}
        </Tabs>
      </Paper >
      <TabPanel value={tabValue} index={0}>
        <UnshippedListTab 
          loading={ handleLoading } 
          inputs={ createPickListFormInputs }  
          handleInputs = { handleCreatePickListFormInput }
        />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <ActivePickListTab loading={handleLoading} />
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        This feature is under development & testing
      </TabPanel>
      <TabPanel value={tabValue} index={3}>
        This feature is under development & testing
      </TabPanel>
      <TabPanel value={tabValue} index={4}>
        This feature is under development & testing
      </TabPanel>
    </div>
  );
}
