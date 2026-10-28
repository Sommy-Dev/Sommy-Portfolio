# Brevo (Sendinblue) Email Setup Guide — Node.js Backend

This guide walks you through setting up the contact form email functionality using [Brevo](https://www.brevo.com/) (formerly Sendinblue) transactional email API integrated with a Node.js Express backend.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Create a Brevo Account](#create-a-brevo-account)
4. [Get Your API Key](#get-your-api-key)
5. [Verify Your Sender Email](#verify-your-sender-email)
6. [Project Structure](#project-structure)
7. [Install Dependencies](#install-dependencies)
8. [Create the .env File](#create-the-env-file)
9. [Local Testing](#local-testing)
10. [Connecting the Frontend](#connecting-the-frontend)
11. [Deployment](#deployment)
12. [Troubleshooting](#troubleshooting)
13. [Security Notes](#security-notes)

---

## Overview

The project is split into two parts:

- **Frontend** (`DevFolio/`): Static HTML/CSS/JS portfolio site
- **Backend API** (`portfolio-api/`): Node.js Express server that handles contact form submissions

The frontend sends POST requests to `http://localhost:3000/api/contact` (or your deployed URL), which forwards the email via the Brevo API.

---

## Prerequisites

- Node.js v18+ installed on your machine
- npm (comes with Node.js)
- A Brevo account (see step 3)

---

## Create a Brevo Account

1. Go to [https://www.brevo.com](https://www.brevo.com).
2. Sign up or log in to your account.
3. You'll land on the Brevo dashboard.

---

## Get Your API Key

1. In the Brevo dashboard, click **Settings** (gear icon) → **SMTP & API** (or **API keys**).
2. Under the **API keys** section, click **Create a new API key**.
3. Give it a name (e.g., "Portfolio Contact Form").
4. Copy the generated API key — you'll need it in the next step.

---

## Verify Your Sender Email

1. In the Brevo dashboard, go to **Settings** → **Sender authentication**.
2. If you haven't already, add and verify the email address you'll use as the sender (`BREVO_FROM_EMAIL`).
3. Follow the instructions Brevo sends to that email to confirm ownership.

> **Note:** If you use a domain you own, consider setting up [domain authentication](https://www.brevo.com/docs/domain-authentication/) for better deliverability.

---

## Project Structure

```
DevFolio/
├── DevFolio/              # Frontend (static site)
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── img/
└── portfolio-api/         # Backend API (Node.js Express)
    ├── server.js
    ├── package.json
    ├── .env.template
    └── .gitignore
```

---

## Install Dependencies

From the `portfolio-api` directory:

```bash
cd portfolio-api
npm install
```

---

## Create the .env File

1. Copy `.env.template` and rename it to `.env`:

   ```bash
   cp .env.template .env
   ```

2. Open the `.env` file and fill in your values:

   ```dotenv
   BREVO_API_KEY=your_api_key_here
   BREVO_FROM_EMAIL=you@yourdomain.com
   BREVO_TO_EMAIL=you@yourdomain.com
   ALLOWED_ORIGIN=http://localhost:3000
   ```

   - `BREVO_API_KEY`: Your API key from the [Get Your API Key](#get-your-api-key) step.
   - `BREVO_FROM_EMAIL`: The verified sender email address.
   - `BREVO_TO_EMAIL`: The email address where you want to receive messages from the contact form.
   - `ALLOWED_ORIGIN`: The origin of your frontend site (used for CORS). Use `http://localhost:3000` for local dev, or your deployed URL (e.g., `https://yourdomain.com`).

> **Important:** Make sure `.env` is not served publicly. See [Security Notes](#security-notes).

---

## Local Testing

1. Start the development server with hot-reloading (requires `nodemon`):

   ```bash
   npm run dev
   ```

   Or start production server:

   ```bash
   npm start
   ```

2. You should see: `Server is running on port 3000`

3. The frontend (`DevFolio/index.html`) sends requests to `http://localhost:3000/api/contact` by default. If you're testing locally with the static HTML, you may need to serve it via a local server to avoid CORS issues, or adjust `ALLOWED_ORIGIN` in `.env`.

4. Use a tool like [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) (VS Code extension) or:

   ```bash
   npx serve DevFolio/
   ```

---

## Connecting the Frontend

The frontend (`js/main.js`) already sends form data to `http://localhost:3000/api/contact` via AJAX. The contact form collects `name`, `email`, `subject`, and `message` fields and POSTs them to the API.

If you need to change the API URL:
1. Edit `js/main.js`
2. Modify the `url` property in the `$.ajax` call

---

## Deployment

### Deploying the API

Recommended providers that support Node.js:

- **Render** - Free tier available, supports `npm run start`
- **Vercel** - Serverless functions, or use as a full Express app
- **Railway** - Easy Node.js deployment
- **Heroku** - Classic choice, free tier available
- **Netlify** - Use serverless functions pointing to your Express handler

### Steps for Render (example):

1. Push your `portfolio-api` folder to a GitHub repository.
2. Create a new Web Service on Render.
3. Connect your repo and select the `portfolio-api` directory.
4. Set environment variables in the Render dashboard (same keys as in `.env`).
5. Render will auto-deploy on push.

### Updating the Frontend

After deploying the API, update the `url` in `js/main.js` to point to your deployed API endpoint.

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `Server email configuration is missing` | Make sure `.env` exists in the `portfolio-api/` folder with all required values. Run `cp .env.template .env`. |
| `401 Unauthorized` from Brevo | Double-check your `BREVO_API_KEY`. It must be live (not in sandbox/test mode). |
| `CORS error in browser` | Ensure `ALLOWED_ORIGIN` in `.env` matches your frontend URL exactly (including `http://` or `https://`). |
| Email not received | Check spam/junk folders. Verify the sender email is verified in Brevo. Consider domain authentication. |
| `Name, email, and message are required` | Ensure the form submits all three required fields (`name`, `email`, `message`). The `subject` field is optional on the API but included in the frontend form. |
| `node: command not found` | Install Node.js from [https://nodejs.org](https://nodejs.org) (LTS recommended). |

---

## Security Notes

1. **Never commit `.env` to version control.** The `.gitignore` file already excludes `.env` and `node_modules/`.
2. **Restrict API key access.** Never expose your `BREVO_API_KEY` on the frontend.
3. **Validate all inputs.** The `server.js` script validates inputs server-side. Never trust client-side validation alone.
4. **HTTPS is strongly recommended.** Ensure both your frontend and API are served over HTTPS in production.
5. **Rate limiting.** Consider adding `express-rate-limit` to prevent abuse of your contact endpoint.
6. **Input sanitization.** The server sanitizes HTML content before sending to Brevo. For production, consider additional sanitization library like `express-mongo-sanitize` or `xss`.
