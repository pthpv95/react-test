import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { CATEGORY_MAPPING } from '../constants';
import { IGameDataResponse } from '../types/IGameDataResponse';

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

const TopNav = styled.div`
  overflow: hidden;
  background-color: #373737;
  display: flex;
  justify-content: space-evenly;
  a {
    color: #ffffff;
    text-align: center;
    padding: 15px 30px;
    text-decoration: none;
    font-size: 17px;
    text-transform: capitalize;
  }
  a:hover {
    background-color: #8dc63f;
    color: black;
    cursor: pointer;
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
  jackpot?: string;
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

  const fetchGamesJackpot = async (): Promise<IJackpotGameResponse[]> => {
    const res = await fetch(
      'http://stage.whgstage.com/front-end-test/jackpots.php'
    );
    try {
      return await res.json();
    } catch (error) {
      return [];
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
      fetchGamesJackpot().then((data: IJackpotGameResponse[]) => {
        setGames((games) => {
          const updatedGames = games.map((game) => {
            const matchGame = data.find((g) => g.game === game.id);
            if (matchGame) {
              return {
                ...game,
                jackpot: formatMoney(matchGame.amount),
              };
            }

            return game;
          });
          return updatedGames;
        });
      });
    }, 10000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    fetch('http://stage.whgstage.com/front-end-test/games.php')
      .then((res) => res.json())
      .then(async (data: IGameDataResponse[]) => {
        const ctg: string[] = [];
        const jackpotGames = await fetchGamesJackpot();

        data.map((item) => {
          ctg.push(...item.categories);
        });

        const uniqCategories = ctg.filter(
          (item, pos) => ctg.indexOf(item) === pos
        );

        const defaultCategory = uniqCategories[0];
        const games = getGamesByCategory(defaultCategory, data);
        games.forEach((game) => {
          const gameJackpot = jackpotGames.find(
            (jackpot) => jackpot.game === game.id
          );

          if (gameJackpot) {
            game.jackpot = formatMoney(gameJackpot.amount);
          }
        });

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
      <TopNav>
        {categories
          .filter((c) => !CATEGORY_MAPPING['other'].includes(c))
          .map((category, idx) => renderCategoryItem(category))}
        {renderCategoryItem('other')}
      </TopNav>
      <GameFeed>
        {games.map((game) => (
          <GameItem key={game.id}>
            {game.jackpot && <JackpotPrice>{game.jackpot}</JackpotPrice>}
            <GameImage
              src={game.image.replace('//', 'https://')}
              alt={game.name}
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
