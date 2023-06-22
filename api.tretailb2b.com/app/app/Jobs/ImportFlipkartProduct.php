<?php

namespace App\Jobs;


use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use GuzzleHttp\Client;
use GuzzleHttp\Psr7;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Stream\Stream;
use Orchestra\Parser\Xml\Facade as XmlParser;
use App\Helper\AmazonClient;
use App\Store\Brand;
use App\Store\Category;
use App\Store\Country;
use App\Store\Manufacturer;
use App\Store\Log;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManagerStatic as Image;
use Google\Cloud\Storage\StorageClient;
use App\Store\Product;
use App\Store\Item;
use App\Client as SystemClient;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Store\Setting;


class ImportFlipkartProduct implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $client_id;
    protected $task_code;
    protected $queue_id;

    /**
     * Create a new job instance.
     *
     * @param  Podcast  $podcast
     * @return void
     */
    public function __construct($client_id,$task_code,$queue_id)
    {
        $this->client_id = $client_id;
        $this->task_code = $task_code;
        $this->queue_id = $queue_id;
    }

    /**
     * Execute the job.
     *
     * @param  AudioProcessor  $processor
     * @return void
     */
    public function handle()
    {
    }

  
}