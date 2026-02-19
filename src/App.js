import React, { useEffect, useState, createContext, useContext } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { FaSearch, FaBell, FaPlay, FaPlus, FaCheck, FaTimes } from "react-icons/fa";
import "./App.css";

// Use localhost for development, otherwise use relative path for production (Vercel)
const API_BASE_URL = window.location.hostname === "localhost" ? "http://localhost:5001" : "";

// --- Context for Global State (My List) ---
const GlobalContext = createContext();

const GlobalProvider = ({ children }) => {
  const [myList, setMyList] = useState(() => {
    const saved = localStorage.getItem("myList");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("myList", JSON.stringify(myList));
  }, [myList]);

  const addToMyList = (movie) => {
    if (!myList.find((item) => item.imdbID === movie.imdbID)) {
      setMyList([...myList, movie]);
    }
  };

  const removeFromMyList = (id) => {
    setMyList(myList.filter((item) => item.imdbID !== id));
  };

  return (
    <GlobalContext.Provider value={{ myList, addToMyList, removeFromMyList }}>
      {children}
    </GlobalContext.Provider>
  );
};

// --- Components ---

const Nav = ({ onLogout }) => {
  const [show, handleShow] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput) {
      navigate(`/search?q=${searchInput}`);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) handleShow(true);
      else handleShow(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`fixed top-0 w-full p-5 h-16 z-50 flex justify-between items-center transition-all duration-500 ${show ? "bg-netflix-dark" : "bg-gradient-to-b from-black to-transparent"}`}>
      <div className="flex items-center gap-8">
        <img
          onClick={() => navigate("/")}
          className="w-24 object-contain cursor-pointer"
          src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
          alt="Netflix Logo"
        />
        <div className="hidden md:flex gap-4 text-sm text-gray-200">
          <span className="cursor-pointer hover:text-white" onClick={() => navigate("/")}>Home</span>
          <span className="cursor-pointer hover:text-white" onClick={() => navigate("/mylist")}>My List</span>
          <span className="cursor-pointer hover:text-white" onClick={() => navigate("/search?q=movies")}>Movies</span>
          <span className="cursor-pointer hover:text-white" onClick={() => navigate("/search?q=new")}>New & Popular</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <form onSubmit={handleSearch} className="flex items-center bg-black/50 border border-white/30 px-2 py-1 rounded-sm">
          <FaSearch className="text-white" />
          <input 
            type="text" 
            placeholder="Titles, people, genres" 
            className="bg-transparent border-none outline-none text-white text-sm ml-2 w-20 md:w-40 placeholder-gray-400"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </form>
        <FaBell className="text-white cursor-pointer" />
        <img
          className="w-8 h-8 rounded-sm object-contain cursor-pointer"
          src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png"
          alt="User Avatar"
        />
        <button onClick={onLogout} className="bg-red-600 text-white px-3 py-1 rounded font-bold text-sm hover:bg-red-700 transition-colors">
          Sign Out
        </button>
      </div>
    </div>
  );
};

const Banner = ({ onPlay }) => {
  const [movie, setMovie] = useState({});
  const { addToMyList, myList } = useContext(GlobalContext);

  useEffect(() => {
    async function fetchData() {
      // Fetching Guardians of the Galaxy Vol 2 via our backend proxy
      try {
        const request = await fetch(`${API_BASE_URL}/api/movie/tt3896198`);
        const data = await request.json();
        setMovie(data);
      } catch (error) {
        console.error("Failed to fetch banner movie:", error);
      }
    }
    fetchData();
  }, []);

  const isAdded = myList.find(item => item.imdbID === movie.imdbID);

  return (
    <header
      className="relative h-[500px] md:h-[600px] text-white object-contain bg-cover bg-center"
      style={{
        backgroundImage: `url(${movie?.Poster})`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
      
      <div className="relative z-10 ml-8 pt-[150px] md:pt-[200px] h-[190px]">
        <h1 className="text-4xl md:text-6xl font-extrabold pb-2">{movie?.Title || "Loading..."}</h1>
        <div className="flex gap-2 mt-4">
          <button className="flex items-center gap-2 cursor-pointer text-black outline-none border-none font-bold rounded px-8 py-2 bg-white hover:bg-opacity-80 transition-all">
            <FaPlay /> Play
          </button>
          <button 
            onClick={() => !isAdded && addToMyList(movie)}
            className="flex items-center gap-2 cursor-pointer text-white outline-none border-none font-bold rounded px-8 py-2 bg-[rgba(109,109,110,0.7)] hover:bg-[rgba(109,109,110,0.4)] transition-all"
          >
            {isAdded ? <FaCheck /> : <FaPlus />} My List
          </button>
        </div>
        <h1 className="w-full md:w-[45rem] leading-snug pt-4 text-sm md:text-lg max-w-[360px] md:max-w-lg h-20">
          {movie?.Plot}
        </h1>
      </div>
    </header>
  );
};

const Row = ({ title, searchTerm, isLargeRow, onMovieClick }) => {
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const request = await fetch(`${API_BASE_URL}/api/search?q=${searchTerm}`);
        
        // Check if the response is actually JSON (handles Vercel 404/500 HTML pages)
        const contentType = request.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server returned HTML instead of JSON. Check Vercel Logs.");
        }

        const data = await request.json();
        if (data.Search) {
          setMovies(data.Search);
          setError(null);
        } else if (data.Error) {
          setError(data.Error);
          console.error(`OMDb API Error for "${searchTerm}":`, data.Error);
        }
      } catch (error) {
        console.error(`Fetch error for "${searchTerm}":`, error);
        setError(error.message);
      }
    }
    fetchData();
  }, [searchTerm]);

  if (error) {
    return (
      <div className="ml-5 text-white">
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <div className="text-red-500 bg-black/50 p-4 rounded border border-red-500">
          <p>⚠️ Error: {error}</p>
          <p className="text-sm text-gray-300 mt-1">
            {error === "Invalid API Key!" ? "Go to Vercel Settings > Environment Variables and add API_KEY." : "Check your Vercel Function logs."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-5 text-white">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <div className="flex overflow-y-hidden overflow-x-scroll p-5 hide-scrollbar gap-2">
        {movies.map((movie) => (
          movie.Poster !== "N/A" && (
            <img
              key={movie.imdbID}
              onClick={() => onMovieClick(movie)}
              className={`object-contain w-full transition-transform duration-450 hover:scale-110 rounded cursor-pointer ${isLargeRow ? "max-h-[250px]" : "max-h-[100px]"}`}
              src={movie.Poster}
              alt={movie.Title}
            />
          )
        ))}
      </div>
    </div>
  );
};

const Modal = ({ movie, onClose }) => {
  const { addToMyList, myList } = useContext(GlobalContext);
  if (!movie) return null;
  const isAdded = myList.find(item => item.imdbID === movie.imdbID);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80" onClick={onClose}>
      <div className="bg-[#181818] w-[90%] max-w-2xl rounded-lg overflow-hidden relative shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white z-20 bg-black/50 rounded-full p-2"><FaTimes /></button>
        <div className="h-[300px] w-full bg-cover bg-center relative" style={{ backgroundImage: `url(${movie.Poster})` }}>
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] to-transparent" />
          <div className="absolute bottom-8 left-8">
            <h2 className="text-4xl font-bold text-white">{movie.Title}</h2>
            <div className="flex gap-4 mt-4">
              <button className="bg-white text-black px-6 py-2 rounded font-bold flex items-center gap-2"><FaPlay /> Play</button>
              <button onClick={() => !isAdded && addToMyList(movie)} className="border border-gray-400 text-white px-6 py-2 rounded font-bold flex items-center gap-2 hover:bg-gray-800">
                {isAdded ? <FaCheck /> : <FaPlus />} My List
              </button>
            </div>
          </div>
        </div>
        <div className="p-8 text-white">
          <div className="flex gap-4 text-green-400 font-bold mb-4">
            <span>98% Match</span>
            <span className="text-gray-400">{movie.Year}</span>
            <span className="border border-gray-500 px-1 text-xs text-gray-400 rounded">HD</span>
          </div>
          <p className="text-gray-300 leading-relaxed">
            {movie.Type === 'movie' ? "Movie" : "Series"} • {movie.Title} is a popular title in our library. 
            (OMDb API does not provide full descriptions in search results, click play to simulate watching).
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Auth Components ---

const LoginScreen = ({ onSignIn, onSwitchToSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        onSignIn(data.user);
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Failed to connect to server");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative bg-cover bg-center" style={{backgroundImage: 'url("https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg")'}}>
      <div className="absolute inset-0 bg-black/60"></div>
      <div className="z-10 bg-black/75 p-12 rounded max-w-md w-full text-white">
        <h1 className="text-3xl font-bold mb-6">Sign In</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="email" placeholder="Email" className="p-3 rounded bg-[#333] outline-none" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" className="p-3 rounded bg-[#333] outline-none" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" className="bg-netflix-red py-3 rounded font-bold mt-4">Sign In</button>
        </form>
        <p className="text-gray-400 mt-4">
          New to Netflix? <span className="text-white cursor-pointer hover:underline" onClick={onSwitchToSignup}>Sign up now.</span>
        </p>
      </div>
    </div>
  );
};

const SignupScreen = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({ userid: "", username: "", password: "", email: "", phone: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess("Account created! Please sign in.");
        setTimeout(onSwitchToLogin, 2000);
      } else {
        setError(data.error || "Signup failed");
      }
    } catch (err) {
      setError("Failed to connect to server");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative bg-cover bg-center" style={{backgroundImage: 'url("https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg")'}}>
      <div className="absolute inset-0 bg-black/60"></div>
      <div className="z-10 bg-black/75 p-12 rounded max-w-md w-full text-white">
        <h1 className="text-3xl font-bold mb-6">Sign Up</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-4">{success}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input name="userid" type="text" placeholder="User ID" className="p-3 rounded bg-[#333] outline-none" onChange={handleChange} required />
          <input name="username" type="text" placeholder="User Name" className="p-3 rounded bg-[#333] outline-none" onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email" className="p-3 rounded bg-[#333] outline-none" onChange={handleChange} required />
          <input name="password" type="password" placeholder="Password" className="p-3 rounded bg-[#333] outline-none" onChange={handleChange} required />
          <input name="phone" type="text" placeholder="Phone" className="p-3 rounded bg-[#333] outline-none" onChange={handleChange} required />
          <button type="submit" className="bg-netflix-red py-3 rounded font-bold mt-4">Sign Up</button>
        </form>
        <p className="text-gray-400 mt-4">
          Already have an account? <span className="text-white cursor-pointer hover:underline" onClick={onSwitchToLogin}>Sign in.</span>
        </p>
      </div>
    </div>
  );
};

// --- Pages ---

const HomeScreen = ({ onMovieClick }) => (
  <>
    <Banner />
    <Row title="NETFLIX ORIGINALS" searchTerm="Guardians" isLargeRow onMovieClick={onMovieClick} />
    <Row title="Trending Now" searchTerm="Avengers" onMovieClick={onMovieClick} />
    <Row title="Top Rated" searchTerm="Inception" onMovieClick={onMovieClick} />
    <Row title="Action Movies" searchTerm="Batman" onMovieClick={onMovieClick} />
    <Row title="Comedy Movies" searchTerm="Hangover" onMovieClick={onMovieClick} />
    <Row title="Horror Movies" searchTerm="Resident Evil" onMovieClick={onMovieClick} />
  </>
);

const SearchScreen = ({ onMovieClick }) => {
  const query = new URLSearchParams(useLocation().search).get("q");
  return (
    <div className="pt-24 min-h-screen">
      <Row title={`Results for: ${query}`} searchTerm={query} isLargeRow onMovieClick={onMovieClick} />
    </div>
  );
};

const MyListScreen = ({ onMovieClick }) => {
  const { myList, removeFromMyList } = useContext(GlobalContext);
  return (
    <div className="pt-24 px-8 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">My List</h2>
      <div className="flex flex-wrap gap-4">
        {myList.map(movie => (
          <div key={movie.imdbID} className="relative group w-[150px]">
            <img 
              src={movie.Poster} 
              alt={movie.Title} 
              className="w-full rounded hover:scale-105 transition-transform cursor-pointer"
              onClick={() => onMovieClick(movie)}
            />
            <button 
              onClick={() => removeFromMyList(movie.imdbID)}
              className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FaTimes size={12} />
            </button>
          </div>
        ))}
        {myList.length === 0 && <p className="text-gray-500">No movies in your list yet.</p>}
      </div>
    </div>
  );
};

// --- Main App Component ---

function App() {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("netflixUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isSignup, setIsSignup] = useState(false);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("netflixUser", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("netflixUser");
  };

  if (!user) {
    return isSignup 
      ? <SignupScreen onSwitchToLogin={() => setIsSignup(false)} /> 
      : <LoginScreen onSignIn={handleLogin} onSwitchToSignup={() => setIsSignup(true)} />;
  }

  return (
    <GlobalProvider>
      <div className="bg-[#141414] min-h-screen text-white overflow-x-hidden">
        <Nav onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<HomeScreen onMovieClick={setSelectedMovie} />} />
          <Route path="/search" element={<SearchScreen onMovieClick={setSelectedMovie} />} />
          <Route path="/mylist" element={<MyListScreen onMovieClick={setSelectedMovie} />} />
        </Routes>
        {selectedMovie && <Modal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />}
      </div>
    </GlobalProvider>
  );
}

export default App;
