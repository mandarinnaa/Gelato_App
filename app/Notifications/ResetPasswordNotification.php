<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
// ❌ COMENTA O ELIMINA ESTA LÍNEA:
// use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

// ❌ ELIMINA "implements ShouldQueue" de aquí:
class ResetPasswordNotification extends Notification
{
    use Queueable;

    public $token;
    public $isGoogleUser;

    public function __construct($token, $isGoogleUser = false)
    {
        $this->token = $token;
        $this->isGoogleUser = $isGoogleUser;
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $url = config('app.frontend_url') . '/reset-password?token=' . $this->token . '&email=' . urlencode($notifiable->email);

        if ($this->isGoogleUser) {
            return (new MailMessage)
                ->subject('Crear Contraseña para tu Cuenta')
                ->greeting('¡Hola ' . $notifiable->name . '!')
                ->line('Has solicitado crear una contraseña para tu cuenta que está vinculada con Google.')
                ->line('Al establecer una contraseña, podrás iniciar sesión tanto con Google como con tu email y contraseña.')
                ->action('Crear Contraseña', $url)
                ->line('Este link expirará en 60 minutos.')
                ->line('Si no solicitaste esto, puedes ignorar este correo y seguir usando Google para iniciar sesión.')
                ->salutation('¡Gracias por usar nuestra aplicación!');
        }

        return (new MailMessage)
            ->subject('Restablecer Contraseña')
            ->greeting('¡Hola ' . $notifiable->name . '!')
            ->line('Estás recibiendo este correo porque recibimos una solicitud para restablecer tu contraseña.')
            ->action('Restablecer Contraseña', $url)
            ->line('Este link expirará en 60 minutos.')
            ->line('Si no solicitaste restablecer tu contraseña, no es necesario que hagas nada.')
            ->salutation('¡Gracias por usar nuestra aplicación!');
    }

    public function toArray($notifiable): array
    {
        return [];
    }
}