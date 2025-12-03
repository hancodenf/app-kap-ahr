<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    /**
     * The password reset token.
     */
    public string $token;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $token)
    {
        $this->token = $token;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $resetUrl = url(route('password.reset', [
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ], false));

        $expireMinutes = config('auth.passwords.'.config('auth.defaults.passwords').'.expire');

        return (new MailMessage)
            ->subject('Reset Password - ' . config('app.name'))
            ->greeting('Halo, ' . $notifiable->name . '!')
            ->line('Kami menerima permintaan untuk mereset password akun Anda.')
            ->line('Untuk keamanan akun Anda, silakan klik tombol di bawah ini untuk membuat password baru.')
            ->action('Reset Password', $resetUrl)
            ->line('Link reset password ini akan kedaluwarsa dalam **' . $expireMinutes . ' menit**.')
            ->line('')
            ->line('**Catatan Penting:**')
            ->line('• Jika Anda tidak melakukan permintaan ini, abaikan email ini.')
            ->line('• Password Anda tidak akan berubah sampai Anda mengklik tombol di atas.')
            ->line('• Jangan bagikan link ini kepada siapapun untuk keamanan akun Anda.')
            ->line('')
            ->line('Jika tombol di atas tidak berfungsi, salin dan tempel URL berikut ke browser:')
            ->line($resetUrl)
            ->salutation('Hormat kami,\n\nTim ' . config('app.name'));
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
