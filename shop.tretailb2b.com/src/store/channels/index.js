import React from 'react';
import ReactDOM from 'react-dom';
import AmazonIntegration from './amazon';
import FlipkartIntegration from './flipkart';
import Dashbard from './dashboard';
import {
    useLocation
  } from "react-router-dom";

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const Channel = ( props ) => {

    const query = useQuery();
    let result;
    switch ( query.get("channel") ) {
        case "amazon":
            result = <AmazonIntegration/>;
            break;
        case "flipkart":
            result = <FlipkartIntegration/>;
            break;
        default:
            result = <Dashbard/>;
    }
    return result;
}

export default Channel;