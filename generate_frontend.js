const fs = require('fs');
const path = require('path');

const dirs = [
  'frontend',
  'frontend/src',
  'frontend/src/components',
  'frontend/src/pages',
  'frontend/src/services',
];

dirs.forEach(dir => {
  fs.mkdirSync(path.join(__dirname, dir), { recursive: true });
});

const files = {
  'frontend/package.json': `{
  "name": "cmrs-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "axios": "^1.6.7"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.1.0"
  }
}
`,
  'frontend/vite.config.js': `import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\n\nexport default defineConfig({\n  plugins: [react()],\n})\n`,
  'frontend/index.html': `<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>CMRS Dashboard</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.jsx"></script>\n  </body>\n</html>\n`,
  'frontend/src/main.jsx': `import React from 'react'\nimport ReactDOM from 'react-dom/client'\nimport App from './App.jsx'\nimport './index.css'\n\nReactDOM.createRoot(document.getElementById('root')).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n)\n`,
  'frontend/src/index.css': `body {\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;\n  margin: 0;\n  padding: 0;\n  background: #f4f7f6;\n  color: #333;\n}\n.container {\n  max-width: 1200px;\n  margin: 0 auto;\n  padding: 20px;\n}\n.card {\n  background: white;\n  border-radius: 8px;\n  padding: 20px;\n  box-shadow: 0 4px 6px rgba(0,0,0,0.1);\n  margin-bottom: 20px;\n}\n.nav {\n  display: flex;\n  gap: 15px;\n  background: #2c3e50;\n  padding: 15px;\n}\n.nav a {\n  color: white;\n  text-decoration: none;\n  font-weight: bold;\n}\n.nav a:hover {\n  text-decoration: underline;\n}\nbutton {\n  background: #3498db;\n  color: white;\n  border: none;\n  padding: 10px 15px;\n  border-radius: 4px;\n  cursor: pointer;\n}\nbutton:hover {\n  background: #2980b9;\n}\ntable {\n  width: 100%;\n  border-collapse: collapse;\n  margin-top: 15px;\n}\nth, td {\n  padding: 12px;\n  border: 1px solid #ddd;\n  text-align: left;\n}\nth {\n  background: #f8f9fa;\n}\ninput {\n  padding: 8px;\n  border: 1px solid #ccc;\n  border-radius: 4px;\n  margin-bottom: 10px;\n  display: block;\n  width: 100%;\n  box-sizing: border-box;\n}\n`,
  'frontend/src/App.jsx': `import React, { useState } from 'react';\nimport { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';\nimport Dashboard from './pages/Dashboard';\nimport Login from './pages/Login';\n\nfunction App() {\n  const [token, setToken] = useState(localStorage.getItem('token'));\n\n  const handleLogin = (newToken) => {\n    localStorage.setItem('token', newToken);\n    setToken(newToken);\n  };\n\n  const handleLogout = () => {\n    localStorage.removeItem('token');\n    setToken(null);\n  };\n\n  return (\n    <Router>\n      <div>\n        {token && (\n          <nav className="nav">\n            <Link to="/">Dashboard</Link>\n            <a href="#" onClick={handleLogout}>Logout</a>\n          </nav>\n        )}\n        <div className="container">\n          <Routes>\n            <Route path="/login" element={!token ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />\n            <Route path="/" element={token ? <Dashboard token={token} /> : <Navigate to="/login" />} />\n          </Routes>\n        </div>\n      </div>\n    </Router>\n  );\n}\n\nexport default App;\n`,
  'frontend/src/pages/Login.jsx': `import React, { useState } from 'react';\n\nfunction Login({ onLogin }) {\n  const [username, setUsername] = useState('');\n  const [password, setPassword] = useState('');\n\n  const handleSubmit = async (e) => {\n    e.preventDefault();\n    try {\n      const response = await fetch('http://localhost:8000/api/auth/login/', {\n        method: 'POST',\n        headers: {\n          'Content-Type': 'application/json',\n        },\n        body: JSON.stringify({ username, password }),\n      });\n      const data = await response.json();\n      if (response.ok) {\n        onLogin(data.access);\n      } else {\n        alert('Login failed');\n      }\n    } catch (error) {\n      console.error('Error logging in:', error);\n    }\n  };\n\n  return (\n    <div className="card" style={{ maxWidth: '400px', margin: '100px auto' }}>\n      <h2>CMRS Login</h2>\n      <form onSubmit={handleSubmit}>\n        <label>Username</label>\n        <input value={username} onChange={e => setUsername(e.target.value)} required />\n        <label>Password</label>\n        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />\n        <button type="submit" style={{ width: '100%' }}>Login</button>\n      </form>\n    </div>\n  );\n}\n\nexport default Login;\n`,
  'frontend/src/pages/Dashboard.jsx': `import React, { useState, useEffect } from 'react';\n\nfunction Dashboard({ token }) {\n  const [stats, setStats] = useState({ total_collected: 0, total_deposited: 0 });\n\n  useEffect(() => {\n    fetch('http://localhost:8000/api/deposits/dashboard/', {\n      headers: {\n        'Authorization': \`Bearer \${token}\`\n      }\n    })\n    .then(res => res.json())\n    .then(data => setStats(data))\n    .catch(console.error);\n  }, [token]);\n\n  return (\n    <div>\n      <h2>Cash Management & Reconciliation Dashboard</h2>\n      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>\n        <div className="card">\n          <h3>Total Collected (Agents)</h3>\n          <h2>₹{stats.total_collected || 0}</h2>\n        </div>\n        <div className="card">\n          <h3>Total Deposited (Bank)</h3>\n          <h2>₹{stats.total_deposited || 0}</h2>\n        </div>\n      </div>\n      <div className="card">\n        <h3>Recent Actions</h3>\n        <p>Use the backend API at <code>/api/</code> to manage loans, collections, and deposits. This frontend serves as a high-level view.</p>\n      </div>\n    </div>\n  );\n}\n\nexport default Dashboard;\n`
};

for (const [filepath, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(__dirname, filepath), content);
}

console.log("Frontend generated successfully.");
