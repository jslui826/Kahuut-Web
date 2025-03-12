import jwtDecode from "jwt-decode"; // Install with `npm install jwt-decode`

const checkTokenExpiration = () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        const decoded = jwtDecode(token);
        const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds

        console.log("⏳ Token Expiration:", decoded.exp);
        console.log("🕒 Current Time:", currentTime);

        if (decoded.exp < currentTime) {
            console.log("🚫 Token expired! Logging out...");
            localStorage.removeItem("token"); // Remove expired token
            window.location.reload(); // Reload the page
        }
    } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem("token"); // If the token is invalid, remove it
        window.location.reload();
    }
};

// Run this function every time the component renders
checkTokenExpiration();