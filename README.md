# 🤖 Personal AI Assistant

A **voice-controlled Personal AI Assistant** built using the **MERN Stack**, designed to understand voice commands, respond intelligently, and perform useful actions such as Google searches, YouTube searches, opening social media, checking the date/time, weather, and more.

The project uses **React.js** for the frontend, **Node.js + Express.js** for the backend, **MongoDB** for data storage, and **Google Gemini API** for AI-powered command understanding.

---

## ✨ Features

* 🎙️ **Voice Recognition**
* 🗣️ **Voice Response**
* 🤖 **AI-powered command understanding**
* 🔍 Google Search
* ▶️ YouTube Search & Play
* 📅 Get current date
* ⏰ Get current time
* 📆 Get current day/month
* 🧮 Calculator
* 📸 Open Instagram
* 📘 Open Facebook
* 🌦️ Weather information
* 👤 User authentication
* 🎨 Custom AI assistant name
* 🖼️ Custom assistant image
* ☁️ Cloudinary image upload
* 💾 MongoDB database
* 🔐 JWT authentication
* 📜 Command/history storage
* 📱 Responsive React interface

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* JavaScript
* CSS
* Web Speech API
* React Context API

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcryptjs
* Multer
* Cloudinary
* Axios
* dotenv

### AI

* Google Gemini API

---

## 📂 Project Structure

```text
Personal-AI-Assistant/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── assets/
│   │   └── App.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── public/
│   ├── index.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

Follow the steps below to run the project locally.

### 1. Clone the Repository

```bash
git clone https://github.com/Bhush8766/Persanal-AI-Assistant.git
```

Move into the project directory:

```bash
cd Persanal-AI-Assistant
```

---

# 🔧 Backend Setup

Go to the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
PORT=8000

MONGODB_URL=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

GEMINI_API_KEY=your_gemini_api_key

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Start the backend:

```bash
npm run dev
```

The backend should run on:

```text
http://localhost:8000
```

---

# 💻 Frontend Setup

Open another terminal.

Go to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally run on:

```text
http://localhost:5173
```

---

# 🔑 Environment Variables

Never upload your `.env` file to GitHub.

Add this to `.gitignore`:

```gitignore
node_modules/
.env
.env.local
dist/
build/
```

### ⚠️ Important

Do **not** expose your:

* Gemini API key
* MongoDB credentials
* JWT secret
* Cloudinary API secret

If a secret is accidentally pushed to GitHub, revoke/regenerate it immediately.

---

# 🎙️ Voice Commands

The assistant can understand commands such as:

```text
Hey Raju, open YouTube
```

```text
Search Google for React tutorials
```

```text
Play Arijit Singh songs on YouTube
```

```text
What is the time?
```

```text
What is today's date?
```

```text
Open Instagram
```

```text
Open Facebook
```

```text
What's the weather?
```

The assistant processes the user's command and determines the appropriate action.

---

# 🧠 AI Command Processing

The Gemini API is used to understand natural-language commands.

The assistant converts the user's request into a structured response such as:

```json
{
  "type": "youtube-search",
  "userInput": "play React tutorials on YouTube",
  "response": "Sure, searching YouTube for React tutorials."
}
```

Supported command types include:

```text
general
google-search
youtube-search
youtube-play
get-time
get-date
get-day
get-month
calculator-open
instagram-open
facebook-open
weather-show
```

---

# 🔐 Authentication

The application supports user authentication using:

* JWT
* bcryptjs
* MongoDB

Users can create an account and customize their personal assistant.

---

# ☁️ Cloudinary

Cloudinary is used to store assistant/user images.

The backend uploads images using Cloudinary and stores the resulting URL in MongoDB.

---

# 🗄️ Database

MongoDB is used to store user information and assistant configuration.

Example user structure:

```text
User
│
├── name
├── email
├── password
├── assistantName
├── assistantImage
├── history
└── timestamps
```

---

# 🎨 Customization

Users can customize their assistant with:

* Assistant name
* Assistant image
* Personal profile
* Voice interaction

This allows every user to create their own personalized AI assistant.

---

# 📸 Screenshots

Add your project screenshots here.

Example:

```markdown
![Home Page](screenshots/home.png)

![Login Page](screenshots/login.png)

![Customization Page](screenshots/customize.png)
```

Recommended screenshot folder:

```text
screenshots/
├── home.png
├── login.png
├── signup.png
└── customize.png
```

---

# 🔮 Future Improvements

Some planned improvements include:

* 🧠 Better AI conversation memory
* 🌐 Web browsing capabilities
* 📧 Email integration
* 📱 Mobile application
* 🎵 Music control
* 🏠 Smart home integration
* 📅 Calendar integration
* ⏰ Alarm and reminder system
* 📰 News updates
* 💬 More natural conversations
* 🌍 Multi-language support
* 🔊 Improved voice selection
* ⚡ Faster local command processing

---

# 🐛 Known Issues

The project depends on browser support for the **Web Speech API**.

For the best voice-recognition experience, use a modern browser such as:

* Google Chrome
* Microsoft Edge

Microphone permission must also be enabled.

---

# 🤝 Contributing

Contributions are welcome!

### 1. Fork the repository

```bash
git fork
```

### 2. Create a new branch

```bash
git checkout -b feature/new-feature
```

### 3. Make your changes

### 4. Commit your changes

```bash
git add .
git commit -m "Add new feature"
```

### 5. Push the branch

```bash
git push origin feature/new-feature
```

### 6. Create a Pull Request

---

# 📜 License

This project is open-source and available for learning and development purposes.

---

# 👨‍💻 Author

## Bhushan Ahire

**GitHub:**
https://github.com/Bhush8766

---

## ⭐ Support

If you found this project useful, please consider giving it a ⭐ on GitHub.

Your support motivates me to keep improving the project! 🚀

---

## ❤️ Built With

```text
React.js
Node.js
Express.js
MongoDB
Gemini AI
Cloudinary
Web Speech API
```

### 🚀 Personal AI Assistant

> "Your voice. Your commands. Your personal AI." 🤖🎙️
