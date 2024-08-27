import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client';
import { EllipsisVertical, ChevronUp } from 'lucide-react';
import './index.css';
import { GameProvider, useGameContext } from './GameContext';
import { UIProvider, useUIContext } from './UIContext';
import { EventBus } from '../engine/EventBus';
import { GameState } from '../engine/Object';

interface IUIPosition {
    x: number,
    y: number,
}

// Render your React component instead
const root = createRoot(document.getElementById('ui-root')!);
export const RenderUI = () => root.render(
    <StrictMode>
        <GameProvider eventBus={EventBus.getInstance()}>
            <UIProvider>
                <AppUI/>
            </UIProvider>
        </GameProvider>
    </StrictMode>
)

function AppUI() {
    const eventBus = useGameContext();
    const { setUiState } = useUIContext();
    useEffect(() => {
        eventBus.on('gameStateChange', ({ state }) => {
            if (state === 'VIEW' || state === 'SELECT') {
                setUiState('VIEW')
            } else if (state === 'EDITOR') {
                setUiState('EDITOR')
            }
        })
    }, []);
    return (
        <>
            <GameUI />
            <PopupUI />
        </>
    )
}

function PopupUI() {
    const [hasMoved, setHasMoved] = useState(false);
    const [isOpen, setIsOpen] = useState(false); // check ls.
    const [position, setPosition] = useState<IUIPosition>({ x: 0, y: 0 });

    const { uiState, setUiState } = useUIContext();
    const eventBus = useGameContext();
    useEffect(() => {
        eventBus.on('pointerDown', () => {
            setHasMoved(false)
            setIsOpen(false)
        })
        eventBus.on('pointerMoved', ({}) => setHasMoved(true))
        eventBus.on('pointerUp', ({ raycastData: { pointerPosition } }) => {
            if (hasMoved) {
                setIsOpen(true) 
                setPosition({
                    x: pointerPosition!.x,
                    y: pointerPosition!.y
                })
            } else {
                setIsOpen(false)
            }
        })
    })
    const onConfirmed = () => {
        // setIsOpen(false);
        setUiState('EDITOR_TARGET')
        eventBus.emit('railStart', {})
    }
    const onFinishRail = () => {
        setIsOpen(false);
        setUiState('EDITOR')
        eventBus.emit('railFinished', {})
    }

    if (!isOpen) {
        return (<></>)
    }

    if (uiState === 'EDITOR_TARGET') {
        return(
            <div className='popup-ui' 
            style={{
                left: `${30}px`,
                top: `${window.innerHeight / 2}px`
            }}>
            <button onClick={onFinishRail}><EllipsisVertical /></button>
        </div>
        )
    }
    return (
        <div className='popup-ui' 
        style={{
            left: `${position.x - 20}px`,
            top: `${position.y + 40}px`
        }}>
            <button onClick={onConfirmed}><EllipsisVertical /></button>
        </div>
    )
}

// is the main ui we need:
// button for build/run state (these probably change the menu)
// button to buy selected cube.
// maybe a dafts/create button#

export const UIStates = {
    VIEW: Symbol('view'),
    // BUILD: Symbol('SELECT'),
    EDITOR: Symbol('editor'),
};

function GameUI() {
    const [isOpen, setIsOpen] = useState(false); // check ls.
    const [uiState, setUiState] = useState(UIStates.VIEW)

    const handleIsOpenChange = () => setIsOpen(!isOpen)

    

    if (!isOpen){
        return (
            <div className='game-ui-closed'>
                <button onClick={handleIsOpenChange}><EllipsisVertical /></button>
            </div>
        )
    }

    if (uiState === UIStates.VIEW) {
        return <MainMenu handleIsOpenChange={handleIsOpenChange} />
    } else if (uiState === UIStates.EDITOR) {
        return <EditorMenu handleIsOpenChange={handleIsOpenChange} />
    }
}

interface IOpenChange {
    handleIsOpenChange: () => void
}

function MainMenu({handleIsOpenChange}: IOpenChange) {
    const eventBus = useGameContext();
    const handleStateChange = (state: GameState) => {
        eventBus.emit('gameStateChange', { state });
    };
    return(
        <div className='game-ui-open'>
            <h3>Pyramid Meme!</h3>
            <div className='game-ui-open-inner'>
                <button className='menu-button'
                onClick={() => handleStateChange('VIEW')}>
                    <h4>View Mode</h4>
                </button>
                <button className='menu-button'
                onClick={() => handleStateChange('SELECT')}>
                    <h4>Select Mode</h4>
                </button>
            </div>
            
            <button onClick={handleIsOpenChange}><ChevronUp /></button>
        </div>
    )
}

function EditorMenu({handleIsOpenChange}: IOpenChange) {
    const eventBus = useGameContext();
    const handleStateChange = (state: GameState) => {
        eventBus.emit('gameStateChange', { state });
    };
    return(
        <div className='game-ui-open'>
            <h3>Pyramid Meme!</h3>
            <div className='game-ui-open-inner'>
                <button className='menu-button'
                onClick={() => handleStateChange('VIEW')}>
                    <h4>My First Draft </h4>
                </button>
            </div>
            
            <button onClick={handleIsOpenChange}><ChevronUp /></button>
        </div>
    )
}