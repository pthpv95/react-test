import React from 'react';
import { IGameDataResponse } from '../types/IGameDataResponse';

const GameContext = React.createContext<{
  categories: string[],
  gameData: IGameDataResponse[]
}>({
  categories: [],
  gameData: []
});
export default GameContext;
