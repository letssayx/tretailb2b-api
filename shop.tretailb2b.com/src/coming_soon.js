import React from 'react';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import { makeStyles } from '@material-ui/core/styles';

const Progress=() => {
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
};
export default Progress;