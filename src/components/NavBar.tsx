import React from 'react';

export type EditorMode = 'shader' | 'page';

interface NavBarProps {
  currentMode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const NavBar: React.FC<NavBarProps> = ({
  currentMode,
  onModeChange,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '8px',
      backgroundColor: '#3c3836',
      borderBottom: '1px solid #504945',
      gap: '16px'
    }}>
      <div style={{
        color: '#fe8019',
        fontWeight: 'bold',
        fontSize: '18px',
        fontFamily: 'system-ui, sans-serif'
      }}>
        UGF Toy
      </div>
      <select
        value={currentMode}
        onChange={(e) => onModeChange(e.target.value as EditorMode)}
        style={{
          backgroundColor: '#504945',
          color: '#ebdbb2',
          border: '1px solid #665c54',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '14px'
        }}
      >
        <option value="shader">Shader Editor</option>
        <option value="page">Documentation</option>
      </select>
      {currentMode === 'page' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginLeft: 'auto'
        }}>
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            style={{
              backgroundColor: currentPage <= 1 ? '#504945' : '#98971a',
              color: '#ebdbb2',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 12px',
              fontSize: '14px',
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => {
              if (currentPage > 1) {
                e.currentTarget.style.backgroundColor = '#b8bb26';
              }
            }}
            onMouseOut={(e) => {
              if (currentPage > 1) {
                e.currentTarget.style.backgroundColor = '#98971a';
              }
            }}
          >
            &lt;
          </button>
          <span style={{ color: '#ebdbb2', fontSize: '14px' }}>
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            style={{
              backgroundColor: currentPage >= totalPages ? '#504945' : '#98971a',
              color: '#ebdbb2',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 12px',
              fontSize: '14px',
              cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => {
              if (currentPage < totalPages) {
                e.currentTarget.style.backgroundColor = '#b8bb26';
              }
            }}
            onMouseOut={(e) => {
              if (currentPage < totalPages) {
                e.currentTarget.style.backgroundColor = '#98971a';
              }
            }}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default NavBar;
