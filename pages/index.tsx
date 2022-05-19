import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import config from '../config';
import { CATEGORY_MAPPING } from '../constants';
import { IGameDataResponse } from '../types/IGameDataResponse';
import Ribbon from '../widgets/Ribbon';

const bezier = 'cubic-bezier(0.25,0.1,0.25,1)';

const GameFeed = styled.div`
  margin: 0 auto;
  display: grid;
  grid-row-gap: 20px;
  grid-column-gap: 20px;
  padding: 40px;

  /* Screen larger than 300px? 1 column */
  @media (min-width: 300px) {
    grid-template-columns: repeat(1, 1fr);
  }

  /* Screen larger than 600px? 3 column */
  @media (min-width: 600px) {
    grid-template-columns: repeat(3, 1fr);
  }

  /* Screen larger than 800px? 4 column */
  @media (min-width: 800px) {
    grid-template-columns: repeat(4, 1fr);
  }

  /* Screen larger than 900px? 5 columns */
  @media (min-width: 900px) {
    grid-template-columns: repeat(5, 1fr);
  }
`;

const GameLabel = styled.span`
  z-index: 10;
  width: 100%;
  opacity: 0;
  position: absolute;
  right: 0px;
  bottom: 0px;
  left: 0px;
  transition: transform 0.3s ${bezier} 0.1s, opacity 0.3s ${bezier} 0.1s;
  transform: translate(0px, 8px);
  color: #ffffff;
  padding: 5px;
  font-size: 14px;
  font-weight: bold;
`;

const PlayGameImage = styled.img`
  position: absolute;
  width: 55px;
  height: 55px;

  opacity: 0;
  transition: transform 0.3s ${bezier} 0.1s, opacity 0.3s ${bezier} 0.1s;
  transform: translate(0px, 8px);

  top: 50%;
  left: 50%;
  margin: -25px 0 0 -25px;
`;

const GameItem = styled.div`
  position: relative;
  cursor: pointer;
  text-align: center;
  background-color: #fcfcfc;
  display: block;
  transition: transform 0.6s ${bezier};
  border-radius: 20px;
  height: 100%;
  
  /* Only apply for web */
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: scale(1.04255) translate(0px, -4px);
      transition-duration: 0.3s;
      box-shadow: rgb(0 0 0 / 24%) 0px 6px 12px 0px;
    }

    &:hover > ${GameLabel} {
      opacity: 1;
      transform: translate(0px, 0px);
    }

    &:hover > ${PlayGameImage} {
      opacity: 1;
      transform: translate(0px, 0px);
    }
  }
`;

const GameImage = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 20px;
`;

const JackpotPrice = styled.span`
  z-index: 10;
  width: 100%;
  position: absolute;
  color: #ffffff;
  padding: 5px;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  font-weight: bold;
  background-color: rgba(0, 0, 0, 0.5);
`;

const TopCategories = styled.div`
  overflow: auto;
  background-color: #373737;
  padding: 15px;
  a {
    color: #ffffff;
    text-align: center;
    padding: 15px 30px;
    text-decoration: none;
    font-size: 17px;
    text-transform: capitalize;
  }

  /* Only apply for web */
  @media (hover: hover) and (pointer: fine) {
    a:hover {
      background-color: #8dc63f;
      color: black;
      cursor: pointer;
    }
  }

  a.active {
    background-color: #8dc63f;
    color: white;
  }
`;

interface IGameData {
  id: string;
  name: string;
  image: string;
  categories: string[];
  jackpot?: string;
  ribbon?: string;
}

interface IJackpotGameResponse {
  game: string;
  amount: number;
}

const Home: NextPage = (props) => {
  const [gameData, setGameData] = useState<IGameDataResponse[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [games, setGames] = useState<IGameData[]>([]);

  const fetchGamesJackpot = async (): Promise<{
    [gameId: string]: number;
  }> => {
    const res = await fetch(
      `${config.API_URL}/jackpots.php`
    );
    try {
      const result: IJackpotGameResponse[] = await res.json();
      return result.reduce((acc: any, cur: any) => {
        acc[cur.game] = cur.amount;
        return acc;
      }, {});
    } catch (error) {
      return {};
    }
  };

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat('en-UK', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(value);
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchGamesJackpot().then((data: any) => {
        setGames((games) => {
          const updatedGames = games.map((game) => {
            const jackpotGame = data[game.id];
            if (jackpotGame) {
              return {
                ...game,
                jackpot: formatMoney(jackpotGame),
              };
            }

            return game;
          });
          return updatedGames;
        });
      });
    }, 2000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    fetch(`${config.API_URL}/games.php`)
      .then((res) => res.json())
      .then(async (data: IGameDataResponse[]) => {
        const ctg: string[] = [];
        const jackpotGames = await fetchGamesJackpot();

        data.forEach((gameItem: IGameData) => {
          ctg.push(...gameItem.categories);
          if (jackpotGames[gameItem.id]) {
            gameItem.jackpot = formatMoney(jackpotGames[gameItem.id]);
          }
        });

        const uniqCategories = ctg.filter(
          (item, pos) => ctg.indexOf(item) === pos
        );

        const defaultCategory = uniqCategories[0];
        const games = getGamesByCategory(defaultCategory, data);
        setCategories(uniqCategories);
        setActiveCategory(defaultCategory);
        setGameData(data);
        setGames(games);
      });
  }, []);

  const getGamesByCategory = (
    selectedCategory: string,
    gameData: IGameDataResponse[]
  ) => {
    let games: IGameData[] = [];

    if (selectedCategory === 'other') {
      games = gameData.filter((game) =>
        game.categories.some((category) =>
          CATEGORY_MAPPING['other'].includes(category)
        )
      );
    } else {
      games = gameData.filter((game) =>
        game.categories.includes(selectedCategory)
      );
    }

    const ribbonCategories = ['new', 'top'];
    if (!ribbonCategories.includes(selectedCategory)) {
      games.forEach((game) => {
        const gameWithRibbon = game.categories.filter((item) =>
          ribbonCategories.includes(item)
        );
        if (gameWithRibbon.length) {
          game.ribbon =
            game.categories.find((c) => c === 'top') ||
            game.categories.find((c) => c === 'new');
        }
      });
    }

    return games;
  };

  const onCategoryClick = (category: string) => {
    setActiveCategory(category);
    setGames(getGamesByCategory(category, gameData));
  };

  const renderCategoryItem = (category: string) => {
    return (
      <a
        onClick={(e: any) => {
          e.preventDefault();
          onCategoryClick(category);
        }}
        className={activeCategory === category ? 'active' : ''}
        key={category}
      >
        {category}
      </a>
    );
  };

  return (
    <div>
      <TopCategories>
        {categories
          .filter((c) => !CATEGORY_MAPPING['other'].includes(c))
          .map((category, idx) => renderCategoryItem(category))}
        {renderCategoryItem('other')}
      </TopCategories>
      <GameFeed>
        {games.map((game) => (
          <GameItem key={game.id}>
            {game.ribbon && <Ribbon text={game.ribbon} />}
            {game.jackpot && <JackpotPrice>{game.jackpot}</JackpotPrice>}
            <GameImage
              src={game.image.replace('//', 'https://')}
              alt={game.name}
              loading='lazy'
            />
            <PlayGameImage src='/play.png' alt='play-game' />
            <GameLabel>{game.name}</GameLabel>
          </GameItem>
        ))}
      </GameFeed>
    </div>
  );
};

export default Home;
