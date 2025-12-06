import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Landing from './Landing';
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const navigate = useNavigate();

  const { data: isAuthenticated, isLoading } = useQuery({
    queryKey: ['isAuthenticated'],
    queryFn: () => base44.auth.isAuthenticated(),
    retry: false,
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(createPageUrl('Dashboard'));
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-64 w-full max-w-md" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Landing />;
  }

  return null;
}