import ReactDOM from 'react-dom';
import * as React from 'react';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';


const CustomPagination = (props) => {
  const {count , onChange, currentPage  } = props;
  const [pages, setPages] = React.useState([]);
  const [width, setWindowWidth] = React.useState(0)

  const handlePageChange = (page) => {
       if(page != '..'){
          onChange(page);
       }
  }

  React.useEffect(()=> {
        let calPages  = [];
        if(count==undefined){
           return;
        }
        if(parseInt( count )>= 0 && parseInt( count ) <= 7){
           for(let i=0; i< parseInt( count ); i++){
               calPages.push({index:  i + 1,  disable: false, display: i + 1}) 
           }
           setPages(calPages);
           return
         }
        if(((parseInt( currentPage ) - 1) >= 4) && (parseInt( count ) - parseInt( currentPage )) >= 4){
            calPages = [
              {index:  1,  disable: false, display: '1'},
              {index:  2,  disable: true, display: '..' },
              {index:  3,  display: parseInt( currentPage ) - 1, disable: false },
              {index:  4,  display: parseInt( currentPage ) , disable: false },
              {index:  5,  display: parseInt( currentPage ) + 1, disable: false },
              {index:  6,  display: '..',  disable: true },
              {index:  7,  display: parseInt( count ), disable: false }
            ]
        }else if((parseInt( count ) - parseInt( currentPage )) >= 4){
            calPages  = [
              {index:  1,  display: 1, disable: false},
              {index:  2,  display: 2, disable: false },
              {index:  3,  display: 3, disable: false },
              {index:  4,  display: 4, disable: false },
              {index:  5,  display: 5, disable: false },
              {index:  6,  display: '..',disable: true },
              {index:  7,  display: parseInt( count ), disable: false}
            ]
        }else if((parseInt( currentPage ) - 1) >= 4){
            calPages = [
              {index:  1,  display: 1,          disable: false},
              {index:  2,  display: '..',       disable: true },
              {index:  3,  display: parseInt( count ) - 4,  disable: false},
              {index:  4,  display: parseInt( count ) - 3 , disable: false},
              {index:  5,  display: parseInt( count ) - 2,  disable: false},
              {index:  6,  display: parseInt( count ) - 1,  disable: false},
              {index:  7,  display: parseInt( count ),      disable: false}
            ]
        }
        setPages(calPages);

  },[parseInt( currentPage ),parseInt( count )])
  
  React.useEffect(() => { 

       updateDimensions();
       window.addEventListener("resize", updateDimensions);
       return () => 
       window.removeEventListener("resize",updateDimensions);
  }, [])

  const updateDimensions = () => {
          const width = window.innerWidth
          setWindowWidth(width)
  }
  const goNextPage = () => {
        if(parseInt( currentPage ) < parseInt( count )){
           onChange(parseInt( currentPage ) + 1);
        }
  }
  const goPrevPage = () => {
         if(parseInt( currentPage ) > 1){
            onChange(parseInt( currentPage ) - 1);
         }
  }
  
  if(width <= 1028){
     return (
       <>{ pages.length >=0 && <div>
         <IconButton size="small" style={{margin:'5px'}} onClick={()=>goPrevPage()}>
              <ArrowBackIosIcon   />
         </IconButton>
         <IconButton size="small" style={{margin:'5px'}} onClick={()=>goNextPage()}>
              <ArrowForwardIosIcon />
         </IconButton> </div>
         }
       </>
     )
  }
  return (<> { pages.length >= 0 && 
        pages.map((singlePage) => 
              (<Button 
              size="small" 
              style={{margin:'2px'}} 
              color={((parseInt( currentPage ) )==singlePage.display? "primary": "")} 
              onClick={()=>handlePageChange(singlePage.display)} 
              >
                 {singlePage.display}
               </Button>
               ))} 
         </>);
}

export default  CustomPagination;