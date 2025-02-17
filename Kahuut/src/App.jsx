import React from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import OldHome from './pages/OldHome';
import Contests from './pages/Contest';
import StartPage from './pages/StartPage';  // Import new StartPage
import Header from './components/Header';
import "./App.css";

/*const Button = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/");
  }

  return (
    <button
    onClick={handleClick}
    style={{
      padding: "10px 20px",
      fontSize: "16px",
      cursor: "pointer",
      outline: "none",
      border: "2px solid purple",
      borderRadius: "4px",
      marginTop: "16px",
      marginBottom: "16px",
    }}
    >
      Go to Home
    </button>
  );  
}*/

const App = () => (
  <div style={{ textAlign: "center" }}>
    <Header />
    <Routes>
      <Route path="/" element={<div>Home Page</div>} />
      <Route path="/start" element={<StartPage />} />  {/* Add the new Start Page */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/oldhome" element={<OldHome />} />
      <Route path="/contests" element={<Contests />} />
    </Routes>
  </div>
);

export default App;
