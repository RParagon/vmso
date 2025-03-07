
import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ onSearch, placeholder = "Buscar..." }: SearchBarProps) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-12 py-6 w-full rounded-lg shadow-sm border border-border bg-white/70 backdrop-blur-sm"
      />
      {query && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={clearSearch}
          className="absolute right-12 top-1/2 transform -translate-y-1/2 h-7 w-7"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      <Button 
        type="submit" 
        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 rounded-md"
      >
        Buscar
      </Button>
    </form>
  );
};
