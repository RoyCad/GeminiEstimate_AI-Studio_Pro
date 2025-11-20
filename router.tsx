
import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useAuth } from './contexts/AuthContext';

const RouterContext = createContext<{ path: string; navigate: (p: string) => void; query: any }>({
  path: '/',
  navigate: () => {},
  query: {}
});

export const HashRouter = ({ children }: { children?: ReactNode }) => {
  const [path, setPath] = useState(window.location.hash.slice(1) || '/');

  useEffect(() => {
    const handler = () => {
        const fullPath = window.location.hash.slice(1) || '/';
        setPath(fullPath);
    };
    window.addEventListener('hashchange', handler);
    if (!window.location.hash) window.location.hash = '#/';
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const navigate = (p: string) => {
    window.location.hash = '#' + p;
  };

  const query = path.includes('?') ? Object.fromEntries(new URLSearchParams(path.split('?')[1])) : {};

  return React.createElement(RouterContext.Provider, { value: { path, navigate, query } }, children);
};

export const Routes = ({ children }: { children?: ReactNode }) => {
  return React.createElement(React.Fragment, null, children);
};

export const Route = ({ path, element, protected: isProtected }: { path: string; element: ReactNode; protected?: boolean }) => {
  const { path: currentPath, navigate } = useContext(RouterContext);
  const { user, loading } = useAuth();

  if (loading) return null;

  const cleanCurrentPath = currentPath.split('?')[0];

  let match = false;
  if (path === '*') {
     match = true; 
     return null; // Catch-all logic handled by router usually, simpler here
  } else if (path === '/') {
     match = cleanCurrentPath === '/';
  } else if (path.includes(':id')) {
     const parts = path.split('/');
     const currentParts = cleanCurrentPath.split('/');
     if (parts.length === currentParts.length && parts[1] === currentParts[1]) {
        match = true;
     }
  } else {
     match = path === cleanCurrentPath;
  }

  if (match && isProtected && !user) {
      setTimeout(() => navigate('/login'), 0);
      return null;
  }

  return match ? React.createElement(React.Fragment, null, element) : null;
};

export const Link = ({ to, children, className, title, onClick, ...props }: { to: string; children: ReactNode; className?: string; title?: string; onClick?: (e: React.MouseEvent) => void } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  const { navigate } = useContext(RouterContext);
  return React.createElement('a', {
    href: '#' + to,
    className,
    title,
    onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      if (onClick) onClick(e);
      navigate(to);
    },
    ...props
  }, children);
};

export const useLocation = () => {
  const { path } = useContext(RouterContext);
  return { pathname: path.split('?')[0], search: path.split('?')[1] };
};

export const useNavigate = () => {
  const { navigate } = useContext(RouterContext);
  return (to: string) => navigate(to);
};

export const useParams = <T extends Record<string, string | undefined> = any>() => {
  const { path } = useContext(RouterContext);
  const cleanPath = path.split('?')[0];
  if (cleanPath.startsWith('/projects/') && cleanPath.split('/').length === 3) {
      return { id: cleanPath.split('/')[2] } as unknown as T;
  }
  return {} as unknown as T;
};

export const Navigate = ({ to }: { to: string; replace?: boolean }) => {
  const { navigate } = useContext(RouterContext);
  useEffect(() => {
    navigate(to);
  }, [to, navigate]);
  return null;
};
