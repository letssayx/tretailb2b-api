<?php

namespace App\Http\Controllers;

use App\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;
use \Firebase\JWT\JWT;
use App\Http\Middleware\TretailAuth;
use App\Helper\ApiAuth;
use App;
use App\Helper\AmazonClient;
use Google\Cloud\Storage\StorageClient;
use Illuminate\Support\Facades\Mail;
use App\Mail\TestMail;
use App\Jobs\ProcessTest;
use GuzzleHttp\Client;
use GuzzleHttp\Psr7;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Stream\Stream;
use Orchestra\Parser\Xml\Facade as XmlParser;
use Enqueue\RdKafka\RdKafkaConnectionFactory;



class TestController extends Controller
{
    /**
     * Get a JWT via given credentials.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function gcp(Request $request)
    {
        try {
            // Authenticating with a keyfile path.
            $storage = new StorageClient([
                'keyFilePath' => env('GCP_STORAGE_KEY_FILE_PATH')
            ]);
            $file = fopen('/var/www/html/400x400.jpg', 'r');
            $bucket = $storage->bucket(env('GCP_PRODUCTS_BUCKET'));
            //$object = $bucket->upload($file, [
            //          'predefinedAcl' => 'publicRead',
            //        'name' => 'testimg.jpg'
            // ]);

            $object = $bucket->object('testimg.jpg');   

            //print_r($object->signedUrl(new \DateTime('tomorrow')));
            print_r($object->gcsUri());
            //$success_obj=array('status'=>'success','message'=> 'working');
            //return response()->json($success_obj,200);
        }
        catch(\Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,401);
          }
    }

    public function sendqueue(Request $request) 
    {
        try { 
            Mail::to('niladridey933@gmail.com')->send(new TestMail(5));
            // for($i=1;$i<=10;$i++) {
            //    print_r(ProcessTest::dispatch($i));
            // }
            // $UTC= Carbon::now();
            // $new=Carbon::createFromFormat('Y-m-d H:i:s', $UTC, 'UTC')
            // ->setTimezone('asia/kolkata');
             //Carbon::createFromFormat('Y-m-d H:i:s', Carbon::now(), 'UTC')->setTimezone('asia/kolkata'));
            
            echo "done";
        }
        catch(\Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,401);
          }

    }
    public function kafka(Request $request) 
    {
        try { 
        //   $connectionFactory = new RdKafkaConnectionFactory([ 
        //     'global' => [
        //         'group.id' => 'nano_group_id',
        //         'metadata.broker.list' => env(KAFKA_BROKER,'kafka:9092'),
        //         'enable.auto.commit' => 'true',
        //     ],
        //     'topic' => [
        //         'auto.offset.reset' => 'beginning',
        //     ],
        // ]);
        
        // $context = $connectionFactory->createContext();
        // $message = $context->createMessage('Nil test 007');
        // $fooTopic = $context->createTopic('my_topic');
        
        // $context->createProducer()->send($fooTopic, $message);
        $arr=json_decode(env('TOPIC_JSON'),true);
        print_r($arr);
        echo "done";
        }
        catch(\Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,401);
          }
    }

    public function awsmarket(Request $request) 
    {
        try { 
            $amazon_client=new AmazonClient(env('AWS_DEVELOPER_ACCESSKEY_ID'),'A15VMM533S51AE','amzn.mws.f4ae5d73-bfdf-3a5c-5b7f-add0efb09585',env('AWS_DEVELOPER_SECRETKEY_ID'));
    
                //$outout_response=$amazon_client->invoke(array('Action'=> 'ListMarketplaceParticipations'),'2011-07-01','/Sellers/2011-07-01',true);
                //$xml = XmlParser::extract($outout_response);
                //echo $outout_response;
                // $result = $xml->parse([
                //                     'list' => ['uses' => 'ListMarketplaceParticipationsResult.ListParticipations.Participation[MarketplaceId,SellerId,HasSellerSuspendedListings]'],
                //                     ]);
                // print_r($result);   
                    $data=[];
                    $data['ASINList.ASIN.'.(0+1)]= 'B07JLMYJPS';
                    $data['ASINList.ASIN.'.(1+1)]= 'B07TKXBX39';
                    $data['Action']= 'GetMatchingProduct';
                    $data['MarketplaceId']= 'A21TJRUUN4KGV';
                    $product_response=$amazon_client->invoke($data,'2011-10-01','/Products/2011-10-01',true);
                    $product_response_xml = simplexml_load_string($product_response);
                    print_r($product_response_xml);
           
        }
        catch(\GuzzleHttp\Exception\ClientException $e) {
            echo $e->getResponse()->getBody()->getContents();
            //echo $e->getMessage();
            //$error_obj=array('status'=>'fail','message'=> $e->getMessage());
            //return response()->json($error_obj,401);
          }

    }

   public function xml_attribute($object, $attribute)
  {
    if(isset($object[$attribute]))
        return (string) $object[$attribute];
  }

    public function xmlparse(Request $request) 
    {
        try { 
            $product_response='<?xml version="1.0"?>
            <GetMatchingProductResponse xmlns="http://mws.amazonservices.com/schema/Products/2011-10-01">
              <GetMatchingProductResult ASIN="B074WBC4DS" status="Success">
                <Product xmlns:ns2="http://mws.amazonservices.com/schema/Products/2011-10-01/default.xsd">
                  <Identifiers>
                    <MarketplaceASIN>
                      <MarketplaceId>A21TJRUUN4KGV</MarketplaceId>
                      <ASIN>B074WBC4DS</ASIN>
                    </MarketplaceASIN>
                  </Identifiers>
                  <AttributeSets>
                    <ns2:ItemAttributes xml:lang="en-IN">
                      <ns2:Brand>Boring Dress</ns2:Brand>
                      <ns2:Color>Aboli</ns2:Color>
                      <ns2:Department>Women</ns2:Department>
                      <ns2:IsAdultProduct>false</ns2:IsAdultProduct>
                      <ns2:Label>Tretail</ns2:Label>
                      <ns2:ListPrice>
                        <ns2:Amount>1099.00</ns2:Amount>
                        <ns2:CurrencyCode>INR</ns2:CurrencyCode>
                      </ns2:ListPrice>
                      <ns2:Manufacturer>Tretail</ns2:Manufacturer>
                      <ns2:MaterialType>Cotton</ns2:MaterialType>
                      <ns2:NumberOfItems>1</ns2:NumberOfItems>
                      <ns2:PackageDimensions>
                        <ns2:Height Units="inches">2.7559055090</ns2:Height>
                        <ns2:Length Units="inches">10.6692913277</ns2:Length>
                        <ns2:Width Units="inches">5.7480314902</ns2:Width>
                        <ns2:Weight Units="pounds">1.0141264052</ns2:Weight>
                      </ns2:PackageDimensions>
                      <ns2:PackageQuantity>1</ns2:PackageQuantity>
                      <ns2:PartNumber>CONAI2P-7171</ns2:PartNumber>
                      <ns2:ProductGroup>Apparel</ns2:ProductGroup>
                      <ns2:ProductTypeName>PAJAMAS</ns2:ProductTypeName>
                      <ns2:Publisher>Tretail</ns2:Publisher>
                      <ns2:Size>Medium</ns2:Size>
                      <ns2:SmallImage>
                        <ns2:URL>https://m.media-amazon.com/images/I/41Xa0JCjB+L._SL75_.jpg</ns2:URL>
                        <ns2:Height Units="pixels">75</ns2:Height>
                        <ns2:Width Units="pixels">50</ns2:Width>
                      </ns2:SmallImage>
                      <ns2:Studio>Tretail</ns2:Studio>
                      <ns2:Title>Boring Dress Women Hosiery Cotton Knitted 2 Piece Nightwear Long Top and Pajama Set(Pink, CONAI2P-7171)</ns2:Title>
                    </ns2:ItemAttributes>
                  </AttributeSets>
                  <Relationships>
                    <VariationParent>
                      <Identifiers>
                        <MarketplaceASIN>
                          <MarketplaceId>A21TJRUUN4KGV</MarketplaceId>
                          <ASIN>B074N9T4QV</ASIN>
                        </MarketplaceASIN>
                      </Identifiers>
                    </VariationParent>
                  </Relationships>
                  <SalesRankings>
                    <SalesRank>
                      <ProductCategoryId>apparel_display_on_website</ProductCategoryId>
                      <Rank>30700</Rank>
                    </SalesRank>
                    <SalesRank>
                      <ProductCategoryId>1968503031</ProductCategoryId>
                      <Rank>242</Rank>
                    </SalesRank>
                  </SalesRankings>
                </Product>
              </GetMatchingProductResult>
              <GetMatchingProductResult ASIN="B07JKKV4QY" status="Success">
                <Product xmlns:ns2="http://mws.amazonservices.com/schema/Products/2011-10-01/default.xsd">
                  <Identifiers>
                    <MarketplaceASIN>
                      <MarketplaceId>A21TJRUUN4KGV</MarketplaceId>
                      <ASIN>B07JKKV4QY</ASIN>
                    </MarketplaceASIN>
                  </Identifiers>
                  <AttributeSets>
                    <ns2:ItemAttributes xml:lang="en-IN">
                      <ns2:Brand>Boring Dress</ns2:Brand>
                      <ns2:Color>Navy</ns2:Color>
                      <ns2:Department>Women</ns2:Department>
                      <ns2:ItemDimensions>
                        <ns2:Height Units="inches">3.93700787000</ns2:Height>
                        <ns2:Length Units="inches">1.96850393500</ns2:Length>
                        <ns2:Width Units="inches">9.84251967500</ns2:Width>
                        <ns2:Weight Units="pounds">0.8818490480000</ns2:Weight>
                      </ns2:ItemDimensions>
                      <ns2:IsAdultProduct>false</ns2:IsAdultProduct>
                      <ns2:Label>Meerkat Apparels</ns2:Label>
                      <ns2:ListPrice>
                        <ns2:Amount>1299.00</ns2:Amount>
                        <ns2:CurrencyCode>INR</ns2:CurrencyCode>
                      </ns2:ListPrice>
                      <ns2:Manufacturer>Meerkat Apparels</ns2:Manufacturer>
                      <ns2:MaterialType>Cotton</ns2:MaterialType>
                      <ns2:NumberOfItems>1</ns2:NumberOfItems>
                      <ns2:PackageDimensions>
                        <ns2:Height Units="inches">1.96850393500</ns2:Height>
                        <ns2:Length Units="inches">9.84251967500</ns2:Length>
                        <ns2:Width Units="inches">3.93700787000</ns2:Width>
                        <ns2:Weight Units="pounds">0.5511556550000</ns2:Weight>
                      </ns2:PackageDimensions>
                      <ns2:PackageQuantity>1</ns2:PackageQuantity>
                      <ns2:PartNumber>BD-FONS116-L</ns2:PartNumber>
                      <ns2:ProductGroup>Apparel</ns2:ProductGroup>
                      <ns2:ProductTypeName>PAJAMAS</ns2:ProductTypeName>
                      <ns2:Publisher>Meerkat Apparels</ns2:Publisher>
                      <ns2:Size>L</ns2:Size>
                      <ns2:SmallImage>
                        <ns2:URL>https://m.media-amazon.com/images/I/41KXmCu+ijL._SL75_.jpg</ns2:URL>
                        <ns2:Height Units="pixels">75</ns2:Height>
                        <ns2:Width Units="pixels">50</ns2:Width>
                      </ns2:SmallImage>
                      <ns2:Studio>Meerkat Apparels</ns2:Studio>
                      <ns2:Title>Boring Dress by Meerkat Women Hosiery Cotton Night Suit Navy - Large (L)</ns2:Title>
                    </ns2:ItemAttributes>
                  </AttributeSets>
                  <Relationships>
                    <VariationParent>
                      <Identifiers>
                        <MarketplaceASIN>
                          <MarketplaceId>A21TJRUUN4KGV</MarketplaceId>
                          <ASIN>B07JLMYJPS</ASIN>
                        </MarketplaceASIN>
                      </Identifiers>
                    </VariationParent>
                  </Relationships>
                  <SalesRankings>
                    <SalesRank>
                      <ProductCategoryId>apparel_display_on_website</ProductCategoryId>
                      <Rank>184268</Rank>
                    </SalesRank>
                    <SalesRank>
                      <ProductCategoryId>1968503031</ProductCategoryId>
                      <Rank>1100</Rank>
                    </SalesRank>
                  </SalesRankings>
                </Product>
              </GetMatchingProductResult>
              <GetMatchingProductResult ASIN="B07JLMYKKH" status="Success">
                <Product xmlns:ns2="http://mws.amazonservices.com/schema/Products/2011-10-01/default.xsd">
                  <Identifiers>
                    <MarketplaceASIN>
                      <MarketplaceId>A21TJRUUN4KGV</MarketplaceId>
                      <ASIN>B07JLMYKKH</ASIN>
                    </MarketplaceASIN>
                  </Identifiers>
                  <AttributeSets>
                    <ns2:ItemAttributes xml:lang="en-IN">
                      <ns2:Brand>Boring Dress</ns2:Brand>
                      <ns2:Color>Off-White</ns2:Color>
                      <ns2:Department>Women</ns2:Department>
                      <ns2:ItemDimensions>
                        <ns2:Height Units="inches">3.93700787000</ns2:Height>
                        <ns2:Length Units="inches">1.96850393500</ns2:Length>
                        <ns2:Width Units="inches">9.84251967500</ns2:Width>
                        <ns2:Weight Units="pounds">0.8818490480000</ns2:Weight>
                      </ns2:ItemDimensions>
                      <ns2:IsAdultProduct>false</ns2:IsAdultProduct>
                      <ns2:Label>Meerkat Apparels</ns2:Label>
                      <ns2:ListPrice>
                        <ns2:Amount>1299.00</ns2:Amount>
                        <ns2:CurrencyCode>INR</ns2:CurrencyCode>
                      </ns2:ListPrice>
                      <ns2:Manufacturer>Meerkat Apparels</ns2:Manufacturer>
                      <ns2:MaterialType>Cotton</ns2:MaterialType>
                      <ns2:NumberOfItems>1</ns2:NumberOfItems>
                      <ns2:PackageDimensions>
                        <ns2:Height Units="inches">1.96850393500</ns2:Height>
                        <ns2:Length Units="inches">9.84251967500</ns2:Length>
                        <ns2:Width Units="inches">3.93700787000</ns2:Width>
                        <ns2:Weight Units="pounds">0.5511556550000</ns2:Weight>
                      </ns2:PackageDimensions>
                      <ns2:PackageQuantity>1</ns2:PackageQuantity>
                      <ns2:PartNumber>BD-FONS118-L</ns2:PartNumber>
                      <ns2:ProductGroup>Apparel</ns2:ProductGroup>
                      <ns2:ProductTypeName>PAJAMAS</ns2:ProductTypeName>
                      <ns2:Publisher>Meerkat Apparels</ns2:Publisher>
                      <ns2:Size>L</ns2:Size>
                      <ns2:SmallImage>
                        <ns2:URL>https://m.media-amazon.com/images/I/31hSbSn1L8L._SL75_.jpg</ns2:URL>
                        <ns2:Height Units="pixels">75</ns2:Height>
                        <ns2:Width Units="pixels">50</ns2:Width>
                      </ns2:SmallImage>
                      <ns2:Studio>Meerkat Apparels</ns2:Studio>
                      <ns2:Title>Boring Dress by Meerkat Women Hosiery Cotton Night Suit Off-White - Large (L)</ns2:Title>
                    </ns2:ItemAttributes>
                  </AttributeSets>
                  <Relationships>
                    <VariationParent>
                      <Identifiers>
                        <MarketplaceASIN>
                          <MarketplaceId>A21TJRUUN4KGV</MarketplaceId>
                          <ASIN>B07JL73G9W</ASIN>
                        </MarketplaceASIN>
                      </Identifiers>
                    </VariationParent>
                  </Relationships>
                  <SalesRankings>
                    <SalesRank>
                      <ProductCategoryId>apparel_display_on_website</ProductCategoryId>
                      <Rank>64539</Rank>
                    </SalesRank>
                    <SalesRank>
                      <ProductCategoryId>1968503031</ProductCategoryId>
                      <Rank>429</Rank>
                    </SalesRank>
                  </SalesRankings>
                </Product>
              </GetMatchingProductResult>
              <GetMatchingProductResult ASIN="B07JKKX54S" status="Success">
                <Product xmlns:ns2="http://mws.amazonservices.com/schema/Products/2011-10-01/default.xsd">
                  <Identifiers>
                    <MarketplaceASIN>
                      <MarketplaceId>A21TJRUUN4KGV</MarketplaceId>
                      <ASIN>B07JKKX54S</ASIN>
                    </MarketplaceASIN>
                  </Identifiers>
                  <AttributeSets>
                    <ns2:ItemAttributes xml:lang="en-IN">
                      <ns2:Brand>Boring Dress</ns2:Brand>
                      <ns2:Color>Off-White</ns2:Color>
                      <ns2:Department>Women</ns2:Department>
                      <ns2:ItemDimensions>
                        <ns2:Height Units="inches">3.93700787000</ns2:Height>
                        <ns2:Length Units="inches">1.96850393500</ns2:Length>
                        <ns2:Width Units="inches">9.84251967500</ns2:Width>
                        <ns2:Weight Units="pounds">0.8818490480000</ns2:Weight>
                      </ns2:ItemDimensions>
                      <ns2:IsAdultProduct>false</ns2:IsAdultProduct>
                      <ns2:Label>Meerkat Apparels</ns2:Label>
                      <ns2:ListPrice>
                        <ns2:Amount>1299.00</ns2:Amount>
                        <ns2:CurrencyCode>INR</ns2:CurrencyCode>
                      </ns2:ListPrice>
                      <ns2:Manufacturer>Meerkat Apparels</ns2:Manufacturer>
                      <ns2:MaterialType>Cotton</ns2:MaterialType>
                      <ns2:NumberOfItems>1</ns2:NumberOfItems>
                      <ns2:PackageDimensions>
                        <ns2:Height Units="inches">1.96850393500</ns2:Height>
                        <ns2:Length Units="inches">9.84251967500</ns2:Length>
                        <ns2:Width Units="inches">3.93700787000</ns2:Width>
                        <ns2:Weight Units="pounds">0.5511556550000</ns2:Weight>
                      </ns2:PackageDimensions>
                      <ns2:PackageQuantity>1</ns2:PackageQuantity>
                      <ns2:PartNumber>BD-FONS118-XL</ns2:PartNumber>
                      <ns2:ProductGroup>Apparel</ns2:ProductGroup>
                      <ns2:ProductTypeName>PAJAMAS</ns2:ProductTypeName>
                      <ns2:Publisher>Meerkat Apparels</ns2:Publisher>
                      <ns2:Size>X-Large</ns2:Size>
                      <ns2:SmallImage>
                        <ns2:URL>https://m.media-amazon.com/images/I/31hSbSn1L8L._SL75_.jpg</ns2:URL>
                        <ns2:Height Units="pixels">75</ns2:Height>
                        <ns2:Width Units="pixels">50</ns2:Width>
                      </ns2:SmallImage>
                      <ns2:Studio>Meerkat Apparels</ns2:Studio>
                      <ns2:Title>Boring Dress by Meerkat Women Hosiery Cotton Night Suit Off-White - X-Large (XL)</ns2:Title>
                    </ns2:ItemAttributes>
                  </AttributeSets>
                  <Relationships>
                    <VariationParent>
                      <Identifiers>
                        <MarketplaceASIN>
                          <MarketplaceId>A21TJRUUN4KGV</MarketplaceId>
                          <ASIN>B07JL73G9W</ASIN>
                        </MarketplaceASIN>
                      </Identifiers>
                    </VariationParent>
                  </Relationships>
                  <SalesRankings>
                    <SalesRank>
                      <ProductCategoryId>apparel_display_on_website</ProductCategoryId>
                      <Rank>64539</Rank>
                    </SalesRank>
                    <SalesRank>
                      <ProductCategoryId>1968503031</ProductCategoryId>
                      <Rank>429</Rank>
                    </SalesRank>
                  </SalesRankings>
                </Product>
              </GetMatchingProductResult>
              <GetMatchingProductResult ASIN="B07JLJL9CZ" status="Success">
                <Product xmlns:ns2="http://mws.amazonservices.com/schema/Products/2011-10-01/default.xsd">
                  <Identifiers>
                    <MarketplaceASIN>
                      <MarketplaceId>A21TJRUUN4KGV</MarketplaceId>
                      <ASIN>B07JLJL9CZ</ASIN>
                    </MarketplaceASIN>
                  </Identifiers>
                  <AttributeSets>
                    <ns2:ItemAttributes xml:lang="en-IN">
                      <ns2:Brand>Boring Dress</ns2:Brand>
                      <ns2:Color>Blue</ns2:Color>
                      <ns2:Department>Women</ns2:Department>
                      <ns2:ItemDimensions>
                        <ns2:Height Units="inches">3.93700787000</ns2:Height>
                        <ns2:Length Units="inches">1.96850393500</ns2:Length>
                        <ns2:Width Units="inches">9.84251967500</ns2:Width>
                        <ns2:Weight Units="pounds">0.8818490480000</ns2:Weight>
                      </ns2:ItemDimensions>
                      <ns2:IsAdultProduct>false</ns2:IsAdultProduct>
                      <ns2:Label>Meerkat Apparels</ns2:Label>
                      <ns2:ListPrice>
                        <ns2:Amount>1299.00</ns2:Amount>
                        <ns2:CurrencyCode>INR</ns2:CurrencyCode>
                      </ns2:ListPrice>
                      <ns2:Manufacturer>Meerkat Apparels</ns2:Manufacturer>
                      <ns2:MaterialType>Cotton</ns2:MaterialType>
                      <ns2:NumberOfItems>1</ns2:NumberOfItems>
                      <ns2:PackageDimensions>
                        <ns2:Height Units="inches">1.96850393500</ns2:Height>
                        <ns2:Length Units="inches">9.84251967500</ns2:Length>
                        <ns2:Width Units="inches">3.93700787000</ns2:Width>
                        <ns2:Weight Units="pounds">0.5511556550000</ns2:Weight>
                      </ns2:PackageDimensions>
                      <ns2:PackageQuantity>1</ns2:PackageQuantity>
                      <ns2:PartNumber>BD-FONS120-L</ns2:PartNumber>
                      <ns2:ProductGroup>Apparel</ns2:ProductGroup>
                      <ns2:ProductTypeName>PAJAMAS</ns2:ProductTypeName>
                      <ns2:Publisher>Meerkat Apparels</ns2:Publisher>
                      <ns2:Size>L</ns2:Size>
                      <ns2:SmallImage>
                        <ns2:URL>https://m.media-amazon.com/images/I/41d+oD51SBL._SL75_.jpg</ns2:URL>
                        <ns2:Height Units="pixels">75</ns2:Height>
                        <ns2:Width Units="pixels">50</ns2:Width>
                      </ns2:SmallImage>
                      <ns2:Studio>Meerkat Apparels</ns2:Studio>
                      <ns2:Title>Boring Dress by Meerkat Women Hosiery Cotton Night Suit Blue - Large (L)</ns2:Title>
                    </ns2:ItemAttributes>
                  </AttributeSets>
                  <Relationships>
                    <VariationParent>
                      <Identifiers>
                        <MarketplaceASIN>
                          <MarketplaceId>A21TJRUUN4KGV</MarketplaceId>
                          <ASIN>B07JKKRLC6</ASIN>
                        </MarketplaceASIN>
                      </Identifiers>
                    </VariationParent>
                  </Relationships>
                  <SalesRankings>
                    <SalesRank>
                      <ProductCategoryId>apparel_display_on_website</ProductCategoryId>
                      <Rank>41804</Rank>
                    </SalesRank>
                    <SalesRank>
                      <ProductCategoryId>1968503031</ProductCategoryId>
                      <Rank>306</Rank>
                    </SalesRank>
                  </SalesRankings>
                </Product>
              </GetMatchingProductResult>
              <GetMatchingProductResult ASIN="B07JLM13CP" status="Success">
                <Product xmlns:ns2="http://mws.amazonservices.com/schema/Products/2011-10-01/default.xsd">
                  <Identifiers>
                    <MarketplaceASIN>
                      <MarketplaceId>A21TJRUUN4KGV</MarketplaceId>
                      <ASIN>B07JLM13CP</ASIN>
                    </MarketplaceASIN>
                  </Identifiers>
                  <AttributeSets>
                    <ns2:ItemAttributes xml:lang="en-IN">
                      <ns2:Brand>Boring Dress</ns2:Brand>
                      <ns2:Color>Blue</ns2:Color>
                      <ns2:Department>Women</ns2:Department>
                      <ns2:ItemDimensions>
                        <ns2:Height Units="inches">3.93700787000</ns2:Height>
                        <ns2:Length Units="inches">1.96850393500</ns2:Length>
                        <ns2:Width Units="inches">9.84251967500</ns2:Width>
                        <ns2:Weight Units="pounds">0.8818490480000</ns2:Weight>
                      </ns2:ItemDimensions>
                      <ns2:IsAdultProduct>false</ns2:IsAdultProduct>
                      <ns2:Label>Meerkat Apparels</ns2:Label>
                      <ns2:ListPrice>
                        <ns2:Amount>1299.00</ns2:Amount>
                        <ns2:CurrencyCode>INR</ns2:CurrencyCode>
                      </ns2:ListPrice>
                      <ns2:Manufacturer>Meerkat Apparels</ns2:Manufacturer>
                      <ns2:MaterialType>Cotton</ns2:MaterialType>
                      <ns2:NumberOfItems>1</ns2:NumberOfItems>
                      <ns2:PackageDimensions>
                        <ns2:Height Units="inches">1.96850393500</ns2:Height>
                        <ns2:Length Units="inches">9.84251967500</ns2:Length>
                        <ns2:Width Units="inches">3.93700787000</ns2:Width>
                        <ns2:Weight Units="pounds">0.5511556550000</ns2:Weight>
                      </ns2:PackageDimensions>
                      <ns2:PackageQuantity>1</ns2:PackageQuantity>
                      <ns2:PartNumber>BD-FONS120-M</ns2:PartNumber>
                      <ns2:ProductGroup>Apparel</ns2:ProductGroup>
                      <ns2:ProductTypeName>PAJAMAS</ns2:ProductTypeName>
                      <ns2:Publisher>Meerkat Apparels</ns2:Publisher>
                      <ns2:Size>M</ns2:Size>
                      <ns2:SmallImage>
                        <ns2:URL>https://m.media-amazon.com/images/I/41d+oD51SBL._SL75_.jpg</ns2:URL>
                        <ns2:Height Units="pixels">75</ns2:Height>
                        <ns2:Width Units="pixels">50</ns2:Width>
                      </ns2:SmallImage>
                      <ns2:Studio>Meerkat Apparels</ns2:Studio>
                      <ns2:Title>Boring Dress by Meerkat Women Hosiery Cotton Night Suit Blue - Medium (M)</ns2:Title>
                    </ns2:ItemAttributes>
                  </AttributeSets>
                  <Relationships>
                    <VariationParent>
                      <Identifiers>
                        <MarketplaceASIN>
                          <MarketplaceId>A21TJRUUN4KGV</MarketplaceId>
                          <ASIN>B07JKKRLC6</ASIN>
                        </MarketplaceASIN>
                      </Identifiers>
                    </VariationParent>
                  </Relationships>
                  <SalesRankings>
                    <SalesRank>
                      <ProductCategoryId>apparel_display_on_website</ProductCategoryId>
                      <Rank>41804</Rank>
                    </SalesRank>
                    <SalesRank>
                      <ProductCategoryId>1968503031</ProductCategoryId>
                      <Rank>306</Rank>
                    </SalesRank>
                  </SalesRankings>
                </Product>
              </GetMatchingProductResult>
              <GetMatchingProductResult ASIN="B084CZBRZD" status="Success">
                <Product xmlns:ns2="http://mws.amazonservices.com/schema/Products/2011-10-01/default.xsd">
                  <Identifiers>
                    <MarketplaceASIN>
                      <MarketplaceId>A21TJRUUN4KGV</MarketplaceId>
                      <ASIN>B084CZBRZD</ASIN>
                    </MarketplaceASIN>
                  </Identifiers>
                  <AttributeSets>
                    <ns2:ItemAttributes xml:lang="en-IN">
                      <ns2:Binding>Apparel</ns2:Binding>
                      <ns2:Brand>Boring Dress</ns2:Brand>
                      <ns2:Color>Grey</ns2:Color>
                      <ns2:Department>Women</ns2:Department>
                      <ns2:ItemDimensions>
                        <ns2:Height Units="inches">3.93700787000</ns2:Height>
                        <ns2:Length Units="inches">1.96850393500</ns2:Length>
                        <ns2:Width Units="inches">9.84251967500</ns2:Width>
                        <ns2:Weight Units="pounds">0.8818490480000</ns2:Weight>
                      </ns2:ItemDimensions>
                      <ns2:IsAdultProduct>false</ns2:IsAdultProduct>
                      <ns2:Label>Meerkat Apparels</ns2:Label>
                      <ns2:ListPrice>
                        <ns2:Amount>1299.00</ns2:Amount>
                        <ns2:CurrencyCode>INR</ns2:CurrencyCode>
                      </ns2:ListPrice>
                      <ns2:Manufacturer>Meerkat Apparels</ns2:Manufacturer>
                      <ns2:MaterialType>Cotton</ns2:MaterialType>
                      <ns2:NumberOfItems>1</ns2:NumberOfItems>
                      <ns2:PackageDimensions>
                        <ns2:Height Units="inches">1.96850393500</ns2:Height>
                        <ns2:Length Units="inches">9.84251967500</ns2:Length>
                        <ns2:Width Units="inches">3.93700787000</ns2:Width>
                        <ns2:Weight Units="pounds">0.5511556550000</ns2:Weight>
                      </ns2:PackageDimensions>
                      <ns2:PackageQuantity>1</ns2:PackageQuantity>
                      <ns2:PartNumber>BD-FONS122-XL</ns2:PartNumber>
                      <ns2:ProductGroup>Apparel</ns2:ProductGroup>
                      <ns2:ProductTypeName>SLEEPWEAR</ns2:ProductTypeName>
                      <ns2:Publisher>Meerkat Apparels</ns2:Publisher>
                      <ns2:Size>X-Large</ns2:Size>
                      <ns2:SmallImage>
                        <ns2:URL>https://m.media-amazon.com/images/I/41aP-hVgt1L._SL75_.jpg</ns2:URL>
                        <ns2:Height Units="pixels">75</ns2:Height>
                        <ns2:Width Units="pixels">50</ns2:Width>
                      </ns2:SmallImage>
                      <ns2:Studio>Meerkat Apparels</ns2:Studio>
                      <ns2:Title>Boring Dress by Meerkat Women Hosiery Cotton Night Suit - X-Large (XL) Grey</ns2:Title>
                    </ns2:ItemAttributes>
                  </AttributeSets>
                  <Relationships>
                    <VariationParent>
                      <Identifiers>
                        <MarketplaceASIN>
                          <MarketplaceId>A21TJRUUN4KGV</MarketplaceId>
                          <ASIN>B07JLRTZKF</ASIN>
                        </MarketplaceASIN>
                      </Identifiers>
                    </VariationParent>
                  </Relationships>
                  <SalesRankings>
                    <SalesRank>
                      <ProductCategoryId>apparel_display_on_website</ProductCategoryId>
                      <Rank>268113</Rank>
                    </SalesRank>
                    <SalesRank>
                      <ProductCategoryId>1968501031</ProductCategoryId>
                      <Rank>5475</Rank>
                    </SalesRank>
                  </SalesRankings>
                </Product>
              </GetMatchingProductResult>
              <GetMatchingProductResult ASIN="B07JLJLC38" status="Success">
                <Product xmlns:ns2="http://mws.amazonservices.com/schema/Products/2011-10-01/default.xsd">
                  <Identifiers>
                    <MarketplaceASIN>
                      <MarketplaceId>A21TJRUUN4KGV</MarketplaceId>
                      <ASIN>B07JLJLC38</ASIN>
                    </MarketplaceASIN>
                  </Identifiers>
                  <AttributeSets>
                    <ns2:ItemAttributes xml:lang="en-IN">
                      <ns2:Brand>Boring Dress</ns2:Brand>
                      <ns2:Color>Pink</ns2:Color>
                      <ns2:Department>Women</ns2:Department>
                      <ns2:ItemDimensions>
                        <ns2:Height Units="inches">3.93700787000</ns2:Height>
                        <ns2:Length Units="inches">1.96850393500</ns2:Length>
                        <ns2:Width Units="inches">9.84251967500</ns2:Width>
                        <ns2:Weight Units="pounds">0.8818490480000</ns2:Weight>
                      </ns2:ItemDimensions>
                      <ns2:IsAdultProduct>false</ns2:IsAdultProduct>
                      <ns2:Label>Meerkat Apparels</ns2:Label>
                      <ns2:ListPrice>
                        <ns2:Amount>1299.00</ns2:Amount>
                        <ns2:CurrencyCode>INR</ns2:CurrencyCode>
                      </ns2:ListPrice>
                      <ns2:Manufacturer>Meerkat Apparels</ns2:Manufacturer>
                      <ns2:MaterialType>Cotton</ns2:MaterialType>
                      <ns2:NumberOfItems>1</ns2:NumberOfItems>
                      <ns2:PackageDimensions>
                        <ns2:Height Units="inches">1.96850393500</ns2:Height>
                        <ns2:Length Units="inches">9.84251967500</ns2:Length>
                        <ns2:Width Units="inches">3.93700787000</ns2:Width>
                        <ns2:Weight Units="pounds">0.5511556550000</ns2:Weight>
                      </ns2:PackageDimensions>
                      <ns2:PackageQuantity>1</ns2:PackageQuantity>
                      <ns2:PartNumber>BD-FONS128-XL</ns2:PartNumber>
                      <ns2:ProductGroup>Apparel</ns2:ProductGroup>
                      <ns2:ProductTypeName>PAJAMAS</ns2:ProductTypeName>
                      <ns2:Publisher>Meerkat Apparels</ns2:Publisher>
                      <ns2:Size>X-Large</ns2:Size>
                      <ns2:SmallImage>
                        <ns2:URL>https://m.media-amazon.com/images/I/41027mAwHjL._SL75_.jpg</ns2:URL>
                        <ns2:Height Units="pixels">75</ns2:Height>
                        <ns2:Width Units="pixels">50</ns2:Width>
                      </ns2:SmallImage>
                      <ns2:Studio>Meerkat Apparels</ns2:Studio>
                      <ns2:Title>Boring Dress by Meerkat Women Hosiery Cotton Night Suit Pink - X-Large (XL)</ns2:Title>
                    </ns2:ItemAttributes>
                  </AttributeSets>
                  <Relationships>
                    <VariationParent>
                      <Identifiers>
                        <MarketplaceASIN>
                          <MarketplaceId>A21TJRUUN4KGV</MarketplaceId>
                          <ASIN>B07JLP87RP</ASIN>
                        </MarketplaceASIN>
                      </Identifiers>
                    </VariationParent>
                  </Relationships>
                  <SalesRankings>
                    <SalesRank>
                      <ProductCategoryId>apparel_display_on_website</ProductCategoryId>
                      <Rank>433540</Rank>
                    </SalesRank>
                    <SalesRank>
                      <ProductCategoryId>1968503031</ProductCategoryId>
                      <Rank>2305</Rank>
                    </SalesRank>
                  </SalesRankings>
                </Product>
              </GetMatchingProductResult>
              <GetMatchingProductResult ASIN="B07KKMT1KS" status="Success">
                <Product xmlns:ns2="http://mws.amazonservices.com/schema/Products/2011-10-01/default.xsd">
                  <Identifiers>
                    <MarketplaceASIN>
                      <MarketplaceId>A21TJRUUN4KGV</MarketplaceId>
                      <ASIN>B07KKMT1KS</ASIN>
                    </MarketplaceASIN>
                  </Identifiers>
                  <AttributeSets>
                    <ns2:ItemAttributes xml:lang="en-IN">
                      <ns2:Brand>Boring Dress</ns2:Brand>
                      <ns2:Color>Green</ns2:Color>
                      <ns2:Department>Women</ns2:Department>
                      <ns2:ItemDimensions>
                        <ns2:Height Units="inches">3.93700787000</ns2:Height>
                        <ns2:Length Units="inches">1.96850393500</ns2:Length>
                        <ns2:Width Units="inches">9.84251967500</ns2:Width>
                        <ns2:Weight Units="pounds">0.8818490480000</ns2:Weight>
                      </ns2:ItemDimensions>
                      <ns2:IsAdultProduct>false</ns2:IsAdultProduct>
                      <ns2:Label>Meerkat Apparels</ns2:Label>
                      <ns2:ListPrice>
                        <ns2:Amount>999.00</ns2:Amount>
                        <ns2:CurrencyCode>INR</ns2:CurrencyCode>
                      </ns2:ListPrice>
                      <ns2:Manufacturer>Meerkat Apparels</ns2:Manufacturer>
                      <ns2:MaterialType>Cotton</ns2:MaterialType>
                      <ns2:NumberOfItems>1</ns2:NumberOfItems>
                      <ns2:PackageDimensions>
                        <ns2:Height Units="inches">1.96850393500</ns2:Height>
                        <ns2:Length Units="inches">9.84251967500</ns2:Length>
                        <ns2:Width Units="inches">3.93700787000</ns2:Width>
                        <ns2:Weight Units="pounds">0.5511556550000</ns2:Weight>
                      </ns2:PackageDimensions>
                      <ns2:PackageQuantity>1</ns2:PackageQuantity>
                      <ns2:PartNumber>BD-NS1SIDE37-L</ns2:PartNumber>
                      <ns2:ProductGroup>Apparel</ns2:ProductGroup>
                      <ns2:ProductTypeName>PAJAMAS</ns2:ProductTypeName>
                      <ns2:Publisher>Meerkat Apparels</ns2:Publisher>
                      <ns2:Size>L</ns2:Size>
                      <ns2:SmallImage>
                        <ns2:URL>https://m.media-amazon.com/images/I/31A5GeS9YXL._SL75_.jpg</ns2:URL>
                        <ns2:Height Units="pixels">75</ns2:Height>
                        <ns2:Width Units="pixels">50</ns2:Width>
                      </ns2:SmallImage>
                      <ns2:Studio>Meerkat Apparels</ns2:Studio>
                      <ns2:Title>Boring Dress by Meerkat Women Hosiery Cotton Night Suit Green - Large (L)</ns2:Title>
                    </ns2:ItemAttributes>
                  </AttributeSets>
                  <Relationships>
                    <VariationParent>
                      <Identifiers>
                        <MarketplaceASIN>
                          <MarketplaceId>A21TJRUUN4KGV</MarketplaceId>
                          <ASIN>B07KKNMXGV</ASIN>
                        </MarketplaceASIN>
                      </Identifiers>
                    </VariationParent>
                  </Relationships>
                  <SalesRankings>
                    <SalesRank>
                      <ProductCategoryId>apparel_display_on_website</ProductCategoryId>
                      <Rank>266519</Rank>
                    </SalesRank>
                    <SalesRank>
                      <ProductCategoryId>1968503031</ProductCategoryId>
                      <Rank>1570</Rank>
                    </SalesRank>
                  </SalesRankings>
                </Product>
              </GetMatchingProductResult>
              <GetMatchingProductResult ASIN="B07TJTZSQR" status="Success">
                <Product xmlns:ns2="http://mws.amazonservices.com/schema/Products/2011-10-01/default.xsd">
                  <Identifiers>
                    <MarketplaceASIN>
                      <MarketplaceId>A21TJRUUN4KGV</MarketplaceId>
                      <ASIN>B07TJTZSQR</ASIN>
                    </MarketplaceASIN>
                  </Identifiers>
                  <AttributeSets>
                    <ns2:ItemAttributes xml:lang="en-IN">
                      <ns2:Brand>Boring Dress</ns2:Brand>
                      <ns2:Color>Pink</ns2:Color>
                      <ns2:Department>Women</ns2:Department>
                      <ns2:ItemDimensions>
                        <ns2:Height Units="inches">3.93700787000</ns2:Height>
                        <ns2:Length Units="inches">1.96850393500</ns2:Length>
                        <ns2:Width Units="inches">9.84251967500</ns2:Width>
                        <ns2:Weight Units="pounds">0.5511556550000</ns2:Weight>
                      </ns2:ItemDimensions>
                      <ns2:Label>Meerkat Apparels</ns2:Label>
                      <ns2:ListPrice>
                        <ns2:Amount>999.00</ns2:Amount>
                        <ns2:CurrencyCode>INR</ns2:CurrencyCode>
                      </ns2:ListPrice>
                      <ns2:Manufacturer>Meerkat Apparels</ns2:Manufacturer>
                      <ns2:MaterialType>Cotton</ns2:MaterialType>
                      <ns2:NumberOfItems>1</ns2:NumberOfItems>
                      <ns2:PackageDimensions>
                        <ns2:Height Units="inches">1.96850393500</ns2:Height>
                        <ns2:Length Units="inches">9.84251967500</ns2:Length>
                        <ns2:Width Units="inches">3.93700787000</ns2:Width>
                        <ns2:Weight Units="pounds">0.5511556550000</ns2:Weight>
                      </ns2:PackageDimensions>
                      <ns2:PackageQuantity>1</ns2:PackageQuantity>
                      <ns2:PartNumber>BD-NSBOAT35-S</ns2:PartNumber>
                      <ns2:ProductGroup>Apparel</ns2:ProductGroup>
                      <ns2:ProductTypeName>PAJAMAS</ns2:ProductTypeName>
                      <ns2:Publisher>Meerkat Apparels</ns2:Publisher>
                      <ns2:Size>S</ns2:Size>
                      <ns2:SmallImage>
                        <ns2:URL>https://m.media-amazon.com/images/I/31Vufpzd0QL._SL75_.jpg</ns2:URL>
                        <ns2:Height Units="pixels">75</ns2:Height>
                        <ns2:Width Units="pixels">50</ns2:Width>
                      </ns2:SmallImage>
                      <ns2:Studio>Meerkat Apparels</ns2:Studio>
                      <ns2:Title>Boring Dress by Meerkat Women Hosiery Cotton Night Suit Pink - Small (S)</ns2:Title>
                    </ns2:ItemAttributes>
                  </AttributeSets>
                  <Relationships>
                    <VariationParent>
                      <Identifiers>
                        <MarketplaceASIN>
                          <MarketplaceId>A21TJRUUN4KGV</MarketplaceId>
                          <ASIN>B07KKNJHTF</ASIN>
                        </MarketplaceASIN>
                      </Identifiers>
                    </VariationParent>
                  </Relationships>
                  <SalesRankings>
                    <SalesRank>
                      <ProductCategoryId>apparel_display_on_website</ProductCategoryId>
                      <Rank>78607</Rank>
                    </SalesRank>
                    <SalesRank>
                      <ProductCategoryId>1968503031</ProductCategoryId>
                      <Rank>501</Rank>
                    </SalesRank>
                  </SalesRankings>
                </Product>
              </GetMatchingProductResult>
              <ResponseMetadata>
                <RequestId>4af5b420-6cfd-4db4-a34e-c7a3fce4c8e0</RequestId>
              </ResponseMetadata>
            </GetMatchingProductResponse>';
            //$xml_data = str_replace("ns2:","",$product_response);
            //$product_response_xml = XmlParser::extract($xml_data);
            // $product_response_result = $product_response_xml->parse([
            //     'list' => ['uses' => 'RequestReportResult.ReportRequestInfo[ReportProcessingStatus,ReportRequestId]']
            // ]); 
                
            // $product_response_result = $product_response_xml->parse([
            //     //'list' => ['uses' => 'GetMatchingProductResult[Product.Identifiers.MarketplaceASIN.ASIN]'],
            //     'list1' => ['uses' => 'GetMatchingProductResult[Product.Identifiers.MarketplaceASIN.ASIN,Product.AttributeSets.ItemAttributes.Color]']
            //    // 'list1' => ['uses' => 'GetMatchingProductResult[Product]']
            // ]);
            $product_response=str_replace("ns2:","",$product_response);                       
            $xml=simplexml_load_string($product_response);
            //print_r($xml);                      
             //print_r($product_response_result);  
             $data[0]='hey';
             $data[1] ='hey2';
             $data[2] =3;
             print_r($data);
              // ASIN = B07ZHHTJ9N return false for parent child 
             foreach($xml->GetMatchingProductResult as $product) {
                echo $product->Product->SalesRankings->SalesRank[1]->ProductCategoryId;
                    //echo "test";
                    //echo (string)$product->Product->AttributeSets->ItemAttributes->ItemDimensions->Length['Units'];
                    //echo $this->xml_attribute($product->Product->AttributeSets->ItemAttributes->ItemDimensions->Length, 'Units');
                    //echo $product->Product->AttributeSets->ItemAttributes->ItemDimensions->Length[1]->attributes();
                      //echo $product->Product->AttributeSets->ItemAttributes->SmallImage->URL."\n";  
                      // if($product->Product->Relationships->VariationParent) {
                      //     echo "Child listing";
                      //     $variants=[];
                      //     if($product->Product->AttributeSets->ItemAttributes->Color) {
                      //       array_push($variants,array('key'=>'color','value'=>(string)$product->Product->AttributeSets->ItemAttributes->Color));
                      //   }
                      //   if($product->Product->AttributeSets->ItemAttributes->Size) {
                      //       array_push($variants,array('key'=>'size','value'=>(string)$product->Product->AttributeSets->ItemAttributes->Size));
                      //   }
                      //   echo json_encode($variants,true);
                      // }
                      // else if($product->Product->Relationships->VariationChild) {
                      //       echo "Parent Listing";
                      // }
                      // else {
                      //     echo "False";
                      // }
            }                     
           
        }
        catch(\Exception $e) {
            echo $e->getMessage();
            //$error_obj=array('status'=>'fail','message'=> $e->getMessage());
            //return response()->json($error_obj,401);
          }

    }

}
