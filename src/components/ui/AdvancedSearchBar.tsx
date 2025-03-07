import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, Filter } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';
import { useUserSettings } from '@/contexts/UserSettingsContext';
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "./command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

interface SearchFilter {
  field: string;
  label: string;
}

interface AdvancedSearchBarProps {
  onSearch: (query: string, filter?: string) => void;
  placeholder?: string;
  filters?: SearchFilter[];
  initialFilter?: string;
  className?: string;
  showHistory?: boolean;
}

export const AdvancedSearchBar = ({
  onSearch,
  placeholder = "Buscar...",
  filters = [],
  initialFilter = "",
  className = "",
  showHistory = true,
}: AdvancedSearchBarProps) => {
  const [query, setQuery] = useState("");
  // Se initialFilter estiver vazio, usamos "all" como padrão para "Todos"
  const [selectedFilter, setSelectedFilter] = useState(initialFilter || "all");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { settings, addSearchTerm, clearSearchHistory } = useUserSettings();

  useEffect(() => {
    if (initialFilter !== selectedFilter) {
      setSelectedFilter(initialFilter || "all");
    }
  }, [initialFilter]);

  const handleSearch = () => {
    if (!query.trim()) return;
    const effectiveFilter = selectedFilter === "all" ? undefined : selectedFilter;
    console.log("Searching for:", query, "with filter:", effectiveFilter);
    onSearch(query, effectiveFilter);
    addSearchTerm(query);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleHistoryItemClick = (term: string) => {
    setQuery(term);
    setIsOpen(false);
    const effectiveFilter = selectedFilter === "all" ? undefined : selectedFilter;
    console.log("History clicked:", term, "with filter:", effectiveFilter);
    onSearch(term, effectiveFilter);
  };

  const handleClearSearch = () => {
    setQuery("");
    onSearch("", selectedFilter === "all" ? undefined : selectedFilter);
    inputRef.current?.focus();
  };

  const handleFilterChange = (value: string) => {
    setSelectedFilter(value);
    if (query) {
      const effectiveFilter = value === "all" ? undefined : value;
      onSearch(query, effectiveFilter);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative w-full max-w-md ${className}`}>
      <div className="relative flex items-center">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => showHistory && settings.searchHistory.length > 0 && setIsOpen(true)}
          className="pl-8 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-10 top-1/2 -translate-y-1/2 h-5 w-5"
            onClick={handleClearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {filters.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-3" align="end">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Filtrar por</h4>
                <Select
                  value={selectedFilter}
                  onValueChange={handleFilterChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um filtro" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Garantimos que o valor "all" não seja vazio */}
                    <SelectItem value="all">Todos</SelectItem>
                    {filters.map((filter) => (
                      <SelectItem key={filter.field} value={filter.field}>
                        {filter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {isOpen && showHistory && settings.searchHistory.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-background border rounded-md shadow-md">
          <Command>
            <CommandList>
              <CommandGroup heading="Pesquisas recentes">
                {settings.searchHistory.map((term, index) => (
                  <CommandItem
                    key={index}
                    onSelect={() => handleHistoryItemClick(term)}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-accent cursor-pointer"
                  >
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{term}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <div className="border-t p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-muted-foreground"
                  onClick={() => {
                    clearSearchHistory();
                    setIsOpen(false);
                  }}
                >
                  Limpar histórico
                </Button>
              </div>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
};