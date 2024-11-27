# Videotube Backend

> **A modular, scalable Node.js/Express API for video sharing (In progress: Twitter-style feeds & advanced video features).**

---

## 🚀 Overview

Videotube-backend powers user authentication, profile management, video uploads, and watch history for a learning-focused video platform. Built with modern best practices and easily extensible for social-feed (Twitter-like) and video enhancements.

---

## 🔧 Tech Stack

- **Node.js** & **Express**  
- **MongoDB** via **Mongoose**  
- **JWT** (access + refresh tokens) for auth  
- **Cloudinary** for media storage  
- **Multer** for file uploads  
- **dotenv** for configuration  
- **cors**, **cookie-parser** for security & cookies

---

## ✨ Key Features

1. **User Management**  
   - Registration w/ avatar & cover-image upload  
   - Login / Logout / Token refresh  
   - Password change, profile update  
2. **Media Handling**  
   - Upload video files + thumbnails to Cloudinary  
   - Automatic temp-file cleanup  
3. **Profiles & Channels**  
   - Public channel pages with subscriber counts  
   - Watch-history aggregation pipeline  
4. **Pluggable Modules**  
   - Twitter-style feed (ongoing)  
   - Advanced video streaming (ongoing)

---

## 🛠️ Getting Started

1. **Clone & install**  
   ```bash
   git clone https://github.com/your-username/videotube-backend.git
   cd videotube-backend
   npm install
Configure

Copy env.example → .env

Set MONGODB_URI, PORT, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, Cloudinary keys, CORS origin.

Run in dev

bash
Copy
Edit
npm run dev
API base URL

bash
Copy
Edit
http://localhost:<PORT>/api/v1/users
## API Endpoints
Authentication
POST /register — Sign up (avatar + cover image)

POST /login — Sign in

POST /logout — Sign out

POST /refresh-token — Renew access token

User Profile
POST /current-user — Get logged-in user

PATCH /update-account — Update name/email

POST /change-password — Change password

POST /avatar — Update avatar image

POST /cover-image — Update cover image

Channels & History
GET /channel-profile/:username — Public channel data

GET /watch-history — User’s watched videos

## Contributing
Fork and branch:

bash
Copy
Edit
git checkout -b feature/awesome-module
Commit your changes

Open a Pull Request

Please follow the existing code style and add tests where applicable.

## License
This project is released under the ISC License.

