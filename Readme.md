
# Videotube Backend

> **A modular, scalable Node.js/Express API for video sharing with social-feed and advanced video features.**

---

## 🚀 Overview

Videotube-backend powers user authentication, profile management, video & tweet uploads, likes, comments, and watch history for a learning-focused video platform. Built with modern best practices, it’s easily extensible for Twitter-style feeds, video streaming, and more.

---

## 🔧 Tech Stack

- **Node.js** & **Express**  
- **MongoDB** via **Mongoose**  
- **JWT** (access + refresh tokens) for authentication  
- **Cloudinary** for media storage  
- **Multer** for file uploads  
- **Redis** for caching (seat reservation/payment projects)  
- **dotenv** for environment configuration  
- **cors**, **cookie-parser** for security & cookies

---

## ✨ Key Features

### 1. User Management
- Registration with avatar & optional cover-image upload  
- Login / Logout / Token refresh  
- Password change, profile update  
- Fetch current user info  

### 2. Media & Content
- Upload videos, tweets, avatars, and cover images  
- Multer handles temporary file storage before Cloudinary upload  
- Automatic cleanup of temp files  

### 3. Social Features
- Public channel pages with subscriber counts  
- Toggle likes for videos, tweets, and comments  
- Watch-history aggregation for personalized recommendations  

### 4. Pluggable Modules
- Twitter-style feed (ongoing)  
- Advanced video streaming (ongoing)  

---

## 🛠️ Getting Started

1. **Clone & Install**
```bash
git clone https://github.com/your-username/videotube-backend.git
cd videotube-backend
npm install
```

2. **Configure Environment**
```bash
cp .env.example .env
```
Set:
- `MONGODB_URI`
- `PORT`
- `ACCESS_TOKEN_SECRET`
- `REFRESH_TOKEN_SECRET`
- Cloudinary keys
- CORS origin

3. **Run in Development**
```bash
npm run dev
```

API Base URL:  
```
http://localhost:<PORT>/api/v1
```

---

## 📡 API Endpoints

### Authentication
- `POST /users/register` — Sign up (avatar + cover image)  
- `POST /users/login` — Sign in  
- `POST /users/logout` — Sign out  
- `POST /users/refresh-token` — Renew access token  

### User Profile
- `GET /users/current-user` — Get logged-in user  
- `PATCH /users/update-account` — Update name/email  
- `POST /users/change-password` — Change password  
- `POST /users/avatar` — Update avatar image  
- `POST /users/cover-image` — Update cover image  

### Channels & History
- `GET /users/channel-profile/:username` — Public channel data  
- `GET /users/watch-history` — User’s watched videos  

### Social Interactions
- `POST /likes/video/:videoId` — Toggle video like  
- `POST /likes/tweet/:tweetId` — Toggle tweet like  
- `POST /likes/comment/:commentId` — Toggle comment like  
- `GET /likes/videos` — Fetch liked videos  

---

## Contributing

Fork the repo and branch:
```bash
git checkout -b feature/awesome-module
```
Commit your changes and open a Pull Request.  
Follow existing code style and add tests where applicable.

---

## License

Released under the ISC License.
