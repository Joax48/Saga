import productionsData from '@/data/scientific-productions.json';
import { ScientificProductionsView } from './components';
import type { ScientificProduction } from '@/types';

/**
 * Scientific productions list page.
 *
 * Server component: reads static JSON at build time and passes the typed
 * array to the client-side view which owns all filter/search/pagination state.
 */
export default function ScientificProductionsPage() {
  return (
    <ScientificProductionsView productions={productionsData as ScientificProduction[]} />
  );
}
