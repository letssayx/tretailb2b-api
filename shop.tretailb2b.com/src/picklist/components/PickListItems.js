import React from 'react';
import CustomTable from './CustomListTable';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'
import {useParams} from 'react-router-dom'
import {useDataProvider, useNotify, Loading } from 'react-admin';

const PickListItems = ()=> {
    const [resource, setResource] = React.useState(null);
    const [timestamp, setTimestamp] = React.useState(0);
    const [selectedItems, setSelectedItems] = React.useState(null);
    const { id } = useParams();
    const [loading, setLoading] = React.useState(false);
    const notify = useNotify();
    const dataProvider = useDataProvider();

    React.useEffect(()=>{
        setResource(`picklist/${id}/items`);
    },[])

    const handleSelectItems = (data) => {
        setSelectedItems(data);
    }

    const handleProcessItems = (data) => {
        let oldData = selectedItems? selectedItems: {};
        let ids = [];
        Object.keys(oldData).forEach((page) => {
            let rows = oldData[page].data;
            rows.forEach((row)=> {
                if(row.selected === true) {
                    ids.push(row.data.id);
                }
            })
        })
        setLoading(true);
        dataProvider.updateOnly(`picklist/process`,{data:{ids,type: 'item'}}).then(({data}) => {
            setLoading(false);
            notify(`${data.message}`); 
        })
        .catch((err) => {
            setLoading(false)
            notify(err.message || err);
        })
    }

    const tableHeaders = React.useMemo(() => {
        return {
            main: [
                {fieldName: 'Sku', fieldAttr: 'sku'},
                {fieldName: 'Quantity', fieldAttr: 'quantity'},
                {fieldName: 'Bin Nos', fieldAttr: 'bin'},
                {fieldName: 'Status', fieldAttr: 'status'}
            ]
        }
    })

    if(loading) {
        return <Loading/>;
    }

    return (
        <Grid container>
            <Grid item md={12}>
                <Box  m={2}
                    display="flex"
                    justifyContent="flex-end"
                    alignItems="flex-end"
                >
                    <Button color="primary" variant="contained" onClick={()=>handleProcessItems()}>Move To Process</Button>
                </Box>
            </Grid>
            <Grid item md={12}>
                <CustomTable 
                    resource={resource} 
                    headers={tableHeaders} 
                    onSelect={handleSelectItems}
                />
            </Grid>
        </Grid>
    );
}

export default PickListItems;