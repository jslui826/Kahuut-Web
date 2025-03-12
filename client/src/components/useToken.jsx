// components/useToken.js
import { useState, useEffect } from 'react';

export default function useToken() {
  const getToken = () => localStorage.getItem('token');

  const [token, setTokenState] = useState(getToken());

  const setToken = (userToken) => {
    localStorage.setItem('token', userToken);
    setTokenState(userToken);
  };

  useEffect(() => {
    const storedToken = getToken();
    if (storedToken !== token) {
      setTokenState(storedToken);
    }
  }, [token]);

  return {
    setToken,
    token
  };
}
