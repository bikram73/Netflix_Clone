# 🎬 Netflix Clone - Full Stack Application

![Dashboard](images/dashboard.png)

A fully responsive Netflix clone application built with React.js, Node.js, Express, PostgreSQL, and deployed on Vercel. This application features user authentication, movie browsing with OMDb API integration, and a personal watchlist.

## ✨ Features

- 🔐 **User Authentication:** Secure signup and login with bcrypt password hashing
  - Auto-generated unique User ID
  - Email uniqueness validation
  - Password minimum 10 characters
  - Phone number exactly 10 digits
- 🎥 **Movie Browsing:** Browse movies by categories (Trending, Top Rated, Action, Comedy, Horror)
- 🔍 **Search Functionality:** Search for movies and TV shows by title
- 📝 **My List:** Add or remove movies from your personal watchlist (persisted in Local Storage)
- 🎭 **Movie Details Modal:** Click on any movie to view details
- 📱 **Responsive Design:** Optimized for all screen sizes using Tailwind CSS
- 🚀 **Backend API:** Node.js/Express backend with PostgreSQL database
- ☁️ **Cloud Deployment:** Deployed on Vercel with Aiven PostgreSQL database

## 🛠️ Tech Stack

### Frontend
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)

### Backend
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)

### Deployment & Tools
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)
![Aiven](https://img.shields.io/badge/Aiven-FF3E00?style=for-the-badge&logo=aiven&logoColor=white)

**Technologies:**
- **Frontend:** React 18, React Router DOM, Context API, Tailwind CSS, React Icons
- **Backend:** Node.js, Express.js, Axios, CORS
- **Database:** PostgreSQL (Aiven Cloud)
- **Authentication:** bcrypt for password hashing
- **API:** [OMDb API](http://www.omdbapi.com/) for movie data
- **Deployment:** Vercel (Frontend + Serverless Functions)

## 📁 File Structure

```
Netflix_clone/
├── api/
│   └── index.js              # Vercel serverless function (API routes)
├── images/
│   └── dashboard.png         # Dashboard screenshot
├── public/
│   ├── index.html           # HTML template
│   └── _redirects           # Vercel routing config
├── src/
│   ├── App.js               # Main React component
│   ├── App.css              # Component styles
│   ├── index.js             # React entry point
│   └── index.css            # Global styles with Tailwind
├── .env                     # Environment variables (local)
├── .env.example             # Environment variables template
├── .env.production          # Production environment config
├── .gitignore               # Git ignore rules
├── .vercelignore            # Vercel ignore rules
├── package.json             # Dependencies and scripts
├── postcss.config.js        # PostCSS configuration
├── server.js                # Local development server
├── tailwind.config.js       # Tailwind CSS configuration
├── vercel.json              # Vercel deployment config
└── README.md                # Project documentation
```

## 🗄️ Database Schema

**PostgreSQL Database (Aiven Cloud)**

### Users Table
```sql
CREATE TABLE users (
    userid VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(10) NOT NULL
);
```

**Fields:**
- `userid`: Auto-generated unique identifier (PRIMARY KEY) - Format: USER{timestamp}{random}
- `username`: User's display name (not unique, multiple users can have same name)
- `email`: Unique email address (used for login)
- `password`: Bcrypt hashed password (minimum 10 characters)
- `phone`: User's phone number (exactly 10 digits)

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL database (or use Aiven free tier)
- OMDb API key

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/bikram73/Netflix_Clone.git
   cd Netflix_clone
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   DB_HOST=your_db_host
   DB_PORT=5432
   DB_NAME=your_db_name
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   API_KEY=your_omdb_api_key
   NODE_TLS_REJECT_UNAUTHORIZED=0
   ```

4. **Get API Keys:**
   - **OMDb API:** Get a free key from [OMDb API](http://www.omdbapi.com/apikey.aspx)
   - **Aiven PostgreSQL:** Sign up at [Aiven.io](https://aiven.io/) for a free PostgreSQL database

5. **Run the Application:**

   **Option 1: Run both frontend and backend together**
   ```bash
   npm start
   ```

   **Option 2: Run separately**
   ```bash
   # Terminal 1 - Backend (Port 5001)
   npm run server

   # Terminal 2 - Frontend (Port 3000)
   npm run client
   ```

6. **Access the Application:**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5001`

## 🌐 Deployment on Vercel

### Environment Variables Required

Add these in Vercel Dashboard → Settings → Environment Variables:

```
DATABASE_URL=postgres://user:password@host:port/database
API_KEY=your_omdb_api_key
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
```

### Deploy Steps

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/)
   - Import your GitHub repository
   - Add environment variables
   - Deploy!

3. **Automatic Deployments:**
   - Every push to `main` branch triggers automatic deployment

## 📡 API Endpoints

### Authentication
- `POST /api/signup` - Create new user account
- `POST /api/login` - User login

### Movies
- `GET /api/search?q={query}` - Search movies
- `GET /api/movie/{imdbID}` - Get movie details by IMDb ID
- `GET /api` - Health check

## 🎯 Usage

1. **Sign Up / Login:**
   - Create an account or login with existing credentials
   - Passwords are securely hashed using bcrypt

2. **Browse Movies:**
   - Explore different categories on the home page
   - Click on any movie poster to view details

3. **Search:**
   - Use the search bar in the navigation to find specific movies

4. **My List:**
   - Click the "+" button to add movies to your list
   - Access your saved movies from the "My List" page
   - Click "×" to remove movies from your list

## 🔒 Security Features

- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ SQL injection prevention with parameterized queries
- ✅ CORS enabled for secure cross-origin requests
- ✅ Environment variables for sensitive data
- ✅ SSL/TLS encryption for database connections

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error:**
- Ensure environment variables are correctly set
- Check if database is accessible from your IP
- Verify SSL settings for cloud databases

**Movies Not Loading:**
- Verify OMDb API key is valid
- Check API rate limits (1000 requests/day for free tier)

**Build Errors:**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear build cache: `npm run build`

## 📝 License

This project is for educational purposes only. Netflix and its logo are trademarks of Netflix, Inc.

## 👨‍💻 Author

**Bikram**
- GitHub: [@bikram73](https://github.com/bikram73)

## 🙏 Acknowledgments

- [OMDb API](http://www.omdbapi.com/) for movie data
- [Netflix](https://www.netflix.com/) for design inspiration
- [Aiven](https://aiven.io/) for PostgreSQL hosting
- [Vercel](https://vercel.com/) for deployment platform

---

⭐ Star this repo if you found it helpful!
