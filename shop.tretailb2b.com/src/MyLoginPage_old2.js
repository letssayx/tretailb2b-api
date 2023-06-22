import * as React from 'react';
import { useState } from 'react';
import { useLogin,Login, useNotify, Notification } from 'react-admin';
import { ThemeProvider } from '@material-ui/styles';

const MyLoginPage = () => (
    <Login />
);

export default MyLoginPage;