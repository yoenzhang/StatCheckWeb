import React from 'react';

function Header({ activeTab, onTabChange }) {
  return (
    <header>
      <nav>
        <button onClick={() => onTabChange('playerSearch')} className={activeTab === 'playerSearch' ? 'active' : ''}>Player Search</button>
        <button onClick={() => onTabChange('teamSearch')} className={activeTab === 'teamSearch' ? 'active' : ''}>Team Search</button>
        <button onClick={() => onTabChange('liveGames')} className={activeTab === 'liveGames' ? 'active' : ''}>Live Games</button>
      </nav>
    </header>
  );
}

export default Header;
