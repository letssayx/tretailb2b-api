import { showNotification,useNotify,useRedirect } from 'react-admin';
//import React, { useState,useEffect } from 'react';

const AuthURL = process.env.REACT_APP_API_ENDPOINT;

const authProvider = {
    // called when the user attempts to log in
    login: ({ username, password }) =>  {
        const request = new Request(AuthURL+'/login', {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify({"email": username,"password": password }),
            headers: new Headers({ 'Content-Type': 'application/json' }),
        });
        return fetch(request)
            .then(response => {
                if (response.status < 200 || response.status >= 300) {
                    throw new Error(response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                //console.log(data);
                if(data.status == "success") {
                    localStorage.setItem('logged', true);
                    localStorage.setItem('permissions', JSON.stringify(data.output_roles));
                    localStorage.setItem('default_client_id', data.default_client_id);
                    localStorage.setItem('access_token', data.access_token);
                    //return Promise.resolve({ redirectTo: '/' });  
                }
                else {
                    throw new Error(data.message);
                    //Promise.reject();
                }

            });
    },
    // called when the user clicks on the logout button
    logout: () => {
        //const [loading, setLoading] = useState(true);
        //const [user, setUser] = useState();
        const request = new Request(AuthURL+'/logout', {
            method: 'GET',
            credentials: 'include',
            headers: new Headers({ 'Content-Type': 'application/json',  'x-access-token': localStorage.getItem('access_token'), 'x-default-client-id': localStorage.getItem('default_client_id') }),
        });
        return fetch(request)
            .then(response => {
                if (response.status < 200 || response.status >= 300) {
                    localStorage.removeItem('logged');
                    localStorage.removeItem('permissions');
                    localStorage.removeItem('default_client_id');
                    localStorage.removeItem('access_token');
                    return Promise.resolve({ redirectTo: '/login' }); 
                }
                return response.json();
            })
            .then((data) => {
                    localStorage.removeItem('logged');
                    localStorage.removeItem('permissions');
                    localStorage.removeItem('default_client_id');
                    localStorage.removeItem('access_token');
                    return Promise.resolve();  

            });
    },
    // called when the API returns an error
    checkError: ({ status }) => {
        if (status === 401 || status === 403) {
            localStorage.removeItem('logged');
            return Promise.reject();
        }
        return Promise.resolve();
    },
    // called when the user navigates to a new location, to check for authentication
    checkAuth: () => {
        // const logged= localStorage.getItem('logged');
        // if(logged) {
        //     console.log('true1');
        //     return Promise.resolve();
        // }
        // return Promise.reject();
        //console.log('true1');
        return localStorage.getItem('logged')
            ? Promise.resolve()
            : Promise.reject();
    },
    // called when the user navigates to a new location, to check for permissions / roles
    getPermissions: () => {
        //console.log('got');
        if(isPublicUrl(window.location.hash)) {
            //console.log('true');
            let store= {client_id: null, client_name: null, client_permissions: {} };
            let default_output = { store:store, others: { is_admin:0, is_super:0}}
            return Promise.resolve(JSON.stringify(default_output));
        }
        const role = localStorage.getItem('permissions');
        const selected_store = localStorage.getItem('default_client_id');
        const role_json =  JSON.parse(role);
        let output;
        let store= {client_id: null, client_name: null, client_permissions: {},is_admin:null };
        let others;
        role_json.stores.forEach(element => {
            if(element.id == selected_store) {
                store = {client_id: element.id, client_name: element.client, client_permissions: element.permissions ,is_admin:element.is_admin};
            }
        });
        // add others 
        others = { is_admin:role_json.others.is_admin, is_super:role_json.others.is_super};

        output = { store:store, others: others }
        //console.log(output);

        if(output) {
            return Promise.resolve(JSON.stringify(output));
        }
        
        return Promise.reject();
        //console.log(JSON.stringify('call'));
        //return Promise.resolve(JSON.stringify(output));
}
};

const isPublicUrl = (url) => {
    
    let url_arr=url.split('?');
    // console.log("test",url_arr);
    if(url_arr[0]=='#/password-reset'||url_arr[0]=='#/signup' || url_arr[0]=='#/verify-shop' || url_arr[0]=='#/verify-user' || url_arr[0]=='#/thank-you-shop-verification' || url_arr[0]=='#/thank-you-user-verification' 
    || /^\#\/password-update\/.+/.test(url_arr[0])==true) {
        return true;
    }
    return false;
}

export default authProvider;