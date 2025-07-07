const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Hidden Haven servers...\n');

// Start main server
const mainServer = spawn('node', ['index.js'], {
  cwd: __dirname,
  stdio: 'inherit'
});

// Start message server
const messageServer = spawn('node', ['messageServer.js'], {
  cwd: __dirname,
  stdio: 'inherit'
});

// Start notification server
const notificationServer = spawn('node', ['notificationServer.js'], {
  cwd: __dirname,
  stdio: 'inherit'
});

// Start email listener
const emailListener = spawn('node', ['email-listener.js'], {
  cwd: __dirname,
  stdio: 'inherit'
});

const servers = [
  { name: 'Main Server', process: mainServer },
  { name: 'Message Server', process: messageServer },
  { name: 'Notification Server', process: notificationServer },
  { name: 'Email Listener', process: emailListener }
];

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down servers...');
  servers.forEach(server => {
    console.log(`Stopping ${server.name}...`);
    server.process.kill('SIGINT');
  });
  process.exit(0);
});

// Handle server exits
servers.forEach(server => {
  server.process.on('exit', (code) => {
    console.log(`${server.name} exited with code ${code}`);
  });
  
  server.process.on('error', (err) => {
    console.error(`${server.name} error:`, err);
  });
});

console.log('All servers started successfully!');
console.log('- Main Server: http://localhost:3001');
console.log('- Message Server: http://localhost:3002');
console.log('- Notification Server: http://localhost:3003');
console.log('- Email Listener: Running in background');
console.log('\nPress Ctrl+C to stop all servers');