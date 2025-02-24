import { useNavigate } from 'react-router-dom'
import '../css/Start.css' // Make sure this file exists

const Start = () => {
    const navigate = useNavigate();

    return (
        <div className="start-container">
            {/* Circular Logo */}
            <div className="logo-container">
                <img src="../assets/crymoji.png" alt="Logo" className="logo" />
            </div>

            {/* Buttons */}
            <div className="button-container">
                <button className="start-button" onClick={() => navigate("/login")}>
                    Login
                </button>
                <button className="start-button" onClick={() => navigate("/register")}>
                    Create Account
                </button>
                <button className="start-button" onClick={() => navigate("/")}>
                    Back
                </button>
            </div>
        </div>
    )
}

export default Start
