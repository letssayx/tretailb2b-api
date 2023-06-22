<?php

namespace App\Mail;

use App\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class UserSignup extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * The order instance.
     *
     * @var link
     */
    public $link;
    public $client_name;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($link,$client_name='Guest')
    {
        $this->link = $link;
        $this->client_name = $client_name;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->view('emails.user-signup');
    }
}