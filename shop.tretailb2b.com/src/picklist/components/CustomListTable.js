import ReactDOM from 'react-dom';
import * as React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { useDataProvider, useNotify,Loading } from 'react-admin';
import Checkbox from '@material-ui/core/Checkbox';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Collapse from '@material-ui/core/Collapse';
import VisibilityOnIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import CustomPagination from './CustomPagination';
import { makeStyles } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { TablePagination } from '@material-ui/core';

const useStyles = makeStyles( theme => ({
   tableRow: {
        cursor: 'pointer'
     }
  })
);

const isDev = () => {
   if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      return true;
   }
   return false;
}

export default function CustomTable( props ) {
 
    const { fetchData,selectItems,selectOrder, resource, onSelect, reload, headers, action, actionBtn } = props;
    const [currentPage, setCurrentPage] = React.useState(0);
    const [totalPage, setTotalPage] = React.useState(0);
    const [fetchedData, setFetchedData] = React.useState([]);
    const [rows, setRows] = React.useState({selected: false, data:[]});
    const [pagesData, setPagesData] = React.useState({});
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const [loading,setLoading] = React.useState(false);
    const [totalCount, setTotalCount] = React.useState(0);
    const pages=[200];
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(pages[currentPage]); 
    const [perPage,setPerPage]=React.useState(0)

    const compareAndCopy = (oldRowsData, newRowsData)=>{

              if(Array.isArray( oldRowsData.data ) || Array.isArray( newRowsData.data ) ){
                newRowsData.data =   newRowsData.data.map((newRowData)=>{
                          let matchedRowData = oldRowsData.data.filter((oldRowData)=>{
                               return oldRowData.key === newRowData.key;
                          });
                          if(matchedRowData.length !== 0 ){
                               newRowData.selected = matchedRowData[0].selected;
                               let oldRowData = matchedRowData[0];
                               if( newRowData.childRows && 
                                   newRowData.childRows.length !==0 &&
                                   oldRowData.childRows &&
                                   oldRowData.childRows.length !==0 
                                ){
                                   newRowData.childRows = newRowData.childRows.map((newChildRowData)=>{
                                         let matchedChildRowData = oldRowData.childRows.filter((oldChildRowData)=>{
                                               return oldChildRowData.key === newChildRowData.key;
                                         })
                                         if(matchedChildRowData.length !== 0){
                                              newChildRowData.selected = matchedChildRowData[0].selected;
                                         }
                                         return newChildRowData;
                                   })
                                 }
                          }
                          return newRowData;
                   })
                   newRowsData.selected = oldRowsData.selected
                   return newRowsData;
              }else{
                  throw "given data is not array"
              }
    }

    const fetchDataSource = (urlPath, resourceChange=false) => {

          setLoading(true);
          dataProvider.getOnly(`${urlPath}`)
         .then(({data})=>{
               let oldPagesData = {...pagesData};
               let oldData = [...data.data];
               let newData = oldData.map((oldRow, index)=>{
                       let newRow = {
                         key: ( 'rowkey' + index),
                         selected: false
                       };
                       if(oldRow.data){
                           newRow["data"] = oldRow.data;
                       }else{
                           throw 'data property missing';
                       }
                       if(oldRow.childRows){
                           if(!Array.isArray(oldRow.childRows)){
                               throw 'childRows should be array'
                           }else{
                               let newChildRows = oldRow.childRows.map((oldRow, index)=>{
                                       let newRow = {
                                         key: 'rowkey' + index,
                                         selected: false
                                       };
                                       if(!oldRow.data){
                                          throw 'data property missing on childRows';
                                       }
                                       newRow["data"] = oldRow.data;
                                       return newRow;
         
                               })
                               newRow["childRows"] = newChildRows;
                           }
                       }else{
                               newRow["childRows"] = [];
                       }
                       return newRow;
               })
               
               if(oldPagesData[`page${currentPage}`] && resourceChange === false){
                    let comparedRowsData = compareAndCopy(oldPagesData[`page${currentPage}`], { selected: false, data: newData});
                    setRows(comparedRowsData);
                    oldPagesData[`page${currentPage}`] = comparedRowsData;
                    setPagesData( oldPagesData );
               }else{
                    setRows({ selected: false, data: newData});
                    oldPagesData[`page${currentPage}`] = { selected: false, data: newData};
                    setPagesData( oldPagesData );
               }
               // setCurrentPage(data.pagination.page);
               setTotalPage(data.pagination.total_page);
               setTotalCount(data.pagination.total_count);
               setLoading(false);
               setPage(data.pagination.total_count)
             
               setPerPage(data.pagination.per_page);
        
               
         }).catch((error)=>{
                setLoading(false);
                let message = isDev()? error.message || error: 'search error';
                notify(message);
         })
     }

    React.useEffect(()=>{
      let newUrl
      if(resource){
         if(resource.split('?').length == 2){
              newUrl = resource.split('?')[0] + `?${resource.split('?')[1]}&page=${currentPage +1}`
         }else{
              newUrl = resource.split('?')[0] + `?page=${currentPage + 1}`
         }
         fetchDataSource(newUrl);
      }
    },[currentPage]);

    React.useEffect(()=>{
      let newUrl
      if(resource){
         if(resource.split('?').length == 2){
              newUrl = resource.split('?')[0] + `?${resource.split('?')[1]}&page=${currentPage + 1}`
         }else{
              newUrl = resource.split('?')[0] + `?page=${currentPage + 1}`
         }
         fetchDataSource(newUrl, true);
      }
    },[resource, reload]);
    
   const handleRowSelect = (key) => {
         let oldPagesData = {...pagesData};
         let oldData = [...rows.data];
         let newData = oldData.filter((oldRow)=>{
              let newSelectVal = !oldRow.selected;
              if(oldRow.key === key){
                oldRow.selected = newSelectVal;
                if(oldRow.childRows){
                   oldRow.childRows= oldRow.childRows.map((oldChildRow)=>{
                      oldChildRow.selected = newSelectVal
                      return oldChildRow;
                   })
                }
              }
              return oldRow;
         })
         setRows({...rows, data:newData})
         oldPagesData[`page${currentPage}`] = {...rows, data:newData};
         setPagesData(oldPagesData)
         onSelect(oldPagesData);
   }

   const handleChildRowSelect = (key, childKey) => {
       let oldPagesData = {...pagesData};
       let oldData = [...rows.data];
       let newData = oldData.filter((oldRow)=>{
            if(oldRow.key === key){
              if(oldRow.childRows){
                  
                  oldRow.childRows = oldRow.childRows.map((oldChildRow)=>{
                     if(oldChildRow.key === childKey){
                          oldChildRow.selected = !oldChildRow.selected 
                     }
                     return oldChildRow;
                  })
                  let selectedChildRows   = oldRow.childRows.filter((oldChildRow)=> oldChildRow.selected == true );
                  let deselectedChildRows = oldRow.childRows.filter((oldChildRow)=> oldChildRow.selected == false );
                  if(oldRow.childRows.length == selectedChildRows.length){
                       oldRow.selected = true;
                  }else if(oldRow.childRows.length == deselectedChildRows.length){
                       oldRow.selected = false;
                  }
              }
            }
            return oldRow;
       })
       setRows({...rows, data:newData})
       oldPagesData[`page${currentPage}`] = {...rows, data:newData};
       setPagesData(oldPagesData)
       onSelect(oldPagesData);
   }

   let showAction = rows.data.filter((row)=>(row.childRows && row.childRows.length!==0)).length !== 0;

   const handleAllRowSelect = () => {
         let oldPagesData = {...pagesData};
         let oldData = [...rows.data];
         let newSelectVal = !rows.selected;
         let newData = oldData.filter((oldRow)=>{
                oldRow.selected = newSelectVal;
                if(oldRow.childRows){
                   oldRow.childRows= oldRow.childRows.map((oldChildRow)=>{
                           oldChildRow.selected = newSelectVal
                           return oldChildRow;
                   })
                }
              return oldRow;
         })
         setRows({selected: newSelectVal, data:newData})
         oldPagesData[`page${currentPage}`] = {selected: newSelectVal, data:newData};
         setPagesData(oldPagesData)
         onSelect(oldPagesData);
   }
   const handleChangePage = (event, newPage) => {
     
      setCurrentPage(parseInt(newPage));
  
    };
  
    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      // setRowsPerPage( {rowsPerPage: event.target.value} );
      setCurrentPage(0)    
    };

// const afterRowSelect=()=>{
// // console.log(currentPage)
//    return rows.data.slice(currentPage*rowsPerPage,(currentPage+1)*rowsPerPage)
// }cons ole.log(rows.data)

   if(loading){
      return <Loading/>
   }

   return (
    <><Box m={1}><Typography variant="subtitle2" gutterBottom>Total{totalCount}</Typography></Box>
    {props.selectStatus && <Box m={1}><Typography variant="subtitle2" gutterBottom>{props.selectStatus}</Typography></Box>}
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            { (onSelect || false) &&
            <TableCell> 
               <Checkbox 
                  onClick={(event)=>{
                     event.stopPropagation()
                     handleAllRowSelect();
                  }} 
                 checked={rows.selected || false} 
               /> 
            </TableCell>}
            {
                headers.main.map((singleHeader, index)=>{
                      let align = (index === 0) ? 'left': 'right';
                      return <TableCell align={align}>{singleHeader.fieldName}</TableCell>
                })
            }
            {
              (showAction || actionBtn !==undefined) &&
              <TableCell align="right">Action</TableCell>
            }
          </TableRow>
        </TableHead>
        <TableBody>
        {rows.data.map((row) => (
              <CustomTableRow 
                 keyVal = {row.key} 
                 record = {row.data} 
                 selected = {row.selected} 
                 onSelect = {onSelect? handleRowSelect: undefined} 
                 childRows = {row.childRows} 
                 onChildSelect = {onSelect? handleChildRowSelect: undefined}
                 pagekey = {`page${currentPage}`}
                 headers = {headers}
                 showAction = {showAction}
                 action = {props.action}
                 actionBtn = { actionBtn }
              />
           ))}
        </TableBody>
      </Table>
       {/* <CustomPagination 
          count={totalPage} 
          currentPage={currentPage} 
          onChange={(page)=>setCurrentPage(page)}
       /> */}
       <TablePagination
          rowsPerPageOptions={pages}
          count={page} 
          rowsPerPage={rowsPerPage}
          page={currentPage}
          labelRowsPerPage={<span></span>}
          onChangePage={handleChangePage} 
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
    </TableContainer>
    </>
  );
}


const CustomTableRow = (props) => {
    const {keyVal, selected, record, onSelect, childRows, onChildSelect, pageKey, headers } = props;
    const [expand, setExpand ] = React.useState(false);
    const classes = useStyles();

    React.useEffect(()=>{
       setExpand(false);
    },[pageKey]);

    return (
         <>
         <TableRow
         key={record.id}
         sx={{ '&:last-child td, &:last-child th': { border: 0 },'cursor':'pointer'}}
         className={classes.tableRow}
         onClick={()=>{
             if(props.action){
                 props.action({data:record, child: childRows})
             }
         }}         
         >
         { onSelect &&
         <TableCell align="left" > 
         <Checkbox 
            onClick={(event)=>{
               event.stopPropagation();
               onSelect(keyVal)
            }} 
            checked={ selected || false } 
         /> 
         </TableCell>}
          {
                headers.main.map((singleHeader, index)=>{
                      let align = (index === 0 ) ? 'left': 'right';
                      return <TableCell align={align}>{record[singleHeader.fieldAttr]}</TableCell>
                })
          }
          {(props.showAction || props.actionBtn !==undefined) &&
            <TableCell align="right">
               {props.showAction?<>
               { expand? 
               <VisibilityOffIcon 
               style={{cursor:'pointer'}} 
               onClick={(event)=>{ 
                  event.stopPropagation(); 
                  setExpand(false); 
               }}
               />: 
               <VisibilityOnIcon 
                  style={{cursor:'pointer'}}
                  onClick={(event)=>{ 
                     event.stopPropagation(); 
                     setExpand(true); 
                  }} 
               /> 
               }</>:<></>}
               {props.actionBtn !==undefined && props.actionBtn({data:record, child: childRows})}
            </TableCell>
          }
         </TableRow>
         {childRows && (childRows.length !==0) &&
           <CustomTableRowDetails keyVal = { keyVal } childRows={ childRows } expand={ expand } onChildSelect={ onChildSelect } headers={headers}/>
         }
         </>
    )
}

const CustomTableRowDetails = ( props )=>{
 
    const { childRows, expand , keyVal, onChildSelect, headers } = props;

    return( <TableRow  style={{ padding: '0', margin:'0'}}>
               <TableCell colSpan={7} style={{ padding: '0', margin:'0',  border: 'none'}}>
                  <Collapse in={expand} style={ { margin:'0', padding: '10px' } }>
                      <TableContainer component={Paper}>
                         <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                               <TableRow>
                               { onChildSelect && <TableCell></TableCell>}
                               {
                                  headers.child.map((singleHeader, index)=>{
                                        let align = (index === 0) ? 'left': 'right';
                                        return <TableCell align={align}><b>{singleHeader.fieldName}</b></TableCell>
                                  })
                                }
                               </TableRow>
                             </TableHead>
                             <TableBody>
                                 {
                                    childRows && (childRows.length !==0 ) &&
                                    childRows.map((singleChildRow) => (             
                                     <CustomTableChildRow chldKey= { singleChildRow.key } selected = {singleChildRow.selected} record = {singleChildRow.data} prntKey = {keyVal} onSelect={onChildSelect} headers={headers}/>
                                    ))
                                  }
                            </TableBody>
                         </Table>
                      </TableContainer>
               </Collapse>
            </TableCell>
        </TableRow>
       );
}

const CustomTableChildRow = (props) => {
  const {chldKey, selected, record, onSelect, prntKey, headers } = props;
  return (
       <TableRow
         key={record.id}
         sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
       >
        {onSelect &&
         <TableCell>
            <Checkbox 
             onClick = {(event)=>{
                 event.stopPropagation();
                 onSelect(prntKey, chldKey);
            }}
             checked = { selected || false}/> 
         </TableCell>}
         {
            headers.child.map((singleHeader, index)=>{
                  let align = (index === 0) ? 'left': 'right';
                  return <TableCell align={align}>{record[singleHeader.fieldAttr]}</TableCell>
            })
         }
       </TableRow>
  )
}