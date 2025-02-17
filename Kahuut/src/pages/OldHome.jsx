import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../old/old.css';

const OldHome = () => {
    const title = "Kahuut".split("");
    const [animationComplete, setAnimationComplete] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setTimeout(() => {
            setAnimationComplete(true);
        }, 4000);
    }, []);

    return (
        <div className="loader-container">
            {/* Floating Animated Bubbles */}
            {[...Array(15)].map((_, index) => (
                <div key={index} className="bubble">
                    <div className="dot"></div>
                </div>
            ))}

            {/* Kahuut Logo Animation */}
            <div className="flipping-cards">
                {title.map((letter, index) => (
                    <div
                        key={index}
                        className={`card ${animationComplete ? "jump" : "flip-in"} card-${index}`}
                    >
                        {letter}
                    </div>
                ))}
            </div>

            {/* Start Button - Navigates to Start Page */}
            <button className="press-button" onClick={() => navigate("/start")}>
                Start
            </button>
        </div>
    );
};

export default OldHome;
