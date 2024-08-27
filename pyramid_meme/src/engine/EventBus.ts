import * as THREE from 'three';
import { GameState } from "./Object";
import { IRaycastData } from './CameraManager';

type EventListener<K extends keyof EventMap> = (data: EventMap[K]) => void;

interface EventMap {
    gameStateChange: { state: GameState };
    rerender: {};
    frameUpdate: { deltaTime: number };
    cameraChange: { camera: THREE.PerspectiveCamera };
    sceneChange: { sceneName: string }
    cameraTargetChange: { target: THREE.Object3D | THREE.Vector3, distance?: 40 | 180 };
    rayTargetsChange: { targets: THREE.Object3D[]};
    pointerMoved: IRaycastData;
    pointerUp: { raycastData: IRaycastData, isPress: boolean };
    pointerDown: IRaycastData;
    // editor specific events:
    railStart: {}
    railFinished: {},
    pointSelected: { centerPosition?: THREE.Vector3, localPosition: THREE.Vector3 }
    moveSelector: { direction: THREE.Vector3 }
}

export class EventBus {
    private listeners: { [K in keyof EventMap]?: EventListener<K>[] } = {};
    
    static instance: EventBus | null = null;

    static getInstance(): EventBus {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }

    /**
     * Registers a listener for a specific event.
     * @param event - The name of the event.
     * @param listener - The callback function to execute when the event is emitted.
     */
    on<K extends keyof EventMap>(event: K, listener: EventListener<K>): void {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event]!.push(listener);
    }

    /**
     * Removes a specific listener from an event.
     * @param event - The name of t#he event.
     * @param listener - The callback function to remove.
     */
    // off<K extends keyof EventMap>(event: K, listener: EventListener<K>): void {
    //     const listenersForEvent = this.listeners[event];

    //     if (!listenersForEvent) return;

    //     this.listeners[event] = listenersForEvent.filter(
    //         registeredListener => registeredListener !== listener
    //     );
    // }

    /**
     * Emits an event, triggering all listeners for that event.
     * @param event - The name of the event.
     * @param data - Optional data to pass to the listeners.
     */
    emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
        const listenersForEvent = this.listeners[event];

        if (!listenersForEvent) return;

        listenersForEvent.forEach(listener => {
            listener(data);
        });
    }

    /**
     * Removes all listeners for a specific event.
     * @param event - The name of the event.
     */
    removeAllListeners<K extends keyof EventMap>(event: K): void {
        if (!this.listeners[event]) return;
        delete this.listeners[event];
    }

    /**
     * Removes all listeners for all listeners.
     */
    clearAllListeners(): void {
        this.listeners = {};
    }
}
