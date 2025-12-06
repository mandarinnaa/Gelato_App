<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Validator;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Validación de algoritmo de Luhn para tarjetas
        Validator::extend('luhn', function ($attribute, $value, $parameters, $validator) {
            $value = preg_replace('/\D/', '', $value);
            
            if (strlen($value) < 13 || strlen($value) > 19) {
                return false;
            }
            
            $sum = 0;
            $numDigits = strlen($value);
            $parity = $numDigits % 2;
            
            for ($i = 0; $i < $numDigits; $i++) {
                $digit = (int) $value[$i];
                
                if ($i % 2 == $parity) {
                    $digit *= 2;
                }
                
                if ($digit > 9) {
                    $digit -= 9;
                }
                
                $sum += $digit;
            }
            
            return ($sum % 10) == 0;
        });

        // Firebase Storage Driver
        \Illuminate\Support\Facades\Storage::extend('firebase', function ($app, $config) {
            $storageClient = new \Google\Cloud\Storage\StorageClient([
                'projectId' => $config['project_id'],
                'keyFile' => [
                    'type' => 'service_account',
                    'project_id' => $config['project_id'],
                    'private_key_id' => 'undefined', // No necesario para autenticación directa
                    'private_key' => str_replace('\\n', "\n", $config['private_key']), // Fix newlines
                    'client_email' => $config['client_email'],
                    'client_id' => 'undefined',
                    'auth_uri' => 'https://accounts.google.com/o/oauth2/auth',
                    'token_uri' => 'https://oauth2.googleapis.com/token',
                    'auth_provider_x509_cert_url' => 'https://www.googleapis.com/oauth2/v1/certs',
                    'client_x509_cert_url' => 'https://www.googleapis.com/robot/v1/metadata/x509/' . urlencode($config['client_email']),
                ],
            ]);

            $bucket = $storageClient->bucket($config['bucket']);
            $adapter = new \League\Flysystem\GoogleCloudStorage\GoogleCloudStorageAdapter($bucket);
            $filesystem = new \League\Flysystem\Filesystem($adapter);

            return new class($filesystem, $adapter, $config, $bucket) extends \Illuminate\Filesystem\FilesystemAdapter {
                protected $bucket;

                public function __construct($driver, $adapter, $config, $bucket)
                {
                    parent::__construct($driver, $adapter, $config);
                    $this->bucket = $bucket;
                }

                public function url($path)
                {
                    // Generar URL firmada válida por 2 horas para evitar problemas de permisos públicos
                    // Nota: No verificamos existe() para rendimiento.
                    try {
                        return $this->bucket->object($path)->signedUrl(new \DateTime('+2 hours'));
                    } catch (\Exception $e) {
                        // Fallback en caso de error de firma
                        return 'https://storage.googleapis.com/' . $this->config['bucket'] . '/' . $path;
                    }
                }
            };
        });
    }
}