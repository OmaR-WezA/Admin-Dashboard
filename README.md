# WhatsApp Sender Admin Dashboard

A comprehensive admin dashboard for managing multiple WhatsApp Sender instances across different devices with real-time analytics, device control, and update distribution.

## Features

- **Real-time Device Management**: Monitor all connected WhatsApp Sender instances
- **Device Control**: Enable/disable devices remotely
- **Update Distribution**: Push new versions to all devices automatically
- **Analytics Dashboard**: Track message statistics and success rates
- **Secure Authentication**: Firebase-based admin authentication
- **Live Statistics**: Real-time message counts and failure tracking

## System Architecture

### Components

1. **Admin Dashboard (Next.js Web App)**
   - Real-time device monitoring
   - Analytics and statistics
   - Device control interface
   - Update management

2. **WhatsApp Sender (Python Desktop App)**
   - Registers with Firebase on startup
   - Reports statistics in real-time
   - Checks for admin controls
   - Auto-updates when new versions are available

3. **Firebase Backend**
   - Real-time database for device data
   - Authentication for admin access
   - Device control commands
   - Update information storage

## Setup Instructions

### 1. Firebase Setup

1. Go to [firebase.google.com](https://firebase.google.com)
2. Create a new project
3. Enable Realtime Database
4. Enable Authentication (Email/Password)
5. Create an admin user account
6. Get your Firebase credentials:
   - API Key
   - Auth Domain
   - Project ID
   - Database URL
   - Storage Bucket
   - Messaging Sender ID
   - App ID

### 2. Admin Dashboard Setup

1. Clone or download the project
2. Add Firebase environment variables to your Vercel project:
   \`\`\`
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   FIREBASE_SERVICE_ACCOUNT_KEY=your_service_account_json
   \`\`\`

3. Deploy to Vercel:
   \`\`\`bash
   npm install
   npm run build
   npm run deploy
   \`\`\`

### 3. WhatsApp Sender Setup

1. Install Python dependencies:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

2. Update the configuration in `WhatsApp_Sender_Firebase_v2.py`:
   \`\`\`python
   ADMIN_DASHBOARD_URL = "https://your-dashboard.vercel.app"
   \`\`\`

3. Download ChromeDriver from [chromedriver.chromium.org](https://chromedriver.chromium.org)
4. Extract to `C:/chromedriver-win64/`

5. Run the application:
   \`\`\`bash
   python WhatsApp_Sender_Firebase_v2.py
   \`\`\`

## Usage

### Admin Dashboard

1. **Login**: Use your Firebase admin credentials
2. **Overview Tab**: View overall statistics
3. **Devices Tab**: 
   - See all connected devices
   - Enable/disable devices
   - View device details
4. **Analytics Tab**: View charts and statistics
5. **Updates Tab**: Publish new versions

### WhatsApp Sender

1. **Register**: Device automatically registers on startup
2. **Send Messages**: Load Excel file and start sending
3. **Auto-Update**: Checks for updates on startup
4. **Remote Control**: Respects admin enable/disable commands

## Firebase Database Structure

\`\`\`
devices/
  {deviceId}/
    deviceName: string
    version: string
    status: "active" | "inactive"
    totalMessages: number
    failedMessages: number
    lastSeen: timestamp
    createdAt: timestamp

controls/
  {deviceId}/
    status: "active" | "inactive"
    timestamp: timestamp

latestUpdate/
  version: string
  downloadUrl: string
  changelog: string
  publishedAt: timestamp

updates/
  {timestamp}/
    version: string
    downloadUrl: string
    changelog: string
    publishedAt: timestamp

logs/
  {deviceId}/
    {timestamp}/
      messagesSent: number
      messagesFailed: number
\`\`\`

## API Endpoints

### Device Registration
\`\`\`
POST /api/devices/register
Body: { deviceId, deviceName, version }
\`\`\`

### Update Statistics
\`\`\`
POST /api/devices/update-stats
Body: { deviceId, messagesSent, messagesFailed }
\`\`\`

### Device Control
\`\`\`
POST /api/devices/control
Body: { deviceId, action, data? }
Actions: "enable", "disable", "update"
\`\`\`

### Get Device Control
\`\`\`
GET /api/devices/get-control?deviceId={deviceId}
\`\`\`

### Get Latest Update
\`\`\`
GET /api/devices/get-update
\`\`\`

## Security

- Admin authentication via Firebase
- Device IDs are unique identifiers
- All API calls are validated
- Firebase Realtime Database rules should be configured for security

## Troubleshooting

### Device Not Connecting
- Check internet connection
- Verify `ADMIN_DASHBOARD_URL` is correct
- Check Firebase credentials

### Updates Not Showing
- Verify update URL is accessible
- Check Firebase database permissions
- Ensure version format is correct

### Messages Not Sending
- Check WhatsApp Web login
- Verify phone numbers format
- Check ChromeDriver compatibility

## Support

For issues or questions, contact the development team.

## License

© 2025 Weza Production - All rights reserved
