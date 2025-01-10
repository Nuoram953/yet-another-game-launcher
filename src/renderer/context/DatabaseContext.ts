import React, { createContext, useContext, useState } from 'react';
import { Game } from '@prisma/client';

export interface LibraryContextType {
    games: Game[];
    setGames: React.Dispatch<React.SetStateAction<Game[]>>;
}

export const LibraryContext = createContext<LibraryContextType | undefined>();

export const useLibraryContext = () => {
    const context = useContext(LibraryContext);
    if (context === undefined) {
        throw new Error('context not found');
    }
    return context;
};
