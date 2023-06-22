import React, { useState, useEffect } from 'react';
import { useDataProvider, Loading, Error } from 'react-admin';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { Title,FileField } from 'react-admin';

const Template= () => {
    return (
      <Card>
      <Title title="Templates" />
      <CardContent>
      <ul>
          <li>Inventory Upload Template <a href="https://storage.googleapis.com/public-templates/inventory_upload_template.csv">Download</a></li>

          <li>Order Upload Template <a href="https://storage.googleapis.com/public-templates/new_order_template.csv">Download</a></li>

          <li>Transaction Upload Template <a href="https://storage.googleapis.com/public-templates/transaction_template.csv">Download</a></li>

          <li>Return Receieve Upload Template <a href="https://storage.googleapis.com/public-templates/return_receieve.csv">Download</a></li>

          <li>Warehouse Inventory Add <a href="https://storage.googleapis.com/public-templates/add_inventory.csv">Download</a></li>

          <li>Warehouse Inventory Subtract <a href="https://storage.googleapis.com/public-templates/subtract_inventory.csv">Download</a></li>

          <li>Warehouse Inventory Query <a href="https://storage.googleapis.com/public-templates/query_inventory.csv">Download</a></li>
          
          <li>Inventory Bin Update <a href="https://storage.googleapis.com/public-templates/update_inventory_bin.csv">Download</a></li>

      </ul>
      * Please export it into CSV before upload it into the system
      
      </CardContent>
  </Card>     
  )
  };
  export default Template;