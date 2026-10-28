import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import https from 'https';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: 'Name, email, and message are required.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: 'Invalid email address.' });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.BREVO_FROM_EMAIL;
  const toEmail = process.env.BREVO_TO_EMAIL;

  if (!apiKey || !fromEmail || !toEmail) {
    return res.status(500).json({ ok: false, error: 'Server email configuration is missing.' });
  }

  const emailPayload = JSON.stringify({
    sender: { email: fromEmail, name: name },
    to: [{ email: toEmail, name: 'Portfolio Owner' }],
    subject: `Portfolio Contact Form: ${name}`,
    htmlContent: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br>')}</p>`
  });

  const options = {
    hostname: 'api.brevo.com',
    path: '/v3/smtp/email',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(emailPayload),
      'api-key': apiKey
    }
  };

  const apiRequest = https.request(options, (apiRes) => {
    let data = '';
    apiRes.on('data', (chunk) => { data += chunk; });
    apiRes.on('end', () => {
      if (apiRes.statusCode >= 200 && apiRes.statusCode < 300) {
        return res.json({ ok: true });
      }
      let errorMsg = 'Failed to send email.';
      try {
        const parsed = JSON.parse(data);
        errorMsg = parsed.message || errorMsg;
      } catch (e) {
        errorMsg = data || errorMsg;
      }
      return res.status(apiRes.statusCode).json({ ok: false, error: errorMsg });
    });
  });

  apiRequest.on('error', () => {
    return res.status(500).json({ ok: false, error: 'cURL error: Failed to send email.' });
  });

  apiRequest.write(emailPayload);
  apiRequest.end();
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
