'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { getResources, PaginatedResourcesResponse, GetResourcesParams } from '@/services/resource.service';
import ResourceCard from './ResourceCard';
import { ApiError } from '@/services/auth.service'; // For error handling
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { useFavorites } from '@/context/FavoriteContext';
import PaginationControls from './PaginationControls'; // Import the new component
import debounce from '@/utils/debounce'; // Import debounce utility

interface ResourceListProps {
  initialParams?: GetResourcesParams;
}

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Upload Date' },
  { value: 'title', label: 'Title' },
  { value: 'downloadCount', label: 'Downloads' },
  // Add more as needed, matching backend capabilities
];

const SORT_ORDER_OPTIONS = [
  { value: 'desc', label: 'Descending' },
  { value: 'asc', label: 'Ascending' },
];

const ResourceList: React.FC<ResourceListProps> = ({ initialParams = {} }) => {
  const [resourcesResponse, setResourcesResponse] = useState<PaginatedResourcesResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // States for filter inputs
  const [keywordInput, setKeywordInput] = useState(initialParams.keyword || '');
  const [categoryInput, setCategoryInput] = useState(initialParams.category || '');
  const [tagsInput, setTagsInput] = useState(initialParams.tags || '');
  const [sortBy, setSortBy] = useState(initialParams.sortBy || 'createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialParams.sortOrder || 'desc');

  const [currentParams, setCurrentParams] = useState<GetResourcesParams>({
    page: 1, // Start with page 1 by default
    limit: 10, // Default limit
    ...initialParams, // Apply initial params which might override page/limit
    // Ensure initial filter values are part of currentParams if set
    keyword: initialParams.keyword || undefined,
    category: initialParams.category || undefined,
    tags: initialParams.tags || undefined,
    sortBy: initialParams.sortBy || 'createdAt',
    sortOrder: initialParams.sortOrder || 'desc',
  });
  const [refreshKey, setRefreshKey] = useState(0);
  
  const { user: currentUser, token, isLoading: authLoading } = useAuth();
  const { isFavorite } = useFavorites();

  // Debounced function to update filters
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedApplyFilters = useCallback(
    debounce((params: GetResourcesParams) => {
      setCurrentParams(prevParams => ({
        ...prevParams,
        ...params,
        page: 1, // Reset to page 1 on new filter application
      }));
    }, 500), // 500ms debounce delay
    [] // No dependencies, debounce function itself doesn't change
  );

  useEffect(() => {
    // This effect calls the debounced function whenever filter inputs change
    debouncedApplyFilters({
      keyword: keywordInput || undefined,
      category: categoryInput || undefined,
      tags: tagsInput || undefined,
      sortBy: sortBy,
      sortOrder: sortOrder,
    });
  }, [keywordInput, categoryInput, tagsInput, sortBy, sortOrder, debouncedApplyFilters]);

  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Filter out empty strings for params that should be omitted if empty
        const paramsToFetch: GetResourcesParams = { ...currentParams };
        if (paramsToFetch.keyword === '') delete paramsToFetch.keyword;
        if (paramsToFetch.category === '') delete paramsToFetch.category;
        if (paramsToFetch.tags === '') delete paramsToFetch.tags;
        
        const response = await getResources(paramsToFetch);
        setResourcesResponse(response);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message + (err.response?.message ? `: ${err.response.message}` : ''));
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred while fetching resources.');
        }
        setResourcesResponse(null);
      }
      setIsLoading(false);
    };

    fetchResources();
  }, [currentParams, refreshKey]);

  const handleResourceDeleted = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  const handleResetFilters = () => {
    setKeywordInput('');
    setCategoryInput('');
    setTagsInput('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setCurrentParams(prevParams => ({
      // Reset all filterable/sortable fields, keep limit, reset page
      ...prevParams, // Spread to keep any other non-filter params if they exist
      page: 1,
      keyword: undefined,
      category: undefined,
      tags: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }));
  };

  const handlePageChange = (newPage: number) => {
    setCurrentParams(prevParams => ({
      ...prevParams,
      page: newPage,
    }));
  };
  
  const displayLoading = isLoading || authLoading;

  if (displayLoading) {
    return <p className="text-center text-gray-500 py-8">Loading resources...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 py-8">Error: {error}</p>;
  }

  // No resources found message should appear after attempting to load and filter
  // and if there are no errors.
  // The isLoading check is already handled by displayLoading.

  return (
    <div className="container mx-auto p-4">
      {/* Search, Filter, Sort UI controls - No longer a form */}
      <div className="bg-gray-50 p-4 rounded-lg shadow mb-6 space-y-4 md:space-y-0 md:flex md:flex-wrap md:items-end md:gap-4">
        {/* Keyword Search */}
        <div className="flex-grow">
          <label htmlFor="keyword" className="block text-sm font-medium text-gray-700">Keyword</label>
          <input
            type="text"
            id="keyword"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search title or description..."
          />
        </div>

        {/* Category Filter */}
        <div className="flex-grow">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
          <input
            type="text"
            id="category"
            value={categoryInput}
            onChange={(e) => setCategoryInput(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Filter by category..."
          />
        </div>

        {/* Tags Filter */}
        <div className="flex-grow">
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
          <input
            type="text"
            id="tags"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="e.g., javascript,react"
          />
        </div>
        
        {/* Sort By */}
        <div className="min-w-[150px]">
          <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700">Sort By</label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Sort Order */}
        <div className="min-w-[150px]">
          <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700">Order</label>
          <select
            id="sortOrder"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {SORT_ORDER_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Removed Apply button, Reset button remains */}
        <div className="flex items-end space-x-2 pt-5">
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          >
            Reset
          </button>
        </div>
      </div>

      {(!resourcesResponse || resourcesResponse.data.length === 0) && !displayLoading && !error && (
         <p className="text-center text-gray-500 py-8">No resources found matching your criteria.</p>
      )}

      {resourcesResponse && resourcesResponse.data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resourcesResponse.data.map((resource) => (
            <ResourceCard
              key={resource._id}
              resource={resource}
              currentUserId={currentUser?._id}
              token={token}
              onResourceDeleted={handleResourceDeleted}
              showFavoriteButton={true}
              isFavorite={isFavorite(resource._id)}
            />
          ))}
        </div>
      )}
      
      {resourcesResponse && resourcesResponse.pagination && resourcesResponse.data.length > 0 && (
        <PaginationControls 
          currentPage={resourcesResponse.pagination.currentPage}
          totalPages={resourcesResponse.pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default ResourceList; 