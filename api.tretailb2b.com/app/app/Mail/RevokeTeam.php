<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class RevokeTeam extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public $recepient;
    public $admin;
    public $client;

    public function __construct($admin, $user, $client)
    {
        //
        $this->recepient = $user;
        $this->admin  = $admin;
        $this->client = $client;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->view('emails.revoke-team')
                    ->subject('Your premission has been removed');
    }
}
