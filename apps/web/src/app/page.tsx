import productionsData from '@/data/scientific-productions.json';
import type { ScientificProduction } from '@/types';
import { HomeView } from './components/HomeView';
import PageHeroSearch from '@/components/PageHeroSearch';

export default function HomePage() {
  return (
    <main>
      <HomeView productions={productionsData as ScientificProduction[]} />
    </main>
  );
}
