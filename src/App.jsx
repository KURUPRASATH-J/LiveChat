import React, { useEffect, useState } from 'react'
import ChatRoom from './ChatRoom'
import SignIn from './SignIn'
import { auth, rtdb } from './firebase'
import { useAuthState } from 'react-firebase-hooks/auth'
import { ref, set, serverTimestamp, onDisconnect } from 'firebase/database'
import './App.css'

export default function App() {
  const [user, loading] = useAuthState(auth)
  const [darkMode, setDarkMode] = useState(false)
  const [roomType, setRoomType] = useState('group')

  useEffect(() => {
    if (user) {
      const userStatusRef = ref(rtdb, `/status/${user.uid}`)

      set(userStatusRef, {
        state: 'online',
        lastChanged: serverTimestamp(),
        displayName: user.displayName,
      })

      onDisconnect(userStatusRef).set({
        state: 'offline',
        lastChanged: serverTimestamp(),
        displayName: user.displayName,
      })
    }
  }, [user])

  const toggleDarkMode = () => setDarkMode(!darkMode)

  return (
    <div className={`wrapper ${darkMode ? 'dark' : 'light'}`}>
      <div className={`container ${darkMode ? 'dark' : 'light'}`}>
        <a href="/" className="logo-link">
          <div className="header-container">
            <img src="/livechat-logo.png" alt="LiveChat Logo" className="logo-img" />
            <h1 className="header-text">LiveChat</h1>
          </div>
        </a>

        <div className="top-bar">
          <button onClick={toggleDarkMode} className="toggle-btn">
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          {user && (
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="dropdown"
            >
              <option value="group">👥 Group Chat</option>
              <option value="private">🔒 Private Chat</option>
            </select>
          )}
        </div>

        {loading ? (
          <div className="loader"></div>
        ) : user ? (
          <ChatRoom roomType={roomType} />
        ) : (
          <SignIn />
        )}
      </div>

      <footer className="footer">
        Made with love by PANTHER | 🔁 Powered by Firebase
      </footer>
    </div>
  )
}
