<?php

namespace App\Notifications;

use App\Models\Complaint;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ComplaintReceived extends Notification implements ShouldQueue
{
    use Queueable;

    protected $complaint;
    protected $user;

    public function __construct(Complaint $complaint, User $user)
    {
        $this->complaint = $complaint;
        $this->user = $user;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('📩 شكوى جديدة من المستخدم')
            ->greeting('مرحباً فريق الدعم،')
            ->line('تم استلام شكوى جديدة من المستخدم: ' . $this->user->name)
            ->line('عنوان الشكوى: ' . $this->complaint->title)
            ->line('نوع الشكوى: ' . $this->complaint->type)
            ->line('التفاصيل: ' . $this->complaint->details)
            ->action('عرض الشكوى', url('/admin/complaints/' . $this->complaint->id))
            ->line('شكراً لكم.');
    }
}
