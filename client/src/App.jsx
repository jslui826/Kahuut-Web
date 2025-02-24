import { useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import './App.css'
import Start from './pages/start'
import Login from './pages/login'
import Register from './pages/register'
import Home from './pages/home'
import Navbar from './components/navbar'
import Buttons from './components/buttons'

const App = () => (
  <div style={{ textAlign: "center" }}>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/start" element={<Start />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  </div>
)

export default App
