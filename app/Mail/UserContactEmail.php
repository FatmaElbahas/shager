<?php

namespace App\Mail;

use App\Models\Activity;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class UserContactEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $activity;

    public function __construct($activity)
    {
        $this->activity = $activity;
    }

    public function build()
    {
        return $this->from($this->activity->user_email, $this->activity->user_name)
            ->subject('طلب مراسلة جديد')
            ->view('emails.user_contact')
            ->with([
                'activity' => $this->activity,
            ]);
    }
}
