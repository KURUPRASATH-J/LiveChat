import React, { useEffect, useRef, useState } from 'react'
import { auth, db, rtdb, storage } from './firebase'
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { signOut } from 'firebase/auth'
import { ref, onValue, set, serverTimestamp as rtdbTimestamp } from 'firebase/database'
import './ChatRoom.css'

export default function ChatRoom({ roomType }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [onlineUsers, setOnlineUsers] = useState([])
  const [typingUser, setTypingUser] = useState(null)
  const dummy = useRef()

  const user = auth.currentUser
  const messagesRef = collection(db, 'messages')

  useEffect(() => {
    const q = query(messagesRef, orderBy('createdAt'), limit(100))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = []
      querySnapshot.forEach((doc) => {
        msgs.push({ ...doc.data(), id: doc.id })
      })
      setMessages(msgs)
      dummy.current?.scrollIntoView({ behavior: 'smooth' })
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const statusRef = ref(rtdb, '/status')
    const typingRef = ref(rtdb, '/typing')

    onValue(statusRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const online = Object.values(data)
          .filter((u) => u.state === 'online')
          .map((u) => u.displayName)
        setOnlineUsers(online)
      }
    })

    onValue(typingRef, (snapshot) => {
      const data = snapshot.val()
      if (data && data.uid !== user.uid) {
        setTypingUser(data.displayName)
      } else {
        setTypingUser(null)
      }
    })
  }, [user])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    await addDoc(messagesRef, {
      text: input,
      createdAt: serverTimestamp(),
      uid: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL,
    })

    setInput('')
    await set(ref(rtdb, '/typing'), null)
  }

  const handleInputChange = async (e) => {
    const val = e.target.value
    setInput(val)

    await set(ref(rtdb, '/typing'), {
      uid: user.uid,
      displayName: user.displayName,
    })
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const fileRef = storageRef(storage, `images/${file.name}-${Date.now()}`)
    await uploadBytes(fileRef, file)
    const imageUrl = await getDownloadURL(fileRef)

    await addDoc(messagesRef, {
      imageUrl,
      createdAt: serverTimestamp(),
      uid: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL,
    })
  }

  return (
    <div className="chatroom-container">
      <div className="chatroom-header">
        <button onClick={() => signOut(auth)} className="chatroom-signout-btn">
          Sign Out
        </button>
      </div>

      <div className="chatroom-online-list">
        Online: {onlineUsers.join(', ') || 'No one online'}
      </div>

      <div className="chatroom-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chatroom-message ${msg.uid === user.uid ? 'self' : 'other'}`}
          >
            <strong>{msg.displayName}</strong>
            {msg.text && <p className="chatroom-text">{msg.text}</p>}
            {msg.imageUrl && (
              <img src={msg.imageUrl} alt="Sent" className="chatroom-image" />
            )}
            <span className="chatroom-timestamp">
              {msg.createdAt?.toDate().toLocaleString()}
            </span>
          </div>
        ))}
        <div ref={dummy}></div>
      </div>

      {typingUser && <div className="chatroom-typing">{typingUser} is typing...</div>}

      <form onSubmit={sendMessage} className="chatroom-form">
        <input
          value={input}
          onChange={handleInputChange}
          className="chatroom-input"
          placeholder="Type a message"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="chatroom-send-btn"
        />
        <button type="submit" className="chatroom-send-btn">
          Send
        </button>
      </form>
    </div>
  )
}
