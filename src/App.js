import { useState, useEffect } from 'react';
import Dashboard from './bam-v20-dashboard';
import AdminPortal from './bam-admin';

function App() {
  const [isAdmin, setIsAdmin] = useState(() => window.location.hash === '#/admin');

  useEffect(() => {
    const onHash = () => setIsAdmin(window.location.hash === '#/admin');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const enterAdmin = () => {
    window.location.hash = '#/admin';
    setIsAdmin(true);
  };

  const exitAdmin = () => {
    window.location.hash = '';
    setIsAdmin(false);
  };

  if (isAdmin) return <AdminPortal onExitAdmin={exitAdmin} />;
  return <Dashboard />;
}

export default App;
