import React from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import OldHome from './pages/OldHome'
import Contests from './pages/Contest'
import Header from './components/Header'
import "./App.css"

/* Adapted from https://www.geeksforgeeks.org/how-to-set-up-vite-for-a-multi-page-application/ */
const Button = () => {
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
}

const App = () => (
  <div style={{ textAlign: "center" }}>
    <Header />
    <Button />
    <Routes>
      <Route path="/" element={<div>Welcome to the Home page</div>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/oldhome" element={<OldHome />} />
      <Route path="/contests" element={<Contests />} />
    </Routes>
  </div>
)

export default App