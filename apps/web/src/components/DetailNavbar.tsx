'use client';

import { ReactNode, useState } from 'react';

export interface Category {
  id: string;
  name: string;
  icon?: ReactNode;
}

interface CategoriesNavigationProps {
  categories: Category[];
  defaultActive?: string;
  onCategoryChange: (categoryId: string) => void;
  containerClassName?: string;
  itemClassName?: string;
  activeItemClassName?: string;
  backgroundColor?: string;
}

export default function CategoriesNavigation({
  categories,
  defaultActive,
  onCategoryChange,
  containerClassName = 'w-full flex items-center px-6 py-3 h-20 bg-[#F2F2F2]',
  itemClassName = 'flex-1 h-full px-4 rounded-md transition cursor-pointer hover:bg-[#D9D9D9] text-center flex items-center justify-center',
  activeItemClassName = '',
  backgroundColor,
}: CategoriesNavigationProps) {
  const [activeCategory, setActiveCategory] = useState(defaultActive || categories[0]?.id);

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    onCategoryChange(categoryId);
  };

  const finalContainerClass = backgroundColor
    ? containerClassName.replace(/bg-\[.*?\]/g, `bg-[${backgroundColor}]`)
    : containerClassName;

  return (
    <nav className={finalContainerClass}>
      {/* Desktop View */}
      <div className="grow flex sm:items-center sm:justify-center max-sm:justify-end w-full h-full">
        <div className="hidden sm:flex items-center justify-center gap-0 w-full h-full">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`flex gap-2 flex-1 ${itemClassName} ${
                activeCategory === category.id ? activeItemClassName : ''
              }`}
            >
              {category.icon && (
                <span className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                  {category.icon}
                </span>
              )}
              <span className="text-sm font-medium">{category.name}</span>
            </button>
          ))}
        </div>

        {/* Mobile View - Dropdown Menu */}
        <div className="sm:hidden dropdown dropdown-end bg-[#F2F2F2] w-full">
          <label tabIndex={0} className="btn btn-ghost btn-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-50"
          >
            {categories.map((category) => (
              <li key={category.id}>
                <button
                  onClick={() => handleCategoryClick(category.id)}
                  className={`flex items-center gap-2 rounded-md transition ${
                    activeCategory === category.id ? 'bg-[#005DA4] text-white' : ''
                  }`}
                >
                  {category.icon && (
                    <span className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                      {category.icon}
                    </span>
                  )}
                  <span>{category.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}

/*Use example*/
// export default function HomePage() {
//   const [activeTab, setActiveTab] = useState('overview');

//   const categories: Category[] = [
//     {
//       id: 'overview',
//       name: 'Portal Científico',
//       icon: <Beaker size={18} />,
//     },
//     {
//       id: 'researchers',
//       name: 'Investigadores',
//       icon: <Users size={18} />,
//     },
//     {
//       id: 'projects',
//       name: 'Proyectos',
//       icon: <Briefcase size={18} />,
//     },
//   ];

//   return (
//     <main className="min-h-screen bg-base-100">
//       <div className="w-full">
//         {/* Detail Navigation */}
//         <DetailNavbar
//           categories={categories}
//           defaultActive="overview"
//           onCategoryChange={(id) => setActiveTab(id)}
//           backgroundColor="#F2F2F2"
//         />

//         {/* Content Section */}
//         <div className="max-w-6xl mx-auto px-6 py-12">
//           {activeTab === 'overview' && (
//             <div>
//               <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-azul-800)' }}>
//                 Portal de Producción Científica
//               </h1>
//             </div>
//           )}

//           {activeTab === 'researchers' && (
//             <div>
//               <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-azul-800)' }}>
//                 Nuestros Investigadores
//               </h2>
//             </div>
//           )}

//           {activeTab === 'projects' && (
//             <div>
//               <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-azul-800)' }}>
//                 Proyectos Activos
//               </h2>
//             </div>
//           )}
//         </div>
//       </div>
//     </main>
//   )
// }    