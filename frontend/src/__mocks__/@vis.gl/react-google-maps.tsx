import React from 'react';

export const APIProvider: React.FC<{ apiKey: string; children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Map: React.FC<any> = () => {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9' }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#64748b' }}>Mock Map View</h3>
      <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>Google Maps is bypassed in MOCK_MODE.</p>
    </div>
  );
};
