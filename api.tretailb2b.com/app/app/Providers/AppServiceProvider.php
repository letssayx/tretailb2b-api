<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Helper\ApiAuth;
use Illuminate\Support\Facades\Redirect;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
        $this->app->singleton(ApiAuth::class, function ($app) {
            return new ApiAuth();
        });
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        //
        if(env('APP_ENV')!='local') {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }
        
    }
}
