import React from 'react'
import '../old/old.css'

const OldHome = () => {
    return (
        <div className="kahuut-container">
          <h1 className="kahuut-title">Kahuut</h1>
          <div className="kahuut-buttons">
            <button className="kahuut-button play-button">Play</button>
            <button className="kahuut-button login-button">Login</button>
            <button className="kahuut-button signup-button">Sign Up</button>
          </div>
        </div>
    )
}

export default OldHome