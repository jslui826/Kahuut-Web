import React from 'react'
import { Link } from 'react-router-dom'

const Header = () => {
    return (
        <div>
            <div style={{ textAlign: "center"}}>
                <h1 style={{ color: "purple" }}>Kahuut</h1>
                <p>Testing a header</p>
                <nav>
                    <ul style={{ listStyleType: "none", padding: 0}}>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/register">Register</Link></li>
                        <li><Link to="/oldhome">OldHome</Link></li>
                        <li><Link to="/contests">Contests</Link></li>
                    </ul>
                </nav>
            </div>{" "}
        </div>
    )
}

export default Header