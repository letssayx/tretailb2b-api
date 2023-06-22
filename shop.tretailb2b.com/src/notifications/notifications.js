import React , { useRef,useEffect,useState} from 'react';
import
{
    FormTab,TabbedForm,ReferenceField,UrlField,AutocompleteInput,Filter,
    SearchInput,Create,ArrayField,FunctionField,ChipField,Edit,NumberInput,
    ImageField,DeleteButton,List,useDataProvider,Loading,Error,FormDataConsumer,
    ReferenceInput,SelectInput,BooleanInput,SimpleForm,ArrayInput,TextInput,
    SimpleFormIterator,DateInput,DateTimeInput,ReferenceManyField,Datagrid,TextField,
    DateField,SaveButton,EditButton,Toolbar,useEditController,useRedirect,useNotify,
    Title,RichTextField,FileField,required,minLength,maxLength,minValue,maxValue,
    number,regex,email,choices
} from 'react-admin';

import { Link, useHistory } from 'react-router-dom';

import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import InputAdornment from '@material-ui/core/InputAdornment';
import { makeStyles } from '@material-ui/core/styles';
import MaterialTextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import SearchIcon from '@material-ui/icons/Search';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';

import keyby from 'lodash/keyBy';
import PropTypes from 'prop-types';

import CustomPagination from '../picklist/components/CustomPagination';

const usePanelStyles = makeStyles({
    paper: {
        margin:0,
        padding:0
    }
});

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired
};
  
function a11yProps(index) {
    return {
        id: `scrollable-tab-${index}`,
            'aria-controls': `scrollable-tabpanel-${index}`,
    };
}
  
function TabPanel(props) {
    const { children, value, index, ...other } = props;
    const classes = usePanelStyles();
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`scrollable-auto-tabpanel-${index}`}
            aria-labelledby={`scrollable-auto-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box>
                    <Paper className={classes.paper}>{children}</Paper> 
                </Box>
            )}
        </div>
    );
}

const NotificationList = ({  permissions, ...props }) => {
    return(
        <Card>
            <CardContent>
                <img
                    src="maintenance.png"
                    width="720"
                    height="480"
                >
                </img>
            </CardContent>
        </Card>
    )
}

export const AuditTrail = ({  permissions, ...props }) => {
    const [userActivity,setUserActivity] = useState([]);
    const [sort, setSort] =  useState({ field: 'id', order: 'DESC' });
    const [currentPage, setCurrentPage] = useState(1);
    const dataProvider = useDataProvider();
    const [total, setTotal] = useState(0);
    const redirect = useRedirect();
    const [loading, setLoading] = useState();
    const [searchText, setSearchText] = useState(null);
    const [searchTextPage, setSearchTextPage] = useState(1);

    React.useEffect(() => {
        setLoading(true)
        const params= {
            pagination: {
                page:1,
                perPage: 10
            },
            sort: {
                field:'id',
                order: 'desc'
            },
            filter:{ q:searchText }
        }
        dataProvider.getList(`settings/activitylogs`, params)
        .then(({data,total}) => {
            setUserActivity(data.userActivity);
            setTotal( Math.ceil(parseInt(total) / parseInt(10)) );
            setLoading(false);
        })
        .catch((e) => {
            setLoading(false);
            throw (e.message || e);
        })
    },[searchTextPage, searchText])

    return (
        <>
            <Box p={2}>
                <MaterialTextField
                    variant="filled"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="center">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    onChange = { (e) => setSearchText(e.target.value) }
                />
                {/*
                <Button variant="text" color="primary" startIcon={<AddIcon />} style={{marginLeft:'490px'}}  onClick={() =>redirect(`orders/create`)}>
                    Create 
                </Button>
                */}
            </Box>
            {
                loading
                ?<Loading/>
                :<Datagrid 
                    rowClick={(id) => redirect(`settings/activitylogs/${id}`)}
                    data={keyby(userActivity,'id')}
                    ids={userActivity.map(({ id }) => id)}
                    currentSort={sort}
                >
                    <DateField source="created_at" label="Event Timing" showTime/>
                    <TextField source="subject_type" label="Event Name"/>
                    <TextField source="description" label="Description"/>
                </Datagrid>
            }
            <CustomPagination count={total} currentPage={currentPage} onChange={( page ) => setCurrentPage( page ) } />
        </>        
    );
}

const Notifications = ( props ) =>  {
    const [panel,setPanel]=useState(0);
    let history = useHistory();
    const handleChange=(event,newValue)=>{
        setPanel(newValue);
        history.push(
            `/${
              newValue == 1
              ?"notifications"
              :"notifications"
            }`
        )
    }
    return (
        <div>
            <Paper elevation={2}> 
                <Tabs value={panel} onChange={handleChange} aria-label="simple tabs example">
                    <Tab label="Notifications"   {...a11yProps(0)} />
                    <Tab label="Audit Trail"   {...a11yProps(1)} />
                    {/* <Tab label="Operation" {...a11yProps(2)} /> */}
                </Tabs>
            </Paper>
            <TabPanel value={panel} index={0}> <NotificationList {...props} /> </TabPanel>
            <TabPanel value={panel} index={1}> <AuditTrail {...props}/> </TabPanel>
            {/* <TabPanel value={panel} index={2}> <OrderOperation {...props}/> </TabPanel> */}
        </div>
    );
}
export default Notifications;