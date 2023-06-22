import React from 'react';
import Button from '@material-ui/core/Button';

const cancel = () => {
    return (<Button onClick={() => {window.history.back(-1);return false;}} variant="contained" color="secondary">Cancel</Button>)
};

export default cancel;