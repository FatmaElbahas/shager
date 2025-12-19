<?php

namespace App\Mail;

use App\Models\Activity;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class RequestMail extends Mailable
{
    use Queueable, SerializesModels;

    public $activity;

    public function __construct($activity)
    {
        $this->activity = $activity;
    }

   public function build()
{
    return $this->from('notification@testnixt.com', 'Shagertk')
        ->replyTo($this->activity->user_email, $this->activity->user_name)
        ->subject('طلب انضمام جديد')
        ->view('emails.request')
        ->with([
            'activity' => $this->activity,
        ]);
}

}
