<?php

namespace App\Mail;

use App\Models\Activity;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ActivityMail extends Mailable
{
    use Queueable, SerializesModels;

    public $activity;

    public function __construct(Activity $activity)
    {
        $this->activity = $activity;
    }

    public function build()
    {
        return $this->subject('طلب جديد من مستخدم')
            ->view('emails.activity')
            ->with([
                'activity' => $this->activity,
                'extra' => json_decode($this->activity->extra_data, true),
            ]);
    }
}
