import React, { useState, useEffect } from 'react';
import { useDataProvider, Loading, Error } from 'react-admin';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { Title } from 'react-admin';
import { parse } from 'query-string';

import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';

//import './form.css';

// Custom Style
const formStyle  = {
  margin: '0 10px'
}

const AddVariant= (props) => {

// Read the post_id from the location which is injected by React Router and passed to our component
const { product_id: product_id_string } = parse(props.location.search);
  
// ra-data-fakerest uses integers as identifiers, we need to parse the querystring
const product_id = product_id_string ? parseInt(product_id_string, 10) : '';

const [inputList, setInputList] = useState([{
  sku: '',
  mrp: '',
  price:'',
  length: '',
  breadth: '',
  height: '',
  weight: '',
  quantity: ''
}]);
const [inputvariant, setInputVariant] = useState([{
  vkey:'',
  vvalue:''
}]);
const [inputattribute, setInputAttribute] = useState([{
  attkey: '',
  attvalue:''
}]);

  // handle input change
  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    const list = [...inputList];
    list[index][name] = value;
    setInputList(list);
  };
 
  // handle click event of the Remove button
  const handleRemoveClick = index => {
    const list1 = [...inputList];
    list1.splice(index, 1);
    setInputList(list1);
  };
 
  // handle click event of the Add button
  const handleAddClick = () => {
    setInputList([...inputList, {
    sku: '',
    mrp: '',
    price:'',
    length: '',
    breadth: '',
    height: '',
    weight: '',
    quantity: '' 
  }]);
  };

  // handle input change
  const handleVChange = (e, index) => {
    const { name, value } = e.target;
    const list2 = [...inputvariant];
    list2[index][name] = value;
    setInputVariant(list2);
  };
 
  // handle Add click event of Variant
  const handleAddVariant = () => {
    setInputVariant([...inputvariant, { vkey:'', vvalue:'' }]);
  };

  // handle Remove click event of Variant
  const handleRemoveVariant = index => {
    const list2 = [...inputvariant];
    list2.splice(index, 1);
    setInputVariant(list2);
  };

  // handle input change
  const handleAChange = (e, index) => {
    const { name, value } = e.target;
    const list3 = [...inputattribute];
    list3[index][name] = value;
    setInputAttribute(list3);
  };

  // handle Add click event of attribute
  const handleAddAttribute = () => {
    setInputAttribute([...inputattribute, { attkey: '', attval:'' }]);
  };

  // handle Remove click event of attribute
  const handleRemoveAttribute = index => {
    const list3 = [...inputattribute];
    list3.splice(index, 1);
    setInputAttribute(list3);
  };

  const dataProvider = useDataProvider();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const role = localStorage.getItem('permissions');
  const selected_store = localStorage.getItem('default_client_id');

  return (
    <React.Fragment>
      <div style={{overflowX: 'scroll',overflowY: 'hidden',maxWidth:'1200px'}}>
        <form noValidate autoComplete="off">
          <table>
            <tr>
              <td>
                <TextField disabled id="standard-disabled" label="Disabled" defaultValue="{product_id}" />
              </td>
            </tr>
            {/* 1st Arra */}
            <tr>
            {inputList.map((x, i) => {
        return (
          <div >
            <td>
              <TextField 
              id="standard-basic" 
              label="SKU"
              name="sku"
              style={formStyle}
              value={x.sku}
              onChange={e => handleInputChange(e, i)}
              />
            </td>

            <td>
              <TextField 
              id="standard-basic" 
              label="MRP"
              name="mrp"
              style={formStyle} 
              value={x.mrp}
              onChange={e => handleInputChange(e, i)}
              />
            </td>

            <td>
              <TextField 
              id="standard-basic" 
              label="Price"
              name="price"
              style={formStyle} 
              value={x.price}
              onChange={e => handleInputChange(e, i)}
              />
            </td>

            <td>
              <TextField 
              id="standard-basic" 
              label="Length"
              name="length"
              style={formStyle} 
              value={x.length}
              onChange={e => handleInputChange(e, i)}
              />
            </td>

            <td>
              <TextField 
              id="standard-basic" 
              label="Breadth"
              name="breadth"
              style={formStyle} 
              value={x.breadth}
              onChange={e => handleInputChange(e, i)}
              />
            </td>

            <td>
              <TextField 
              id="standard-basic" 
              label="Height"
              name="height"
              style={formStyle} 
              value={x.height}
              onChange={e => handleInputChange(e, i)}
              />
            </td>

            <td style={formStyle}>
              <InputLabel id="demo-simple-select-label">Units</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
              >
                <MenuItem >cm</MenuItem>
                <MenuItem >inches</MenuItem>
              </Select>
            </td>

            <td>
              <TextField 
              id="standard-basic" 
              label="Weight"
              name="weight"
              style={formStyle} 
              value={x.weight}
              onChange={e => handleInputChange(e, i)}
              />
            </td>

            <td style={formStyle}>
              <InputLabel id="demo-simple-select-label">Units</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
              >
                <MenuItem >g</MenuItem>
                <MenuItem >kg</MenuItem>
              </Select>
          </td>

            <td>
              <TextField 
              id="standard-basic" 
              label="Quantity"
              name="quantity"
              style={formStyle} 
              value={x.quantity}
              onChange={e => handleInputChange(e, i)}
              />
            </td>


            <td>
              <div>
            {
              inputvariant.map((x, i) => {
                return (
                  <div>
                    <table>
                      <tr>
                        <td>
                        <TextField 
                        id="standard-basic" 
                        label="Variants.Key"
                        name="vkey"
                        value={x.vkey}
                        style={formStyle}
                        onChange={e => handleVChange(e, i)}
                        />
                      </td>

                      <td>
                        <TextField 
                        id="standard-basic"
                        name="vvalue"
                        label="Variants.Value"
                        style={formStyle}
                        value={x.vvalue}
                        onChange={e => handleVChange(e, i)}
                        />
                      </td>

                      <td></td>

                      <td>
                      {inputvariant.length !== 1 && <RemoveCircleIcon className="mr10" onClick={() => handleRemoveVariant(i)}></RemoveCircleIcon>}
                      </td>

                      </tr>
                    </table>

                    <div>
                      {inputvariant.length - 1 === i && <AddCircleIcon onClick={handleAddVariant}>Add</AddCircleIcon>}
                    </div>

                  </div>
                )
              })
            }
              </div>
            </td>

                <td>
                <div>
                  {
                    inputattribute.map((x, i) => {
                      return (
                        <div>
                          <table>
                            <tr>
                              <td>
                              <TextField 
                              id="standard-basic" 
                              label="Attribute.Key"
                              name="attkey"
                              style={formStyle}
                              value={x.attkey}
                              onChange={e => handleAChange(e, i)}
                              />
                            </td>

                            <td>
                              <TextField 
                              id="standard-basic"
                              label="Attribute.Value"
                              name="attvalue"
                              style={formStyle}
                              value={x.attvalue}
                              onChange={e => handleAChange(e, i)}
                              />
                            </td>

                            <td></td>

                            <td>
                            {inputattribute.length !== 1 && <RemoveCircleIcon className="mr10" onClick={() => handleRemoveAttribute(i)}></RemoveCircleIcon>}
                            </td>

                            </tr>
                          </table>

                          <div>
                            {inputattribute.length - 1 === i && <AddCircleIcon onClick={handleAddAttribute}>Add</AddCircleIcon>}
                          </div>

                        </div>
                      )
                    })
                  }
                </div>
              </td>

            
            <td>
                {inputList.length !== 1 &&
                 <RemoveCircleIcon className="mr10" onClick={() => handleRemoveClick(i)}></RemoveCircleIcon>}
            </td>

  
            <div className="btn-box">
                {inputList.length - 1 === i && <AddCircleIcon onClick={handleAddClick}></AddCircleIcon>}
            </div>

            
          </div>
        );
      })}
            </tr>
          </table>
        </form>
      </div>
      <div style={{ marginTop: 20 }}>{JSON.stringify(inputList)}</div>
      <div style={{ marginTop: 20 }}>{JSON.stringify(inputvariant)}</div>
      <div style={{ marginTop: 20 }}>{JSON.stringify(inputattribute)}</div>
    </React.Fragment>
  );

};

export default AddVariant;