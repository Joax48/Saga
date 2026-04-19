'use client';
import { useEffect, useState } from 'react';
import { getScientificProductions } from '@/services/scientific-productions';
import { ScientificProductionsView } from './components';
import type { SummaryScientificProduction } from '@/types';

/**
 * Scientific productions list page.
 *
 * Server component: fetches data from the API and passes it to the client-side
 * view which owns all filter/search/pagination state.
 */
export default function ScientificProductionsPage() {
  const [productions, setProductions] = useState<SummaryScientificProduction[]>([]);

  useEffect(() => {
    getScientificProductions(1, 100)
      .then((response) => setProductions(response.items))
      .catch((error) => {
        console.error('Failed to fetch scientific productions:', error);
      });
  }, []);

  return <ScientificProductionsView productions={productions} />;
}
