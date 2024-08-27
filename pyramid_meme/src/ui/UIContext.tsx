import React, { createContext, ReactNode, useContext, useState } from 'react';

type UIStates = 'VIEW' | 'EDITOR' | 'EDITOR_TARGET' | 'FINISH_RAIL'

interface UIContextProps {
    uiState: UIStates;
    setUiState: (state: UIStates) => void;
}
// Define the context
const UIContext = createContext<UIContextProps | undefined>(undefined);

// Hook to use the StateManager in React components
export const useUIContext = () => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUIContext must be used within a UIProvider');
    }
    return context;
};

// Provider component to wrap your React app
export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [uiState, setUiState] = useState<UIStates>('VIEW');

    return (
        <UIContext.Provider value={{ uiState, setUiState }}>
            {children}
        </UIContext.Provider>
    );
};