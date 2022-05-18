import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { CATEGORY_MAPPING } from '../../constants';
import GameContext from '../../context/GameContext';
import { IGameDataResponse } from '../../types/IGameDataResponse';

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


export const Layout = ({ children }: any) => {
  const [gameData, setGameData] = useState<IGameDataResponse[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    fetch('http://stage.whgstage.com/front-end-test/games.php')
      .then((res) => res.json())
      .then((data: IGameDataResponse[]) => {
        setGameData(data);

        const ctg: string[] = [];
        data.map((item) => {
          ctg.push(...item.categories);
        });
        const uniqCategories = ctg.filter(
          (item, pos) => ctg.indexOf(item) === pos
        );
        setCategories(uniqCategories);
        setActiveCategory(uniqCategories[0]);
      });
  }, []);

  const onCategoryClick = (category: string) => {
    setActiveCategory(category);
    router.push({
      query: {
        category,
      },
    });
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
    <GameContext.Provider value={{ gameData, categories }}>
      <TopNav>
        {categories
          .filter((c) => !CATEGORY_MAPPING['other'].includes(c))
          .map((category, idx) => renderCategoryItem(category))}
        {renderCategoryItem('other')}
      </TopNav>
      {children}
    </GameContext.Provider>
  );
};
