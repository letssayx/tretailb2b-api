<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Store\Log;
use Carbon\Carbon;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Route::middleware('auth:api')->get('/user', function (Request $request) {
//     return $request->user();
// });

// For All without middleware 
Route::post('/login', 'AuthenticationController@login');

// For Admin operations 
Route::prefix('admin')->middleware('tretailadminauth')->group(function () {

      // Users
      Route::get('users', 'AdminController@UserList');
      Route::get('users/{id}', 'AdminController@UserShow');
      Route::post('users/{id}', 'AdminController@UserEdit');
      Route::post('users', 'AdminController@UserCreate');

      // Clients 
      Route::get('clients', 'AdminController@ClientList');
      Route::get('clients/{id}', 'AdminController@ClientShow');
      Route::post('clients', 'AdminController@ClientCreate');
      Route::post('clients/{id}', 'AdminController@ClientEdit');

      // Requests 
      Route::get('requests', 'AdminController@RequestList');
      Route::post('requests', 'AdminController@RequesUpdate');
      Route::get('requests/{id}', 'AdminController@RequestShow');
      Route::delete('requests/{id}', 'AdminController@RequestDelete');

      // Roles 
      Route::get('roles', 'AdminController@RoleListFilter');
      //Route::get('roles/{id}', 'AdminController@RoleShow');
      Route::post('roles', 'AdminController@RoleCreate');
      Route::delete('roles/{id}', 'AdminController@RoleDelete');

      // Logs
      Route::get('logs','Store\Logs\LogController@AdminLogList');
      Route::get('logs/{id}','Store\Logs\LogController@AdminLogShow');

      // Settings
      Route::get('settings/interval-sync-set-job', 'AdminSettingsController@GetSyncIntervalSetJob');
      Route::post('settings/interval-sync-set-job', 'AdminSettingsController@SetSyncIntervalSetJob');

      // Profile
      Route::resource('profile-pictures','ProfilePictureController');

      //Invites
      Route::post('invite/send-mail','InviteController@invite');
      Route::post('invite/accept','InviteController@accept');
});

//User Activity Logs & Notifications
Route::get('settings/activitylogs/{id?}', 'UserActivityController@getLogList')->middleware('tretailauth');
Route::post('settings/activitylog', 'UserActivityController@CreateActivity')->middleware('tretailauth');

// For store works 
// Bundle module
Route::get('/bundles', 'Store\Products\BundleController@BundleList')->middleware('tretailauth');
Route::post('/bundles', 'Store\Products\BundleController@BundleCreate')->middleware('tretailauth');
Route::get('/bundles/{id}','Store\Products\BundleController@BundleShow')->middleware('tretailauth');
Route::get('/bundles/{combo_id}/{item_id}','Store\Products\BundleController@BundleItemShow')->middleware('tretailauth');
Route::post('/bundles/{id}','Store\Products\BundleController@BundleEdit')->middleware('tretailauth');

// Products Module 
Route::get('/products', 'Store\Products\ProductController@ProductList')->middleware('tretailauth');
Route::get('/products/{id}', 'Store\Products\ProductController@ProductShow')->middleware('tretailauth');
Route::post('/products/{id}', 'Store\Products\ProductController@ProductEdit')->middleware('tretailauth');
Route::post('/products', 'Store\Products\ProductController@ProductCreate')->middleware('tretailauth');
Route::delete('/products/{id}', 'Store\Products\ProductController@ProductDelete')->middleware('tretailauth');

// Items module 
Route::get('/wms-inbound/items', 'Store\Products\ItemController@ItemListFilter')->middleware('tretailauth');
Route::get('/wms-inbound/items/{id}', 'Store\Products\ItemController@ItemQuickShow')->middleware('tretailauth');
Route::post('/wms-inbound/items/{id}', 'Store\Products\ItemController@ItemQuickEdit')->middleware('tretailauth');

Route::get('/items', 'Store\Products\ItemController@ItemListFilter')->middleware('tretailauth');
Route::get('/items/{id}', 'Store\Products\ItemController@ItemShow')->middleware('tretailauth');
// Route::post('/items', 'Store\Products\ItemController@ItemCreate')->middleware('tretailauth');
Route::post('/items/{id}', 'Store\Products\ItemController@ItemEdit')->middleware('tretailauth');
Route::delete('/items/{id}', 'Store\Products\ItemController@ItemDelete')->middleware('tretailauth');

// Bulk item edit / get 
Route::post('/items-bulk/{id}', 'Store\Products\ItemController@ItemBulkEdit')->middleware('tretailauth');
Route::get('/items-bulk/{id}', 'Store\Products\ItemController@ItemBulkShow')->middleware('tretailauth');

// Brands module 
Route::get('/brands', 'Store\Products\BrandController@BrandList')->middleware('tretailauth');
Route::get('/brands/{id}', 'Store\Products\BrandController@BrandShow')->middleware('tretailauth');
Route::post('/brands/{id}', 'Store\Products\BrandController@BrandEdit')->middleware('tretailauth');
Route::post('/brands', 'Store\Products\BrandController@BrandCreate')->middleware('tretailauth');
Route::delete('/brands/{id}', 'Store\Products\BrandController@BrandDelete')->middleware('tretailauth');

// Manufacturers module 
Route::get('/manufacturers', 'Store\Products\ManufacturerController@ManufacturerList')->middleware('tretailauth');
Route::get('/manufacturers/{id}', 'Store\Products\ManufacturerController@ManufacturerShow')->middleware('tretailauth');
Route::post('/manufacturers/{id}', 'Store\Products\ManufacturerController@ManufacturerEdit')->middleware('tretailauth');
Route::post('/manufacturers', 'Store\Products\ManufacturerController@ManufacturerCreate')->middleware('tretailauth');
Route::delete('/manufacturers/{id}', 'Store\Products\ManufacturerController@ManufacturerDelete')->middleware('tretailauth');

// Countries module 
Route::get('/countries', 'Store\Products\CountryController@CountryList')->middleware('tretailauth');
Route::get('/countries/{id}', 'Store\Products\CountryController@CountryShow')->middleware('tretailauth');
Route::post('/countries/{id}', 'Store\Products\CountryController@CountryEdit')->middleware('tretailauth');
Route::post('/countries', 'Store\Products\CountryController@CountryCreate')->middleware('tretailauth');
Route::delete('/countries/{id}', 'Store\Products\CountryController@CountryDelete')->middleware('tretailauth');

// Categories module
Route::get('/categories', 'Store\Products\CategoryController@CategoryList')->middleware('tretailauth');
Route::get('/categories/{id}', 'Store\Products\CategoryController@CategoryShow')->middleware('tretailauth');
Route::post('/categories/{id}', 'Store\Products\CategoryController@CategoryEdit')->middleware('tretailauth');
Route::post('/categories', 'Store\Products\CategoryController@CategoryCreate')->middleware('tretailauth');
Route::delete('/categories/{id}', 'Store\Products\CategoryController@CategoryDelete')->middleware('tretailauth');

// Subcategories module 
Route::get('/subcategories', 'Store\Products\CategoryController@SubCategoryListFilter')->middleware('tretailauth');
Route::get('/subcategories/{id}', 'Store\Products\CategoryController@SubCategoryList')->middleware('tretailauth');
Route::post('/subcategories', 'Store\Products\CategoryController@SubCategoryCreate')->middleware('tretailauth');
Route::delete('/subcategories/{id}', 'Store\Products\CategoryController@SubCategoryDelete')->middleware('tretailauth');
Route::get('/subcategories/{id}/tax-rate', 'Store\Products\CategoryController@TaxRate')->middleware('tretailauth');

// Store settings 
Route::get('/settings', 'Store\Settings\SettingController@SettingList')->middleware('tretailauth');
Route::post('/settings', 'Store\Settings\SettingController@SettingCreate')->middleware('tretailauth');

// Store Integration Settings 
Route::post('/settings/amazon_oauth_update', 'Store\Settings\SettingController@SettingUpdateAmazonToken')->middleware('tretailauth');
Route::post('/settings/flipkart_oauth_update', 'Store\Settings\SettingController@SettingUpdateFlipkartToken')->middleware('tretailauth');
Route::post('/settings/oauth_disconnect', 'Store\Settings\SettingController@SettingOauthDisconnect')->middleware('tretailauth');
Route::post('/settings/automate-job', 'Store\Settings\SettingController@AutomateJobUpdate')->middleware('tretailauth');
Route::get('/settings/automate-job', 'Store\Settings\SettingController@AutomateJobShow')->middleware('tretailauth');
Route::post('/settings/gstadd/create', 'AdminController@GstAddCreate')->middleware('tretailauth');
Route::get('/settings/gstadd/show', 'AdminController@GstAddShow')->middleware('tretailauth');
Route::post('settings/change-password','ForgotPasswordController@AddPassword')->middleware('tretailuserauth');

// Team Managements 
Route::get('/teams', 'Store\Teams\TeamController@TeamList')->middleware('tretailteamauth');
Route::get('/teams/{id}', 'Store\Teams\TeamController@TeamShow')->middleware('tretailteamauth');
Route::post('/teams/{id}', 'Store\Teams\TeamController@TeamEdit')->middleware('tretailteamauth');
Route::post('/teams', 'Store\Teams\TeamController@TeamCreate')->middleware('tretailteamauth');
Route::delete('/teams/{id}', 'Store\Teams\TeamController@TeamDelete')->middleware('tretailteamauth');

// Amazon Operations 
Route::post('/tasks', 'Store\Tasks\TaskController@TaskCreate')->middleware('tretailauth');

// Task Logs 
Route::get('/logs', 'Store\Logs\LogController@LogList')->middleware('tretailauth');
Route::post('/logs', 'Store\Logs\LogController@LogCreate')->middleware('tretailauth');
Route::get('/logs/{id}', 'Store\Logs\LogController@LogShow')->middleware('tretailauth');
Route::post('/logs/{id}', 'Store\Logs\LogController@CancelLog')->middleware('tretailauth');


// Orders Module 
// Customer Module 
Route::get('/customers/{type?}', 'Store\Orders\CustomerController@CustomerList')->middleware('tretailauth')->where('type','(b2b|b2c|marketplace)');
Route::get('/customers/{id}', 'Store\Orders\CustomerController@CustomerShow')->middleware('tretailauth')->where('id','[0-9]+');
Route::post('/customers/{id}', 'Store\Orders\CustomerController@CustomerEdit')->middleware('tretailauth');
Route::post('/customers', 'Store\Orders\CustomerController@CustomerCreate')->middleware('tretailauth');
Route::delete('/customers/{id}', 'Store\Orders\CustomerController@CustomerDelete')->middleware('tretailauth');

// Orders
Route::get('/orders', 'Store\Orders\OrderController@OrderList')->middleware('tretailauth');
Route::get('/orders/{id}', 'Store\Orders\OrderController@OrderShow')->middleware('tretailauth');
Route::post('/orders/{id}', 'Store\Orders\OrderController@OrderEdit')->middleware('tretailauth');
Route::post('/orders', 'Store\Orders\OrderController@OrderCreate')->middleware('tretailauth');
Route::delete('/orders/{id}', 'Store\Orders\OrderController@OrderDelete')->middleware('tretailauth');
Route::get('/orders/marketplaces/list', 'Store\Orders\OrderController@MarketPlaces')->middleware('tretailauth');

// Returns
Route::get('/returns', 'Store\Orders\ReturnController@ReturnList')->middleware('tretailauth');
Route::get('/returns/{id}', 'Store\Orders\ReturnController@ReturnShow')->middleware('tretailauth');
Route::post('/returns/{id}', 'Store\Orders\ReturnController@ReturnEdit')->middleware('tretailauth');
//Route::post('/returns', 'Store\Orders\ReturnController@OrderCreate')->middleware('tretailauth');
//Route::delete('/returns/{id}', 'Store\Orders\ReturnController@OrderDelete')->middleware('tretailauth');

// Transaction
Route::get('/transactions', 'Store\Orders\TransactionController@TransactionList')->middleware('tretailauth');
Route::get('/transactions/{id}', 'Store\Orders\TransactionController@TransactionShow')->middleware('tretailauth');
Route::post('/transactions/{id}', 'Store\Orders\TransactionController@TransactionEdit')->middleware('tretailauth');
Route::post('/transactions', 'Store\Orders\TransactionController@TransactionCreate')->middleware('tretailauth');
Route::delete('/transactions/{id}', 'Store\Orders\TransactionController@TransactionDelete')->middleware('tretailauth');

// For All with Common Middleware 
Route::get('/profile', 'UserSettingsController@profile')->middleware('tretailuserauth');
Route::post('/update_default_store', 'UserSettingsController@UpdateDefaultStore')->middleware('tretailuserauth');
Route::get('/logout', 'AuthenticationController@logout')->middleware('tretailuserauth');
Route::post('/test-api', 'Store\Settings\SettingController@AutomatedSyncJob');

// Public API without Middleware 
Route::post('/signup', 'PublicController@Signup');
Route::post('/verify', 'PublicController@Verify');

// Public API for amazon callback / webhook 
Route::get('/amazon-callback', 'PublicController@AmazonCallback');
Route::get('/flipkart-callback', 'PublicController@FlipkartCallback');

// Password Update controllers
Route::post('forgot-password/send-link','ForgotPasswordController@SendLink');
Route::post('forgot-password/reset-password','ForgotPasswordController@ResetPassword');

// Picklist Controlllers
Route::get('/picklist/select-items','PickListController@SelectItems')->middleware('tretailauth');
Route::post('/picklist','PickListController@create')->middleware('tretailauth');
Route::get('/picklist','PickListController@picklist')->middleware('tretailauth');
Route::get('/picklist/{id}/items','PickListController@GetItems')->middleware('tretailauth');
Route::post('/picklist/process','PickListController@process')->middleware('tretailauth');
Route::post('/analytics-dashboard/search-items','AnalyticsController@GetAnalytic');

// Settings Controllers
Route::get('settings/channels','Store\Channels\ChannelController@ChannelList')->middleware('tretailauth');
Route::get('settings/client-info', 'UserSettingsController@ClientInfo')->middleware('tretailuserauth');
Route::post('settings/client-info', 'UserSettingsController@ClientUpdate')->middleware('tretailuserauth');
Route::get('settings/profile-pictures','ProfilePictureController@index')->middleware('tretailuserauth');
Route::get('settings/profile-pictures/{name}','ProfilePictureController@ShowImage')->middleware('tretailuserauth')->name('profile_picture');
Route::post('settings/set-profile-picture','ProfilePictureController@SetProfilePicture')->middleware('clientaccessauth');

// Analytics
Route::prefix('analytics')->middleware(['tretailauth'])->group(function () {
      Route::get('inventory-reorder', 'Store\Products\AnalyticsController@inventoryReorder');
      Route::get('basic-analytics', 'Store\Products\AnalyticsController@basicAnalytics');
      Route::get('state-wise-sales', 'Store\Products\AnalyticsController@statewiseSales');
      Route::get('top-sales', 'Store\Products\AnalyticsController@topSales');
      Route::get('medium-sales', 'Store\Products\AnalyticsController@mediumSales');
      Route::get('low-sales', 'Store\Products\AnalyticsController@lowSales');
      Route::get('worst-products', 'Store\Products\AnalyticsController@worstProducts');
      Route::get('cancelled-products', 'Store\Products\AnalyticsController@cancelledProducts');
      Route::get('returned-products', 'Store\Products\AnalyticsController@returnedProducts');
});

// Put this module in routes/api.php of laravel
// For Testing
Route::get('test', function(){
      try{
            $kafka_producer = \Kafka::producer();
            $topic = "gcp.store.analytics.process.0";
            $kafka_message = [];
            // $kafka_message['marketplaceName'] = $request->marketplaceName;
            // $kafka_message['dispatchBy'] = $request->dispatchBy;
            // $kafka_message['skuPerformance'] = $request->skuPerformance;

            $log = new Log();
            $log->status = "queued";
            $log->description = json_encode([
            'key'   => 'event' ,
            'time'  => Carbon::now() ,
            'value' => 'Task Added in Queue'
            ]);
            $log->name = "ANALYTICS UPDATE";
            $log->save();

            $kafka_message['log_id'] = $log->id;
            $kafka_message['client_id'] = 12;

            $kafka_topic = $kafka_producer->newTopic( $topic );
            $payload = json_encode([
            'body' => json_encode($kafka_message),
            'headers' => []
            ]);
            $kafka_topic->produce(RD_KAFKA_PARTITION_UA, 0, $payload);
            $kafka_producer->poll(0);

            for ($flushRetries = 0; $flushRetries < 10; $flushRetries++) {
            $result = $kafka_producer->flush(10000);
            if (RD_KAFKA_RESP_ERR_NO_ERROR === $result) {
                  break;
            }
            }
            if (RD_KAFKA_RESP_ERR_NO_ERROR !== $result) {
            return "Failed to send kafka message";
            }
            return (($payload));
      } catch(Exception $e) {
            $error_obj=array('status'=>'fail','message'=> $e->getMessage());
            return response()->json($error_obj,400);
      }
});

