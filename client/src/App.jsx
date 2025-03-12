import { Navigate, Route, Routes } from 'react-router-dom';
import useToken from './components/useToken';

import Login from './pages/login';
import Register from './pages/register';
import Home from './pages/home';
import Quizzes from './pages/quizzes';
import Play from "./pages/play";
import Leaderboard from "./pages/leaderboard";
import MakeQuiz from "./pages/makequiz";

function App() {
  const { token, setToken } = useToken();

  return (
    <div style={{ textAlign: "center" }}>

      <Routes>
        {token ? (
          // Routes for authenticated users
          <>
            <Route path="/" element={<Home />} />
            <Route path="/quizzes" element={<Quizzes />} />
            <Route path="/quiz" element={<Quizzes />} />
            <Route path="/play" element={<Play />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/makequiz" element={<MakeQuiz />} />
            

            {/* Redirect authenticated users away from login/register */}
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/register" element={<Navigate to="/" replace />} />
          </>
        ) : (
          // Routes for non-authenticated users
          <>
            <Route path="/" element={<Login setToken={setToken} />} />
            <Route path="/login" element={<Login setToken={setToken} />} />
            <Route path="/register" element={<Register setToken={setToken} />} />

            {/* Redirect unauthenticated users away from protected routes */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
      </Routes>
    </div>
  );
}

export default App;
