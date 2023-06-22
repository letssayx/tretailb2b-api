
import React , { useEffect,useState } from 'react';
import { useDataProvider } from 'react-admin';
const ChatwootWidget = () => {
  const dataProvider = useDataProvider();
 
  useEffect(() => {
    window.addEventListener('chatwoot:ready', function () {
      dataProvider.getOnly('profile') .then(({ data }) => {
        console.log(data)
      window.$chatwoot.setUser(" ", {
          email: data.email,
          name:  data.name,
          avatar_url: " ",
      });
    })
  });
   
    // Add Chatwoot Settings
    window.chatwootSettings = {
      hideMessageBubble: false,
      position: "right",
      locale: "en",
      type: "standard",
    };

    (function (d, t) {
      var BASE_URL = "https://app.chatwoot.com";
      var g = d.createElement(t),
        s = d.getElementsByTagName(t)[0];
      g.src = BASE_URL + "/packs/js/sdk.js";
      g.defer = true;
      g.async = true;
      
      s.parentNode.insertBefore(g, s);
      g.onload = function () {
        window.chatwootSDK.run({
          websiteToken: "vM1zmuM1Shx2F4AyybuqegAN",// add your secret token here,
          baseUrl: BASE_URL,
        });
      };
    })(document, "script");
  }, []);
  return null;
  
};
export default ChatwootWidget;

