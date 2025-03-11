import PropTypes from 'prop-types'
import { useState } from 'react'

async function loginUser(credentials) {
    return fetch('http://localhost:4000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    }).then(data => data.json());
}

function Login({ setToken }) {
    const [username, setUserName] = useState();
    const [password, setPassword] = useState();

    const handleSubmit = async e => {
        e.preventDefault();
        const token = await loginUser({
            username,
            password
        });
        setToken(token);
    }

    return(
        <div class="relative flex flex-col items-center justify-center h-screen overflow-hidden">
            <div class="w-full p-6 bg-white border-t-4 border-gray-600 rounded-md shadow-md border-top lg:max-w-lg">
                <h1 class="text-3xl font-semibold text-center text-gray-700">
                    Login
                </h1>
                <form class="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label class="label">
                            <span class="text-base label-text">Email</span>
                        </label>
                        <input type="text" placeholder="Email Address" class="w-full input input-bordered" onChange={e => setUserName(e.target.value)} />
                    </div>
                    <div>
                        <label class="label">
                            <span class="text-base label-text">Password</span>
                        </label>
                        <input type="password" placeholder="Enter Password" class="w-full input input-bordered" onChange={e => setPassword(e.target.value)} />
                    </div>
                    <a href="../register" class="text-xs text-gray-600 hover:underline hover:text-blue-600">Sign Up</a>
                    <div>
                        <button type="submit" class="btn btn-block btn-neutral">Login</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Login

Login.propTypes = {
    setToken: PropTypes.func.isRequired
}