import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'

import './App.css'
import Start from './pages/start'
import Login from './pages/login'
import Register from './pages/register'
import Home from './pages/home'
import Navbar from './components/navbar'
import Quizzes from './pages/quizzes'
import useToken from './components/useToken'
import Play from "./pages/play";


function App() {
  const { token, setToken } = useToken();

  if (!token) { // Set the homepage to the login page prior to user login
    return (
      <div style={{ textAlign: "center" }}>
        <Routes>
          <Route path="/" element={<Register setToken={setToken} />} />
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/register" element={<Register setToken={setToken} />} />
        </Routes>
      </div>
    )
  }

  return (
  <div style={{ textAlign: "center" }}>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/start" element={<Start />} />
      <Route path="/login" element={<Login setToken={setToken} />} />
      <Route path="/register" element={<Register setToken={setToken} />} />
      <Route path="/quiz" element={<Quizzes />} />
      <Route path="/play" element={<Play />} />
    </Routes>
  </div>
  )
}

export default App
