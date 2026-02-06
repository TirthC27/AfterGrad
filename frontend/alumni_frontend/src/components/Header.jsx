import React from 'react'
import { Search, Mic } from 'lucide-react'

export default function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="greeting">
          Welcome back, <strong>Arjun!</strong>
        </h1>
        <p className="subtitle">Stay connected, give back, and grow your network.</p>
      </div>
      <div className="header-right">
        <div className="search-box">
          <Search size={16} className="text-[var(--text-muted)]" />
          <input type="text" placeholder="Search alumni, events, gigs..." />
          <div className="search-mic">
            <Mic size={14} className="text-[var(--text-muted)]" />
          </div>
        </div>
      </div>
    </header>
  )
}
