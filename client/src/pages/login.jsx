import PropTypes from 'prop-types'
import { useState } from 'react'

async function loginUser(credentials) {
    return fetch('http://localhost:4000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    }).then(res => res.json())
}

function Login({ setToken }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('')

    const handleSubmit = async e => {
        e.preventDefault();
        const response = await loginUser({ email, password })

        if (response.token) {
            setToken(response.token)
            setError('')
        } else if (response.error) {
            setError(response.error)
        } else {
            setError('Unknown error occurred.')
        }
    }

    return(
        <div className="relative flex flex-col items-center justify-center h-screen overflow-hidden">
            <div className="w-full p-6 bg-white border-t-4 border-gray-600 rounded-md shadow-md border-top lg:max-w-lg">
                <h1 className="text-3xl font-semibold text-center text-gray-700">
                    Login
                </h1>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="label">
                            <span className="text-base label-text">Email</span>
                        </label>
                        <input type="text" placeholder="Email Address" className="w-full input input-bordered" onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div>
                        <label className="label">
                            <span className="text-base label-text">Password</span>
                        </label>
                        <input type="password" placeholder="Enter Password" className="w-full input input-bordered" onChange={e => setPassword(e.target.value)} />
                    </div>
                    <a href="../register" className="text-xs text-gray-600 hover:underline hover:text-blue-600">Sign Up</a>
                    <div>
                        <button type="submit" className="btn btn-block btn-neutral">Login</button>
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