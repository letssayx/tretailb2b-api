<?php

namespace App\Helper;

use Carbon\Carbon;
use GuzzleHttp\Client;
use GuzzleHttp\Psr7;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Stream\Stream;

class AmazonClient 
{
    /* Member variables */
    var $config=[];
    var $ServiceURL;
    var $AWSSecretKey;
      
    function __construct($AWSAccessKeyId, $Merchant, $MWSAuthToken,$AWSSecretKey)  
    { 
        $this->ServiceURL='mws.amazonservices.in';
        $this->config['AWSAccessKeyId']=$AWSAccessKeyId;
        $this->config['Merchant']=$Merchant;
        $this->config['SellerId']=$Merchant;
        $this->config['MWSAuthToken']=$MWSAuthToken;
        $this->config['SignatureVersion']='2';
        $this->config['SignatureMethod']='HmacSHA256';
        $this->AWSSecretKey=$AWSSecretKey;
    }

    public function invoke($data,$version,$endpoint,$is_seller)
    {
        $this->config['Version']=$version;
        $nowInLondonTz = Carbon::now();
        $request=array_merge($this->config,$data);
        if($is_seller) {
          unset($request['Merchant']);
        }
        else {
          unset($request['SellerId']);
        }
        $request['Timestamp']= $nowInLondonTz->toIso8601ZuluString();
        //print_r($this->config);
        $request['Signature']= $this->sign($this->calculateStringToSignV2($request,$endpoint),$this->AWSSecretKey);
        $http_client = new Client();
        $response = $http_client->request('POST', 'https://'.$this->ServiceURL.$endpoint, [
                'form_params' => $request
        ]);
        return $response->getBody();
    }

    public function clean()
    { 
        $this->config=[];
        $this->AWSSecretKey=null;
    }

      /**
   * Calculate String to Sign for SignatureVersion 2
   * @param array $parameters request parameters
   * @return String to Sign
   */
    private function calculateStringToSignV2(array $parameters, $queuepath = null) {

    $data = 'POST';
    $data .= "\n";
    $data .=  $this->ServiceURL;
    $data .= "\n";
    if ($queuepath) {
      $uri  = $queuepath;
    } else {
      $uri = "/";
    }
    //$uriencoded = implode("/", array_map(array($this, "urlencode"), explode("/", $uri)));
    $data .= $uri ;
    $data .= "\n";
    uksort($parameters, 'strcmp');
    $data .= $this->getParametersAsString($parameters);
    
    return $data;
  }

    private function urlencode($value) {
    return str_replace('%7E', '~', rawurlencode($value));
    }
  /**
   * Convert paremeters to Url encoded query string
   */
    private function getParametersAsString(array $parameters)
    {
    $queryParameters = array();
    foreach ($parameters as $key => $value) {
      $queryParameters[] = $key . '=' . $this->urlencode($value);
    }
    return implode('&', $queryParameters);
    }

    /**
   * Computes RFC 2104-compliant HMAC signature
   */
  private function sign($data, $key)
  {
    return base64_encode(hash_hmac('sha256', $data, $key, true));
  }

}


