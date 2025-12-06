import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Landing from './Landing';

export default function Home() {
  const navigate = useNavigate();

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  React.useEffect(() => {
    if (!isLoading && user) {
      navigate(createPageUrl('Dashboard'));
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return null;
  }

  return <Landing />;
}