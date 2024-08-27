import React, { createContext, useContext } from 'react';
import { EventBus } from '../engine/EventBus';

// Define the context
const GameContext = createContext<EventBus | null>(null);

// Hook to use the StateManager in React components
export const useGameContext = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGameContext must be used within a GameProvider');
    }
    return context;
};

// Provider component to wrap your React app
export const GameProvider: React.FC<{ eventBus: EventBus; children: React.ReactNode }> = ({ eventBus, children }) => {
    return <GameContext.Provider value={eventBus}>{children}</GameContext.Provider>;
};