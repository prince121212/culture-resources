'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ResourceForm from '@/components/resources/ResourceForm';
import {
  getResourceById,
  updateResource,
  CreateResourceData, // Re-used for form structure, though it's an update
  Resource as ResourceType,
} from '@/services/resource.service';
import { ApiError, ValidationError } from '@/services/auth.service';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function EditResourcePage() {
  const router = useRouter();
  const params = useParams();
  const { user: currentUser, token, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const resourceId = typeof params.id === 'string' ? params.id : null;

  const [resource, setResource] = useState<ResourceType | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [generalPageError, setGeneralPageError] = useState<string | null>(null);
  const [serverValidationErrors, setServerValidationErrors] = useState<ValidationError[]>([]);

  useEffect(() => {
    if (authLoading) return; // Wait for auth state to load

    if (!isAuthenticated) {
      toast.error('Please login to edit resources.');
      router.replace(`/auth/login?redirect=/resources/${resourceId}/edit`);
      return;
    }

    if (resourceId) {
      const fetchResourceToEdit = async () => {
        setIsFetching(true);
        setGeneralPageError(null);
        try {
          const data = await getResourceById(resourceId);
          setResource(data);
          // Authorization check: current user must be the uploader
          if (currentUser?._id !== (typeof data.uploader === 'string' ? data.uploader : data.uploader._id)) {
            toast.error('You are not authorized to edit this resource.');
            router.replace(`/resources/${resourceId}`); // Redirect to detail page or resource list
            return;
          }
        } catch (err: unknown) {
          let errorMessage = 'Failed to fetch resource for editing.';
          if (err instanceof ApiError) {
            errorMessage = err.response?.message || err.message;
            if (err.status === 404) toast.error('Resource not found.');
          } else if (err instanceof Error) {
            errorMessage = err.message;
          }
          setGeneralPageError(errorMessage);
          toast.error(errorMessage);
          router.replace('/resources'); // Redirect if resource cannot be fetched
        }
        setIsFetching(false);
      };
      fetchResourceToEdit();
    } else {
      setGeneralPageError('Resource ID is missing.');
      toast.error('Resource ID is missing.');
      router.replace('/resources');
      setIsFetching(false);
    }
  }, [resourceId, isAuthenticated, authLoading, currentUser, router]);

  const handleUpdate = async (data: CreateResourceData) => {
    if (!resourceId || !token) {
      toast.error('Cannot update resource. Missing ID or authentication.');
      return;
    }
    setIsSubmitting(true);
    setGeneralPageError(null);
    setServerValidationErrors([]);

    try {
      const updated = await updateResource(resourceId, data, token);
      toast.success('Resource updated successfully!');
      router.push(`/resources/${updated._id}`);
    } catch (err: unknown) {
      let toastMessage = 'Failed to update resource. Please try again.';
      let specificFieldErrors: ValidationError[] = [];
      let pageLevelErrorMessage: string | null = null; // For errors not tied to specific fields

      if (err instanceof ApiError) {
        toastMessage = err.response?.message || err.message; // Use API message for toast first
        if (err.response?.errors && Array.isArray(err.response.errors)) {
          specificFieldErrors = err.response.errors;
          // If specific errors exist, the toast message might be better as a general one
          toastMessage = err.response.message || "Please check the form for errors."; 
        } else {
          // No specific field errors from backend, so this is a general API error
          pageLevelErrorMessage = err.response?.message || err.message;
        }
      } else if (err instanceof Error) {
        toastMessage = err.message;
        pageLevelErrorMessage = err.message; // Treat other errors as general page errors
      }
      
      setServerValidationErrors(specificFieldErrors);
      // Set generalPageError only if there are no specific field errors and pageLevelErrorMessage exists
      if (specificFieldErrors.length === 0 && pageLevelErrorMessage) {
        setGeneralPageError(pageLevelErrorMessage);
      } else if (specificFieldErrors.length > 0 && !pageLevelErrorMessage) {
        // Optional: if only field errors, maybe set a generic page error too.
        // setGeneralPageError("Please correct the errors highlighted below.");
      }

      toast.error(toastMessage); // Display the most relevant message as a toast
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFetching || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <p className="text-xl text-gray-600">Loading editor...</p>
      </div>
    );
  }

  if (generalPageError && !resource) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl text-red-500 mb-4">Error: {generalPageError}</p>
        <Link href={resourceId ? `/resources/${resourceId}` : "/resources"} className="text-indigo-600 hover:text-indigo-800">
          &larr; Back
        </Link>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl text-gray-700">Resource could not be loaded for editing.</p>
         <Link href="/resources" className="text-indigo-600 hover:text-indigo-800">
            &larr; Back to Resources
          </Link>
      </div>
    );
  }

  // Prepare initial data for the form, ensuring tags are a comma-separated string
  const formInitialData: Partial<CreateResourceData> = {
    ...resource,
    tags: resource.tags ? resource.tags.join(', ') : '',
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Link href={resourceId ? `/resources/${resourceId}` : "/resources"} className="text-indigo-600 hover:text-indigo-800">
          &larr; Back to Resource Details
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 mt-2">Edit Resource</h1>
        <p className="text-gray-600 mt-1">Update the details of your resource.</p>
      </div>

      {generalPageError && (
         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{generalPageError}</span>
        </div>
      )}

      <ResourceForm 
        onSubmit={handleUpdate} 
        initialData={formInitialData} 
        isLoading={isSubmitting} 
        submitButtonText="Update Resource"
        serverErrors={serverValidationErrors}
      />
    </div>
  );
} 