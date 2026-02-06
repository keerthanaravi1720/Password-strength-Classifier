import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // --- SARCASTIC MESSAGES ---
  const getSarcasticMessage = (level) => {
    const weakMsgs = ["A toddler could guess this.", "12345? Seriously?", "My grandma has a stronger password."];
    const mediumMsgs = ["Meh. It's okay, I guess.", "Not terrible, but not great.", "Average Joe security."];
    const strongMsgs = ["Okay, fine. You actually know what you're doing.", "Impressive.", "A hacker would need a supercomputer for this."];
    
    const r = Math.floor(Math.random() * 3);
    if (level === 0) return weakMsgs[r];
    if (level === 1) return mediumMsgs[r];
    if (level === 2) return strongMsgs[r];
    return "";
  };

  // --- PASSWORD GENERATOR ---
 // In frontend/src/App.jsx
const generatePassword = () => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let pass = "";
  // Increased length to 16 for better chance of "Strong"
  for(let i=0; i<16; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  setPassword(pass);
  setStrength(null); 
  setMessage(""); 
};

  const toggleVisibility = () => {
    setShowPassword(!showPassword);
  };

  const checkStrength = async () => {
    if (!password) {
      setMessage("Please enter a password first, genius.");
      return;
    }
    
    setLoading(true);
    setMessage(""); 
    
    
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const response = await axios.post('http://127.0.0.1:5000/predict', {
        password: password
      });
      setStrength(response.data.strength);
      setMessage(getSarcasticMessage(response.data.strength));
    } catch (error) {
      console.error(error);
      setMessage("Error");
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <div className="glass-card fade-in">
        
        {/* Header */}
        <div className="header">
          <h1>Password<span className="highlight"></span></h1>
          <p>Strength Analyzer & Generator</p>
        </div>

        {/* Input Area */}
        <div className="input-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter or generate password..."
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setStrength(null);
              setMessage("");
            }}
            className="neumorphic-input"
          />
          <button onClick={toggleVisibility} className="icon-btn" title="Show/Hide">
            {showPassword ? '👁️' : '🔒'}
          </button>
        </div>

        {/* Buttons */}
        <div className="button-row">
          <button onClick={generatePassword} className="btn-generate">
            ✨ Generate
          </button>
          <button 
            onClick={checkStrength} 
            disabled={loading}
            className="btn-analyze"
          >
            {loading ? '🔍 Analyzing...' : '⚡ Analyze'}
          </button>
        </div>

        {/* Results Area */}
        {(strength !== null || message) && (
          <div className="result-area slide-up">
            {strength !== null && (
              <div className="strength-badge">
                {strength === 0 ? '🔴 WEAK' : strength === 1 ? '🟠 MEDIUM' : '🟢 STRONG'}
              </div>
            )}
            <div className="message">{message}</div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;