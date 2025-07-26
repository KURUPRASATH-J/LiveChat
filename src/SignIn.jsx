import { useEffect, useState } from 'react';
import { auth, provider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import './SignIn.css';

export default function SignIn() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in:', error.message);
      alert('Sign in failed. Please try again.');
    }
  };

  const handleSignOut = () => {
    signOut(auth).catch((error) =>
      console.error('Error signing out:', error.message)
    );
  };

  return (
    <div className="signin-container">
      <img src="/livechat-logo.png" alt="LiveChat Logo" className="logo" />
      <h1 className="signin-title">Want To Chat! 👇 </h1>

      {!user ? (
        <button className="google-btn" onClick={signInWithGoogle}>
          <img
            src="https://img.icons8.com/color/16/000000/google-logo.png"
            alt="Google logo"
          />
          Sign in with Google
        </button>
      ) : (
        <div className="user-section">
          <img
            src={user.photoURL}
            alt="Profile"
            className="user-avatar"
          />
          <h2>Welcome, {user.displayName}!</h2>
          <button className="signout-btn" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
