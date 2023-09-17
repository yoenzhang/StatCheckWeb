import React, { useState } from 'react';
import Header from './components/Header';
import PlayerSearch from './components/PlayerSearch';
import TeamSearch from './components/TeamSearch';
import LiveGames from './components/LiveGames';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('playerSearch');

  const handleTabChange = tab => {
    setActiveTab(tab);
  };

  return (
    <div className="app">
      <Header activeTab={activeTab} onTabChange={handleTabChange} />
      <main>
        {activeTab === 'playerSearch' && <PlayerSearch />}
        {activeTab === 'teamSearch' && <TeamSearch />}
        {activeTab === 'liveGames' && <LiveGames />}
      </main>
    </div>
  );
}

export default App;
