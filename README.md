# Netflix Clone (React & Node.js)

A fully responsive Netflix clone application built using React.js, Tailwind CSS, and Node.js. This application fetches movie data from the OMDb API and allows users to browse categories, search for titles, and manage a personal watch list.

## Features

*   **Home Page:** Features a dynamic banner and categorized rows of movies (Trending, Top Rated, Action, etc.).
*   **Search Functionality:** Search for movies and TV shows by title.
*   **My List:** Add or remove movies from your personal list. Data is persisted using Local Storage.
*   **Movie Details:** Click on any movie to open a modal with more details and options.
*   **Responsive Design:** Optimized for various screen sizes using Tailwind CSS.
*   **Backend Proxy:** A Node.js/Express backend to handle API requests securely.

## Tech Stack

*   **Frontend:** React, React Router, Context API, Tailwind CSS, React Icons.
*   **Backend:** Node.js, Express, Axios.
*   **API:** [OMDb API](http://www.omdbapi.com/) (Open Movie Database).

## Prerequisites

*   Node.js installed on your machine.
*   An API Key from OMDb API.

## Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd Netflix_clone
    ```

2.  **Install Dependencies:**
    Run the following command in the root directory to install the necessary packages:
    ```bash
    npm install
    ```

3.  **Configure API Key:**
    *   Get a free API key from [OMDb API](http://www.omdbapi.com/apikey.aspx).
    *   Open `server.js` in the root directory.
    *   Replace the placeholder API key with your actual key:
        ```javascript
        const API_KEY = "your_api_key_here";
        ```

4.  **Run the Application:**

    You need to run both the backend server and the React frontend simultaneously. Open two terminal windows:

    *   **Terminal 1 (Backend):**
        ```bash
        node server.js
        ```
        The server will start on `http://localhost:5000`.

    *   **Terminal 2 (Frontend):**
        ```bash
        npm start
        ```
        The application will typically start on `http://localhost:3000`.

## Usage

*   **Navigation:** Use the top navbar to switch between Home, My List, and pre-defined categories.
*   **Search:** Click the search icon or use the input box to find specific titles.
*   **My List:** Click "My List" on a banner or modal to save a movie. Access your saved movies via the "My List" link in the nav.

## License

This project is for educational purposes.