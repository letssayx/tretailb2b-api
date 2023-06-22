import React from 'react';
import CustomTable from './CustomListTable';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'
import { useHistory } from 'react-router-dom';
import {useDataProvider, useNotify} from 'react-admin';

const ActivePickListTab = (props) => {
    const [resource, setResource] = React.useState(null);
    const [selectedPickList, setSelectedPickList] = React.useState(null);
    const notify = useNotify();
    const dataProvider = useDataProvider();
    const history = useHistory();
    React.useEffect(() => {
        setResource(`picklist`);
    },[])

const handleSelectPickList = (data) => {
    setSelectedPickList(data);
}

const handleNavigation = (data) => {
    history.push(`/picklist/${data.data.id}/items`);
}

const handleImport = ({data,child}) => {
    if(data.id === undefined) {
        notify(`field missing`, 'warning');
    }
    const request = {
        type: 'PICKLIST_DOWNLOAD',
        id: data.id
    }
    props.loading(true);
    dataProvider.updateOnly('logs', {data: request})
    .then(({data}) => {
        props.loading(false);
        if(data.status == "success") {
            notify(`${data.message}`, 'success');
        } else {
            notify(`${data.message}`, 'warning');
        }
    })
    .catch(error => {
        props.loading(false);
        notify(`${error.message}`, 'warning');
    });
}

const handleProcessPickList = (data) => {
    let oldData = selectedPickList? selectedPickList: {};
    let ids = [];
    Object.keys(oldData).forEach((page) => {
        let rows = oldData[page].data;
        rows.forEach((row) => {
            if(row.selected === true) {
                ids.push(row.data.id);
            }
        })
    })
    props.loading(true);
    dataProvider.updateOnly(`picklist/process`,{data:{ids,type: 'picklist'}}).then(({data}) => {
        props.loading(false);
        notify(`${data.message}`); 
    })
    .catch((err) => {
        props.loading(false)
        notify(err.message || err);
    })
}

const tableHeaders = React.useMemo(() => {
    return {
        main: [
            {fieldName: 'Name', fieldAttr: 'name'},
            {fieldName: 'Items', fieldAttr: 'item_count'},
            {fieldName: 'Status', fieldAttr: 'status'},
            {fieldName: 'Created At', fieldAttr: 'created_at'}
        ]
    }
})

    return (
        <Grid container>
            <Grid item md={12}>
                <Box m={1}
                    display="flex"
                    justifyContent="flex-end"
                    alignItems="flex-end"
                >
                    <Button color="primary" variant="contained" onClick={()=>handleProcessPickList()}>Move To Process</Button>
                </Box>
            </Grid>
            <Grid item md={12}>
                <CustomTable 
                    resource={resource} 
                    headers={tableHeaders} 
                    onSelect={handleSelectPickList}
                    action={handleNavigation}
                    actionBtn={(record) => (
                        <Button 
                            variant='contained' 
                            color='primary' 
                            size='small' 
                            onClick={(event) => {
                                event.stopPropagation();
                                handleImport(record);
                            }}
                        >      DOWNLOAD
                        </Button>
)}
/>
</Grid>
</Grid>);
}

export default ActivePickListTab;