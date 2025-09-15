import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4 animate-glow">
            🌟 Jai Guru Astro Remedy 🌟
          </h1>
          <p className="text-lg text-purple-200 mb-8">
            Your comprehensive astrology consultation platform
          </p>
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20 max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-white mb-4">
              Welcome to the Platform
            </h2>
            <p className="text-purple-100">
              This platform offers video/audio/chat consultations, astrology courses, 
              and product sales with a modern neon-themed design.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App