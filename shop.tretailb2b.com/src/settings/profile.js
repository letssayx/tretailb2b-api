import React, { useState, useEffect } from 'react';
import { useDataProvider,AutocompleteInput,Loading,Error,
    SimpleForm
} from 'react-admin';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { Title } from 'react-admin';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';


const Profile= () => {
    const dataProvider = useDataProvider();
    const [user, setUser] = useState();
    const [store, setStore] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const role = localStorage.getItem('permissions');
    const selected_store = localStorage.getItem('default_client_id');
    const role_json =  JSON.parse(role);
    let user_store=[];
    //console.log(role_json.stores);
    role_json.stores.forEach(element => {
        if(element.id == selected_store) {
            user_store.push({client_id: element.id,client_name: element.client,selected:true});
        } else {
            user_store.push({client_id: element.id,client_name: element.client,selected:false});
        }
    });

    useEffect(() => {
        dataProvider.getOnly('profile')
        .then(({ data }) => {
            setUser(data);
            setStore(user_store)
            setLoading(false);
        })
        .catch(error => {
            setError(error);
            setLoading(false);
        }).finally(() => {
        console.log("ok");
    })
    }, []);

    if (loading) return <Loading />;
    if (error) return <Error />;
    if (!user) return null;

    //setStore(user_store);
    //console.log(user_store);

    let options = store.map((data) =>
        <option 
            key={data.client_id}
            value={data.client_id}
            selected={data.selected===true ? 'selected' : '' }>
            {data.client_name}
        </option>
    );

    //On the change event for the select box pass the selected value back to the parent
    const handleChange = (event) => {
        setLoading(true);
        let selectedValue = event.target.value;
        dataProvider.updateOnly('update_default_store',{data : {client_id: selectedValue}})
        .then(({ data }) => { 
            if(data.status == "success") {
                setLoading(false);
                localStorage.setItem('default_client_id', selectedValue);
                //console.log(selectedValue);
                window.location.reload(true);
            } else {
                setError(data.message);
                setLoading(false);
            }
        })
        .catch(error => {
            setError(error);
            setLoading(false);
        })
    }

    return (
        <Card>
            <SimpleForm>
            <Title title="Profile" />
            <CardContent>
                <ul>
                    <li>Name: {user.user.name}</li>
                    <li>Email: {user.user.email}</li>
                </ul>
                Change Store 
                {/* <select name="selected_store" className="selected_store" onChange={handleChange}>{options}</select> */}
                <FormControl variant="filled" style={{minWidth: 100,paddingLeft:2,paddingBottom:14}} sx={{ m:1}}>

                <AutocompleteInput
                optionText="product_name_with_sku"
                suggestionLimit={10}
                options={{
                  suggestionsContainerProps: {
                    disablePortal: true,
                  }
                }}
                />

                    <InputLabel id="demo-simple-select-filled-label"> Select</InputLabel>
                    <Select
                        labelId="demo-simple-select-filled-label"
                        id="demo-simple-select-filled"
                        name="selected_store"
                        className="selected_store"
                        label="State"
                        onChange={handleChange}
                    > 
                        {store.map((data) => (
                            <MenuItem key={data.client_id} value={data.client_id} selected={data.selected===true ? 'selected' : '' }> {data.client_name}</MenuItem>
                        ))}
                        {/* <MenuItem  value={client_id} selected={selected===true ? 'selected' : '' }>client_name</MenuItem> */}
                    </Select>
                </FormControl>
            </CardContent>
            </SimpleForm>
        </Card>
    )
};
export default Profile;