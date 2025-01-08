import React, { createContext, useContext, useState } from 'react';
import { IGame } from '../../common/types';

export interface LibraryContextType {
    games: IGame[];
    setGames: React.Dispatch<React.SetStateAction<IGame[]>>;
}

export const LibraryContext = createContext<LibraryContextType | undefined>();

export const useLibraryContext = () => {
    const context = useContext(LibraryContext);
    if (context === undefined) {
        throw new Error('context not found');
    }
    return context;
};
