<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ContactUsMail extends Mailable
{
    use Queueable, SerializesModels;

    public $details;

    public function __construct($details)
    {
        $this->details = $details;
    }

public function build()
{
    return $this->from('notification@testnixt.com', $this->details['name'])
        ->replyTo($this->details['email'], $this->details['name'])
        ->subject($this->details['subject'])
        ->view('emails.contact');
}

}
