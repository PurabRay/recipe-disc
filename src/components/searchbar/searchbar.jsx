import React, { useState, useEffect } from "react";
import axios from "axios";
import { useInfiniteQuery } from "@tanstack/react-query";
import { debounce } from "lodash";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const Searchbar = () => {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    cuisine: "",
    diet: "",
    excludeIngredients: "",
    maxReadyTime: "",
  });
  const [error, setError] = useState("");
const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["recipes", query, filters],
    queryFn: ({ pageParam = 0 }) => {
      if (!query) {
        throw new Error("Please enter a search term.");
      }
  
      return axios.get("https://api.spoonacular.com/recipes/complexSearch", {
        params: {
          apiKey: "6b1f0efee1a1423e9ddeb316fe5a8433",
          query, 
          cuisine: filters.cuisine || undefined,
          diet: filters.diet || undefined,
          excludeIngredients: filters.excludeIngredients || undefined,
          maxReadyTime: filters.maxReadyTime || undefined,
          offset: pageParam,
          number: 10,
        },
      });
    },
    getNextPageParam: (lastPage, pages) => {
      if (lastPage?.data?.results?.length < 10) return undefined;
      return pages.length * 10;
    },
    onError: (e) => {
      console.error("Error fetching recipes:", e.response || e.message);
      setError("Failed to fetch recipes. Please try again.");
    },
  });
  
  const debouncedSearch = debounce((value) => {
    setQuery(value);
  }, 500);

  useEffect(() => {
    refetch();
  }, [filters]);

  const handleInputChange = (e) => {
    debouncedSearch(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const renderRecipes = () => {
    if (isLoading) return <p>Loading recipes...</p>;
    if (error) return <p>{error.message || "Failed to fetch recipes."}</p>;
    if (!data || !data.pages || data.pages.length === 0)
      return <p>No recipes found for your search.</p>;
  
    return data.pages.map((page, i) => (
      <React.Fragment key={i}>
        {page.data.results.map((recipe) => (
          <div key={recipe.id} className="recipe-card">
            <img src={recipe.image} alt={recipe.title} />
            <h3>{recipe.title}</h3>
            <p>Ready in {recipe.readyInMinutes} minutes</p>
          </div>
        ))}
      </React.Fragment>
    ));
  };
  

  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search recipes..."
        onChange={handleInputChange}
      />
      <div className="filters">
        <select name="cuisine" onChange={handleFilterChange}>
          <option value="">All Cuisines</option>
          <option value="Italian">Italian</option>
          <option value="Mexican">Mexican</option>
        </select>
        <select name="diet" onChange={handleFilterChange}>
          <option value="">All Diets</option>
          <option value="Vegetarian">Vegetarian</option>
          <option value="Vegan">Vegan</option>
        </select>
        <input
          type="text"
          name="excludeIngredients"
          placeholder="Exclude ingredients"
          onChange={handleFilterChange}
        />
        <input
          type="number"
          name="maxReadyTime"
          placeholder="Max cooking time (min)"
          onChange={handleFilterChange}
        />
      </div>
      <div className="recipes">{renderRecipes()}</div>
      {hasNextPage && !isFetchingNextPage && (
        <button onClick={() => fetchNextPage()}>Load More</button>
      )}
      {isFetchingNextPage && <p>Loading more recipes...</p>}
    </div>
  );
};

export default Searchbar;
