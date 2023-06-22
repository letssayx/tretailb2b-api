import { fetchUtils } from 'react-admin';
import { stringify } from 'query-string';
import { HttpError } from 'react-admin';

const apiUrl = process.env.REACT_APP_API_ENDPOINT;
const httpClient = async (url, options = {}) => {
    if (!options.headers) {
        options.headers = new Headers({ Accept: 'application/json', 'x-access-token': localStorage.getItem('access_token'), 'x-default-client-id': localStorage.getItem('default_client_id') });
    }
    //const token = localStorage.getItem('token');
    //options.headers.set('Authorization', `Bearer ${token}`);
    options.credentials = 'include';
    
    try{
        const fetchJson=await fetchUtils.fetchJson(url, options);
        return Promise.resolve(fetchJson)
     }catch(e){
        let message=typeof e.message =='string'?e.message:"Error occurred";
        let {status,body} = e;
        let json;
        try {
            json = JSON.parse(body);
        } catch (e) {
            // not json, no big deal
        }
        if(status==405)
        return Promise.reject(message);
        else
        return Promise.reject(new HttpError(message,status,json));
     }
};
//const httpClient = fetchUtils.fetchJson;

export default {
    getList: (resource, params) => {
        const urlMap = [
            {from: "wms-inbound", to: "logs"}
        ];
        let resourceMap = urlMap.find(element =>element.from == resource);
        if(resourceMap){
            resource = resourceMap.to;
        }
        if(resourceMap && resourceMap.from == 'wms-inbound'){
            params.filter  =  { ...params.filter, wms_inbound:true};
        }
        const { page, perPage } = params.pagination;
        const { field, order } = params.sort;
        const query = {
            sort: JSON.stringify([field, order]),
            range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
            filter: JSON.stringify(params.filter),
        };
        const url = `${apiUrl}/${resource}?${stringify(query)}`;

        return httpClient(url).then(({ headers, json }) => ({
            data: json,
            total: parseInt(headers.get('X-Total-Count').split('/').pop(), 10),
        }));
    },

    getOnly: (resource) =>{
        const urlMap = [
            {from: "wms-inbound", to: "logs"}
        ];
        let resourceMap = urlMap.find(element =>element.from == resource);
        if(resourceMap){
            resource = resourceMap.to;
        }
        return  httpClient(`${apiUrl}/${resource}`).then(({ json }) => ({
               data: json,
             }));
    },

    getOne: (resource, params) =>{
        const urlMap = [
            {from: "wms-inbound", to: "logs"}
        ];
        let resourceMap = urlMap.find(element =>element.from == resource);
        if(resourceMap){
            resource = resourceMap.to;
        }
       
        return httpClient(`${apiUrl}/${resource}/${params.id}`).then(({ json }) => ({
            data: json,
        }))
    },

    getMany: (resource, params) => {
        const query = {
            filter: JSON.stringify({ id: params.ids }),
        };
        const url = `${apiUrl}/${resource}?${stringify(query)}`;
        return httpClient(url).then(({ json }) => ({ data: json }));
    },

    getManyReference_old: (resource, params) => {
        const { page, perPage } = params.pagination;
        const { field, order } = params.sort;
        const query = {
            sort: JSON.stringify([field, order]),
            range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
            filter: JSON.stringify({
                ...params.filter,
                [params.target]: params.id,
            }),
        };
        const url = `${apiUrl}/${resource}/${params.id}`;

        return httpClient(url).then(({ headers, json }) => ({
            data: json
            //total: parseInt(headers.get('X-Total-Count').split('/').pop(), 10),
        }));
    },
    getManyReference: (resource, params) => {
        const { page, perPage } = params.pagination;
        const { field, order } = params.sort;
        const query = {
            sort: JSON.stringify([field, order]),
            range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
            filter: JSON.stringify({
                ...params.filter,
                [params.target]: params.id,
            }),
        };
        const url = `${apiUrl}/${resource}?${stringify(query)}`;

        return httpClient(url).then(({ headers, json }) => ({
            data: json,
            //total: parseInt(headers.get('X-Total-Count').split('/').pop(), 10),
        }));
    },

    update: (resource, params) => {
        if (resource !== 'products' || !params.data.pictures) {
            // fallback to the default implementation
            return httpClient(`${apiUrl}/${resource}/${params.id}`, {
            method: 'POST',
            body: JSON.stringify(params.data),
        }).then(({ json }) => ({ data: json }));
        }

          /**
         * For posts update only, convert uploaded image in base 64 and attach it to
         * the `picture` sent property, with `src` and `title` attributes.
         */
        //console.log(params);
        // Freshly dropped pictures are File objects and must be converted to base64 strings
        const newPictures = params.data.pictures.filter(
            p => p.rawFile instanceof File
        );
         const formerPictures = params.data.pictures.filter(
             p => !(p.rawFile instanceof File)
         );

        return Promise.all(newPictures.map(convertFileToBase64))
            .then(base64Pictures =>
                base64Pictures.map(picture64 => ({
                    src: picture64,
                    title: `${params.data.title}`,
                }))
            )
            .then(transformedNewPictures => {
                var outputobj= {
                    ...params.data,
                    pictures: [
                        ...transformedNewPictures,
                    ],
                    pictures_old: [
                        ...formerPictures,
                    ],
                };
                httpClient(`${apiUrl}/${resource}/${params.id}`, {
                    method: 'POST',
                    body: JSON.stringify(outputobj),
                });
            })
            .then( response  => {
                //console.log(response);
                var output = { data : {  ...params.data,
                                         id: params.id 
                                        }
                };
                return output;
            });

    },
    
    updateOnly: (resource, params) =>
        httpClient(`${apiUrl}/${resource}`, {
            method: 'POST',
            body: JSON.stringify(params.data),
        }).then(({ json }) => ({ data: json })),    

    updateMany: (resource, params) => {
        const query = {
            filter: JSON.stringify({ id: params.ids}),
        };
        return httpClient(`${apiUrl}/${resource}?${stringify(query)}`, {
            method: 'POST',
            body: JSON.stringify(params.data),
        }).then(({ json }) => ({ data: json }));
    },

    create: (resource, params) => {
        if (  ['products','admin/profile-pictures']
              .indexOf(resource) == -1|| 
              !params.data.pictures ) {
            // fallback to the default implementation
            return httpClient(`${apiUrl}/${resource}`, {
                method: 'POST',
                body: JSON.stringify(params.data),
            }).then(({ json }) => ({
                data: { ...params.data, id: json.id },
            }));
            
        }

        /**
         * For posts update only, convert uploaded image in base 64 and attach it to
         * the `picture` sent property, with `src` and `title` attributes.
         */
        //console.log(params);
        // Freshly dropped pictures are File objects and must be converted to base64 strings
        const newPictures = params.data.pictures.filter(
            p => p.rawFile instanceof File
        );
        // const formerPictures = params.data.pictures.filter(
        //     p => !(p.rawFile instanceof File)
        // );

        return Promise.all(newPictures.map(convertFileToBase64))
            .then(base64Pictures =>
                base64Pictures.map(picture64 => ({
                    src: picture64,
                    title: `${params.data.title}`,
                }))
            )
            .then(transformedNewPictures => {
                var outputobj= {
                    ...params.data,
                    pictures: [
                        ...transformedNewPictures
                    ],
                };
               return httpClient(`${apiUrl}/${resource}`, {
                    method: 'POST',
                    body: JSON.stringify(outputobj),
                });
            })
            .then( response  => {
                //console.log(response);
               var output = { data : {
                                        ...params.data, id: response.json.id 
                                    }
                            };
               return output;
            });
      
    },

    delete: (resource, params) =>
        httpClient(`${apiUrl}/${resource}/${params.id}`, {
            method: 'DELETE',
        }).then(({ json }) => ({ data: json })),

    deleteMany: (resource, params) => {
        const query = {
            filter: JSON.stringify({ id: params.ids}),
        };
        return httpClient(`${apiUrl}/${resource}?${stringify(query)}`, {
            method: 'DELETE',
            body: JSON.stringify(params.data),
        }).then(({ json }) => ({ data: json }));
    }
};

/**
 * Convert a `File` object returned by the upload input into a base 64 string.
 * That's not the most optimized way to store images in production, but it's
 * enough to illustrate the idea of data provider decoration.
 */
const convertFileToBase64 = file =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;

        reader.readAsDataURL(file.rawFile);
    });