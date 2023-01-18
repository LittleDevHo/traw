import { TrawIconButton } from 'components/Primitives/TrawButton/TrawButton';
import { useTrawApp } from 'hooks';
import React from 'react';
import { Cross1Icon } from '@radix-ui/react-icons';

const SearchInput = () => {
  const app = useTrawApp();
  const query = app.useStore((state) => state.editor.search.query);
  const [search, setSearch] = React.useState(query);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    app.setSearchQuery(e.target.value);
    setSearch(e.target.value);
  };

  const handleClearSearch = () => {
    app.endSearch();
    setSearch('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClearSearch();
    }
  };

  return (
    <>
      <input
        autoFocus
        type="text"
        id="price"
        className="flex-1 ml-1 rounded-md block border border-gray-300 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1"
        placeholder={'search'}
        value={search}
        onChange={handleSearchChange}
        onKeyDown={handleKeyDown}
      />
      <TrawIconButton onClick={handleClearSearch}>
        <Cross1Icon />
      </TrawIconButton>
    </>
  );
};

export default SearchInput;
