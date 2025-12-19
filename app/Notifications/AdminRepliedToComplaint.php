<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Notifiable;


class AdminRepliedToComplaint extends Notification
{
    use Queueable;

    protected $complaint;

    public function __construct($complaint)
    {
        $this->complaint = $complaint;
    }

    public function via($notifiable)
    {
        return ['database']; // يمكن إضافة 'mail' لو عايزة الإشعار يروح كإيميل كمان
    }

    public function toDatabase($notifiable)
    {
        return [
            'message' => $this->complaint->admin_reply, // مطلوب
            'icon' => 'bi bi-chat-dots',               // اختياري
            'date' => now()->toDateString(),
            'time' => now()->toTimeString(),
            'complaint_id' => $this->complaint->id,
            'title' => 'تم الرد على الشكوى الخاصة بك',
        ];
    }
}
