import React from 'react';
import ReactDOM from 'react-dom';
import {ImageInput, Create, SimpleForm, List, Datagrid, TextField, ImageField} from 'react-admin';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';


const useStyles = makeStyles((theme) => ({
    button: {
      margin: theme.spacing(1),
    },
    image: { 
        width: '100px',
        height: 'auto',
    }
}));

const UploadButton = () => {
   
   const classes = useStyles();

   return ( <Button
             variant="contained"
             color="primary"
             className={classes.button}
             startIcon={<CloudUploadIcon />}
            >
             Upload
            </Button>
    )
}

export const ProfilePictureCreate = ( props ) => (

    <Create {...props}  title="Profile Pictures">
        <SimpleForm>
                <ImageInput source="pictures" multiple={true} maxSize="1000000" label="Related pictures" accept="image/*" placeholder={<UploadButton/>}>
                        <ImageField source="src" title="title" />
                </ImageInput>
        </SimpleForm>
    </Create>

)

export const ProfilePictureList = ( props ) => {
   const classes = useStyles();

   return (
    <List {...props} sort={{ field: 'created_at', order: 'ASC' }} title="Profile Pictures">
        <Datagrid rowClick="show">
            <TextField source="id" label="ID"/>
            <ImageField source="src" label="Picture" sortable={false}  classes={classes}/>
            <TextField  source="name" label="Name"/>
        </Datagrid>
    </List>
   );
}


// export default ProfilePicture;
