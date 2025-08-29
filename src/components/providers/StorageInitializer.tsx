"use client";

import { useEffect } from 'react';
import { initializeMockStorage } from '@/lib/mock-storage';

export function StorageInitializer() {
  useEffect(() => {
    // Initialize mock storage on client-side
    initializeMockStorage();
  }, []);

  return null; // This component doesn't render anything
}
