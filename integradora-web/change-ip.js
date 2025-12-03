const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🔧 Cambiar IP de la API\n');

rl.question('Ingresa tu nueva IP local (ejemplo: 192.168.1.78): ', (ip) => {
  // Validar formato de IP
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;

  if (!ipRegex.test(ip)) {
    console.log('❌ IP inválida. Debe ser formato: 192.168.1.78');
    rl.close();
    return;
  }

  // Crear contenido del .env.local
  const envContent = `# Configuración de la API
REACT_APP_API_URL=http://${ip}:8000/api
REACT_APP_API_BASE=http://${ip}:8000

# Reverb WebSocket Configuration
REACT_APP_REVERB_APP_KEY=bgzcymqswrd5dunafh0b
REACT_APP_REVERB_HOST=${ip}
REACT_APP_REVERB_PORT=8080
REACT_APP_REVERB_SCHEME=http
`;

  // Escribir archivo
  fs.writeFileSync('.env.local', envContent);

  console.log('\n✅ IP actualizada exitosamente!');
  console.log(`📝 Nueva URL: http://${ip}:8000/api`);
  console.log(`🔌 Reverb WebSocket: ws://${ip}:8080`);
  console.log('\n⚠️  IMPORTANTE:');
  console.log('   1. Reinicia el servidor React (Ctrl+C y luego npm start)');
  console.log(`   2. Actualiza Laravel .env con: APP_IP=${ip}`);
  console.log(`   3. Actualiza REVERB_HOST="${ip}" en Laravel .env`);
  console.log('   4. Ejecuta: php artisan config:clear');
  console.log('   5. Reinicia Reverb: php artisan reverb:start\n');

  rl.close();
});