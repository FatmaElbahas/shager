<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class SendUserNotification extends Notification
{
    public $title;
    public $message;

    public function __construct($title, $message, $details)
    {
        $this->title   = $title;
        $this->message = $message;
        $this->details = $details;
    }

    public function via($notifiable)
    {
        return ['mail']; // send as email
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject($this->title)
            ->line($this->message)
            ->line('شكراً لاستخدامك شجرتك 🌿')
            ->salutation('شجرتك');
    }


}
