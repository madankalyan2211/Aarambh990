import { useEffect } from 'react';
import { processGoogleOAuthToken } from '../services/googleAuth.service';
import { UserRole } from '../App';

interface GoogleOAuthCallbackProps {
  onLogin: (role: UserRole, name?: string, email?: string) => void;
}

export function GoogleOAuthCallback({ onLogin }: GoogleOAuthCallbackProps) {
  useEffect(() => {
    // Get token and user data from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userData = urlParams.get('user');
    
    if (token && userData) {
      try {
        const parsedUserData = JSON.parse(decodeURIComponent(userData));
        
        // Get the pending role from localStorage (set before OAuth redirect)
        const pendingRole = localStorage.getItem('pendingRole');
        
        // Use the pending role if available, otherwise use the role from backend
        const finalRole = pendingRole || parsedUserData.role;
        
        // Update the user data with the final role
        const finalUserData = {
          ...parsedUserData,
          role: finalRole
        };
        
        // Store token and user data
        processGoogleOAuthToken(token, finalUserData);
        
        // Clean up pending role
        localStorage.removeItem('pendingRole');
        
        // Call the onLogin callback with user data
        onLogin(
          finalUserData.role as UserRole,
          finalUserData.name,
          finalUserData.email
        );
        
        // Redirect to dashboard by changing the URL hash
        window.location.hash = '#dashboard';
      } catch (error) {
        console.error('Error processing Google OAuth callback:', error);
        // Clean up and redirect to login page
        localStorage.removeItem('pendingRole');
        window.location.hash = '#login';
      }
    } else {
      // Clean up and redirect to login page
      localStorage.removeItem('pendingRole');
      window.location.hash = '#login';
    }
  }, [onLogin]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-lg">Processing Google sign-in...</p>
      </div>
    </div>
  );
}