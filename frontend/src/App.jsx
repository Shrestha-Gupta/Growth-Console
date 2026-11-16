import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import SmoothScrollProvider from './components/animation/SmoothScrollProvider';
import ToastProvider from './components/feedback/ToastContext';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

/**
 * App
 * Root application component orchestrating routers, smooth scroll inertia,
 * toast notification context, and authentication state.
 */
export function App() {
  return (
    <BrowserRouter>
      <SmoothScrollProvider>
        <ToastProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ToastProvider>
      </SmoothScrollProvider>
    </BrowserRouter>
  );
}

export default App;
