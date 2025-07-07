const Imap = require('imap');
const { simpleParser } = require('mailparser');
const fs = require('fs').promises;

// IMAP configuration for contact@louve.pro
const imapConfig = {
  user: 'contact@louve.pro',
  password: 'YOUR_EMAIL_PASSWORD', // Replace with your actual password
  host: 'mail.privateemail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
};

const EMAILS_PATH = './incoming-emails.json';

// Read existing emails
const readEmails = async () => {
  try {
    const data = await fs.readFile(EMAILS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT' || error instanceof SyntaxError) {
      return [];
    }
    throw error;
  }
};

// Save emails
const saveEmails = async (emails) => {
  await fs.writeFile(EMAILS_PATH, JSON.stringify(emails, null, 2));
};

// Process incoming email
const processEmail = async (email) => {
  console.log('📧 New email received:');
  console.log('From:', email.from?.text);
  console.log('Subject:', email.subject);
  console.log('Date:', email.date);
  console.log('---');

  const emails = await readEmails();
  const newEmail = {
    id: Date.now().toString(),
    from: email.from?.text || 'Unknown',
    to: email.to?.text || 'contact@louve.pro',
    subject: email.subject || 'No Subject',
    text: email.text || '',
    html: email.html || '',
    date: email.date || new Date().toISOString(),
    receivedAt: new Date().toISOString()
  };

  emails.unshift(newEmail); // Add to beginning
  await saveEmails(emails);
};

// Start IMAP listener
const startEmailListener = () => {
  const imap = new Imap(imapConfig);

  imap.once('ready', () => {
    console.log('✅ IMAP connection established for contact@louve.pro');
    
    imap.openBox('INBOX', false, (err, box) => {
      if (err) {
        console.error('❌ Error opening inbox:', err);
        return;
      }
      
      console.log('📬 Monitoring inbox for new emails...');
      
      // Listen for new messages
      imap.on('mail', (numNewMsgs) => {
        console.log(`📨 ${numNewMsgs} new message(s) received`);
        
        // Fetch new messages
        const fetch = imap.seq.fetch(box.messages.total - numNewMsgs + 1 + ':*', {
          bodies: '',
          struct: true
        });
        
        fetch.on('message', (msg, seqno) => {
          let buffer = '';
          
          msg.on('body', (stream, info) => {
            stream.on('data', (chunk) => {
              buffer += chunk.toString('utf8');
            });
            
            stream.once('end', () => {
              simpleParser(buffer)
                .then(processEmail)
                .catch(err => console.error('❌ Error parsing email:', err));
            });
          });
        });
        
        fetch.once('error', (err) => {
          console.error('❌ Fetch error: ', err);
        });
      });
    });
  });

  imap.once('error', (err) => {
    console.error('❌ IMAP connection error:', err);
    setTimeout(startEmailListener, 10000); // Retry in 10 seconds
  });

  imap.once('end', () => {
    console.log('🔌 IMAP connection ended');
    setTimeout(startEmailListener, 5000); // Retry in 5 seconds
  });

  imap.connect();
};

// Start the email listener
console.log('🚀 Starting email listener service...');
startEmailListener();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Email listener shutting down...');
  process.exit(0);
});