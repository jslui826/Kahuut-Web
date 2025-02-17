import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/StartPage.css"; // Make sure this file exists

const StartPage = () => {
    const navigate = useNavigate();

    return (
        <div className="start-container">
            {/* Circular Logo */}
            <div className="logo-container">
                <img src="/path-to-your-logo.png" alt="Logo" className="logo" />
            </div>

            {/* Buttons */}
            <div className="button-container">
                <button className="start-button" onClick={() => navigate("/login")}>
                    Login
                </button>
                <button className="start-button" onClick={() => navigate("/register")}>
                    Create Account
                </button>
                <button className="start-button" onClick={() => navigate("/oldhome")}>
                    Back
                </button>
            </div>
        </div>
    );
};

export default StartPage;
