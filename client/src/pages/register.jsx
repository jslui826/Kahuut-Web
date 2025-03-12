import PropTypes from 'prop-types';
import { useState } from 'react';

async function registerUser(credentials) {
    return fetch('http://localhost:4000/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })
    .then(res => res.json())
  }
  
  function Register({ setToken }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
  
    const handleSubmit = async e => {
      e.preventDefault()
      const response = await registerUser({ email, password })
  
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
        <div class="relative flex flex-col items-center justify-center h-screen overflow-hidden">
            <div class="w-full p-6 bg-white border-t-4 border-gray-600 rounded-md shadow-md border-top lg:max-w-lg">
                <h1 class="text-3xl font-semibold text-center text-gray-700">
                    Register
                </h1>
                
                <form class="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label class="label">
                            <span class="text-base label-text">Email</span>
                        </label>
                        <input type="email" placeholder="Email Address" class="w-full input input-bordered" onChange={e => setEmail(e.target.value)} required/>
                    </div>
                    <div>
                        <label class="label">
                            <span class="text-base label-text">Password</span>
                        </label>
                        <input type="password" placeholder="Enter Password" class="w-full input input-bordered" onChange={e => setPassword(e.target.value)} />
                    </div>
                    <a href="../login" class="text-xs text-gray-600 hover:underline hover:text-blue-600">Already have an account?</a>
                    <div>
                        <button class="btn btn-block btn-neutral">Sign Up</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

Register.propTypes = {
    setToken: PropTypes.func.isRequired
}
export default Register