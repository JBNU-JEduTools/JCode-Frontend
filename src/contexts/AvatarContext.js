import React, { createContext, useContext, useState } from 'react';
import { getAvatarStyle } from '../utils/avatar';

const AvatarContext = createContext();

export const useAvatar = () => {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error('useAvatar must be used within an AvatarProvider');
  }
  return context;
};

export const AvatarProvider = ({ children }) => {
  const [currentStyle, setCurrentStyle] = useState(null);

  const value = {
    currentStyle,
    setCurrentStyle
  };

  return (
    <AvatarContext.Provider value={value}>
      {children}
    </AvatarContext.Provider>
  );
}; 