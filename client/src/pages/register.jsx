import PropTypes from 'prop-types';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

async function registerUser(credentials) {
  return fetch('http://localhost:4000/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  }).then((res) => res.json());
}

function Register({ setToken }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure a team is selected before allowing registration
    if (!selectedOption) {
      setError("Please select a team before signing up.");
      return;
    }

    // Convert selected option to correct team letter (R, Y, B)
    const teamMapping = {
      triangle: "Y",  // Yellow Team
      circle: "R",     // Red Team
      square: "B",     // Blue Team
    };

    const team = teamMapping[selectedOption];

    const response = await registerUser({ email, password, team });

    if (response.token) {
      setToken(response.token);
      setError('');
      navigate('/login');
    } else if (response.error) {
      setError(response.error);
    } else {
      setError('Unknown error occurred.');
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-screen overflow-hidden">
      {/* Button Options Above Registration Form */}
      <div style={{ marginBottom: "20px" }}>
        <h1 className="text-3xl font-semibold text-center">Select Your Team:</h1>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          {[
            { id: "triangle", color: "yellow", shape: "😭" },
            { id: "circle", color: "red", shape: "😎" },
            { id: "square", color: "blue", shape: "😛" },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedOption(option.id)}
              style={{
                fontSize: "24px",
                padding: "10px 20px",
                cursor: "pointer",
                border: selectedOption === option.id ? "3px solid black" : "1px solid gray",
                backgroundColor: option.color,
                color: "black",
                transition: "background 0.2s ease-in-out",
              }}
              onMouseEnter={(e) => (e.target.style.filter = "brightness(90%)")}
              onMouseLeave={(e) => (e.target.style.filter = "brightness(100%)")}
            >
              {option.shape}
            </button>
          ))}
        </div>
        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
      </div>

      <div className="w-full p-6 bg-white border-t-4 border-gray-600 rounded-md shadow-md border-top lg:max-w-lg">
        <h1 className="text-3xl font-semibold text-center text-gray-700">Register</h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="label">
              <span className="text-base label-text">Email</span>
            </label>
            <input
              type="email"
              placeholder="Email Address"
              className="w-full input input-bordered"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">
              <span className="text-base label-text">Password</span>
            </label>
            <input
              type="password"
              placeholder="Enter Password"
              className="w-full input input-bordered"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <a href="../login" className="text-xs text-gray-600 hover:underline hover:text-blue-600">
            Already have an account?
          </a>
          <div>
            <button className="btn btn-block btn-neutral">Sign Up</button>
          </div>
        </form>
        {error !== '' && (
            <div role="alert" className="alert alert-error" style={{ marginTop: 50 }}>
                <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
            </div>
        )}
      </div>
    </div>
  );
}

Register.propTypes = {
  setToken: PropTypes.func.isRequired,
};

export default Register;