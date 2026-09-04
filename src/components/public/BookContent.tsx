'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import BookingForm from './BookingForm';

export default function BookContent() {
  const searchParams = useSearchParams();
  const initialPackage = searchParams.get('package') || '';
  const initialService = searchParams.get('service') || '';

  return <BookingForm initialPackage={initialPackage} initialService={initialService} />;
}
