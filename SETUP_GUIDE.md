# Complete Setup Guide

## Step 1: Firebase Project Setup

### Create Firebase Project
1. Visit [Firebase Console](https://console.firebase.google.com)
2. Click "Create a new project"
3. Enter project name: "WhatsApp Sender Admin"
4. Accept terms and create

### Enable Realtime Database
1. In Firebase Console, go to "Realtime Database"
2. Click "Create Database"
3. Choose "Start in test mode" (for development)
4. Select region closest to you
5. Click "Enable"

### Enable Authentication
1. Go to "Authentication"
2. Click "Get started"
3. Select "Email/Password"
4. Enable it
5. Create admin user:
   - Email: admin@example.com
   - Password: (strong password)

### Get Firebase Credentials
1. Go to Project Settings (gear icon)
2. Click "Service Accounts"
3. Click "Generate new private key"
4. Save the JSON file
5. Copy the credentials to your environment variables

## Step 2: Deploy Admin Dashboard

### Option A: Deploy to Vercel

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import GitHub repository
4. Add environment variables:
   \`\`\`
   NEXT_PUBLIC_FIREBASE_API_KEY
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   NEXT_PUBLIC_FIREBASE_PROJECT_ID
   NEXT_PUBLIC_FIREBASE_DATABASE_URL
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   NEXT_PUBLIC_FIREBASE_APP_ID
   FIREBASE_SERVICE_ACCOUNT_KEY
   \`\`\`
5. Deploy

### Option B: Deploy Locally

1. Install Node.js
2. Run:
   \`\`\`bash
   npm install
   npm run dev
   \`\`\`
3. Access at http://localhost:3000

## Step 3: Setup WhatsApp Sender

### Install Dependencies
\`\`\`bash
pip install -r requirements.txt
\`\`\`

### Configure
1. Edit `WhatsApp_Sender_Firebase_v2.py`
2. Update `ADMIN_DASHBOARD_URL` with your dashboard URL
3. Download ChromeDriver matching your Chrome version
4. Extract to `C:/chromedriver-win64/`

### Run
\`\`\`bash
python WhatsApp_Sender_Firebase_v2.py
\`\`\`

## Step 4: First Run

1. Open Admin Dashboard
2. Login with admin credentials
3. Run WhatsApp Sender on a device
4. Device should appear in "Devices" tab
5. Test enable/disable functionality
6. Publish a test update

## Troubleshooting

### Firebase Connection Issues
- Check internet connection
- Verify credentials are correct
- Check Firebase project is active

### Device Not Appearing
- Check device has internet
- Verify dashboard URL is correct
- Check browser console for errors

### Update Not Working
- Verify download URL is accessible
- Check version format (e.g., 1.0.0)
- Ensure device is online

## Next Steps

1. Configure Firebase security rules
2. Set up automated backups
3. Create monitoring alerts
4. Document your deployment
