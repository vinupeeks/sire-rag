import React, { useState } from 'react';
import DocumentSidebar from './components/DocumentSidebar';
import ChatPanel from './components/ChatPanel';
import './App.css';

function App() {
  const [activeChapter, setActiveChapter] = useState(null);
  const targetUserId = 54;

  return (
    <div style={styles.appContainer}>
      {/* Document Sidebar (Takes up a clean proportional 25% window slice) */}
      <div style={styles.sidebarWrapper}>
        <DocumentSidebar
          activeChapter={activeChapter}
          setActiveChapter={setActiveChapter}
          userId={targetUserId}
        />
      </div>

      {/* Main Analysis Chat Console (Takes up the remaining 75% fluid layout width) */}
      <div style={styles.chatWrapper}>
        <ChatPanel
          userId={targetUserId}
          chapterNumber={activeChapter}
        />
      </div>
    </div>
  );
}

const styles = {
  appContainer: {
    display: 'flex',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    boxSizing: 'border-box',
    margin: 0,
    padding: 0,
    position: 'absolute',
    left: 0,
    top: 0
  },
  sidebarWrapper: {
    flex: '0 0 320px',
    height: '100%',
    display: 'flex'
  },
  chatWrapper: {
    flex: '1',
    height: '100%',
    display: 'flex'
  }
};

export default App;