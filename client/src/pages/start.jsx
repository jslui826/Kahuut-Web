import { useNavigate } from 'react-router-dom'
import '../css/Start.css' // Make sure this file exists

const Start = () => {
    const navigate = useNavigate();

    return (
        <div className="start-container">
            <div className="logo-container">
                <img src="/assets/start-image.png" alt="Logo" className="logo" />
            </div>

            <div className="button-container">
                <button className="start-button" onClick={() => navigate("/login")}>Login</button>
                <button className="start-button" onClick={() => navigate("/register")}>Create Account</button>
                <button className="start-button" onClick={() => navigate("/")}>Back</button>
                <button className="start-button" onClick={() => navigate("/quiz")}>Go to Quiz Page </button>
            </div>
        </div>
    )
}

export default Start
