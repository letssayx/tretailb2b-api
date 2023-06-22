import React from 'react';
import {Box,Typography,Link,} from '@material-ui/core'

const footer=(props)=>{

    return(
        <Box  mt="auto" p={4} >
         <Typography variant="body2" color="textSecondary" align="center">
         {'Copyright © '}
         <Link color="inherit" >
          Tretail
         </Link>{' '}
         {new Date().getFullYear()}
         {'.'}
         </Typography>
        </Box>
    );
}

export default footer;
