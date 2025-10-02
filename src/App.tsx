import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom'
import { AppRoutes } from './router'
import { useEffect } from 'react'

function OAuthHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // OAuth 콜백 처리 - access_token이 fragment(#)에 있으면 /connect로 리다이렉트
    if (location.hash && location.pathname === '/') {
      const hash = location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');

      if (accessToken) {
        navigate(`/connect${location.hash}`, { replace: true });
      }
    }
  }, [location, navigate]);

  return null;
}

function App() {
  return (
    <BrowserRouter basename={__BASE_PATH__}>
      <OAuthHandler />
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App