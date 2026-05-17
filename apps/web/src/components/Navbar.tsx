'use client';
import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const [initialized, setInitialized] = useState(false);

  useLayoutEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50); // umbral
    };

    const setHeaderHeight = () => {
      try {
        const h = headerRef.current?.offsetHeight ?? 0;
        document.documentElement.style.setProperty('--site-header-height', `${h}px`);
      } catch (e) {
        /* ignore */
      }
    };

    // run synchronously before paint to avoid visual flash
    handleScroll();
    setHeaderHeight();
    // mark initialized so we can safely show the header without transition flash
    setInitialized(true);

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', setHeaderHeight);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', setHeaderHeight);
    };
  }, []);

  return (
    // It need to be fixed isntead of sticky but it will be over all so the space need to be in the PageHero
    <header
      ref={headerRef}
      style={initialized ? undefined : { transition: 'none' }}
      className={`fixed top-0 z-50 w-full transition-colors duration-300 group ${scrolled ? 'scrolled' : ''}`}
    >
      <div className="flex justify-start h-3 bg-[#00c0f3] transition-all duration-300 group-[.scrolled]:h-0"></div>
      {/*First Bar - Logos*/}
      <div className="flex justify-start h-22 bg-[#ffffff] px-8 py-2 transition-all duration-500 group-[.scrolled]:bg-[#00c0f3] group-[.scrolled]:h-16">
        <div className="flex h-full w-full max-w-6xl items-center">
          <div className="pr-2">
            <a href="https://www.ucr.ac.cr/" target="_blank" rel="noopener noreferrer">
              <Image
                src="/logo_ucr_crest.png"
                alt="logo ucr"
                width={80}
                height={50}
                className={`
                  object-contain origin-left overflow-hidden
                  transition-all duration-500
                  ${scrolled ? 'scale-0 w-0 opacity-0' : 'scale-100 w-[80px] opacity-100'}
                `}
              />
            </a>
          </div>
          <div className="pr-7">
            <a href="https://www.ucr.ac.cr/" target="_blank" rel="noopener noreferrer">
              <Image
                src="/logo_ucr_black_nocrest6.png"
                alt="logo ucr"
                width={120}
                height={50}
                className={`object-contain transition-all duration-300 ${
                  scrolled ? 'invert' : ''
                }`}
              />
            </a>
          </div>
          <div className="pr-2">
            <a href="/" target="_blank" rel="noopener noreferrer">
              <Image
                src="/logo_obdi_black_acronym.png"
                alt="logo obdi"
                width={90}
                height={50}
                className={`border-b border-[#00c0f3] object-contain transition-all duration-300 ${
                  scrolled ? 'invert' : ''
                } group-[.scrolled]:border-black`}
              />
            </a>
          </div>
          <div className="pr-2">
            <a href="/" target="_blank" rel="noopener noreferrer">
              <Image
                src="/logo_obdi_black_no_acro.png"
                alt="logo obdi"
                width={170}
                height={50}
                className={'group-[.scrolled]:hidden'}
              />
            </a>
          </div>
        </div>
      </div>
      {/*Second Bar - Intern Links*/}
      <div className="text-[#005da4] text-xs font-bold bg-transparent px-6 py-2 group-[.scrolled]:bg-white">
        <div className="mx-auto flex h-full w-full max-w-6xl items-center">
          <div className="grow flex sm:items-center sm:justify-center max-sm:justify-end max-sm:pr-11">
            <div className="h-4 hidden sm:flex items-center justify-center gap-2 md:gap-8 whitespace-nowrap">
              <Link
                href="/"
                className="
                relative inline-block px-3 py-2 rounded-md
                transition-colors duration-300
                hover:text-[#00c0f3]

                after:absolute after:left-1/2 after:bottom-1
                after:h-[2px] after:w-0
                after:bg-[#00c0f3]
                after:transition-all after:duration-300
                after:-translate-x-1/2

                hover:after:w-[calc(100%-1.5rem)]
                "
              >
                Inicio
              </Link>
              <Link
                href="/researchers"
                className="
                relative inline-block px-3 py-2 rounded-md
                transition-colors duration-300
                hover:text-[#00c0f3]

                after:absolute after:left-1/2 after:bottom-1
                after:h-[2px] after:w-0
                after:bg-[#00c0f3]
                after:transition-all after:duration-300
                after:-translate-x-1/2

                hover:after:w-[calc(100%-1.5rem)]
                "
              >
                Perfiles
              </Link>
              <Link
                href="/units"
                className="
                relative inline-block px-3 py-2 rounded-md
                transition-colors duration-300
                hover:text-[#00c0f3]

                after:absolute after:left-1/2 after:bottom-1
                after:h-[2px] after:w-0
                after:bg-[#00c0f3]
                after:transition-all after:duration-300
                after:-translate-x-1/2

                hover:after:w-[calc(100%-1.5rem)]
                "
              >
                Unidades
              </Link>
              <Link
                href="/scientific-productions"
                className="
                relative inline-block px-3 py-2 rounded-md
                transition-colors duration-300
                hover:text-[#00c0f3]

                after:absolute after:left-1/2 after:bottom-1
                after:h-[2px] after:w-0
                after:bg-[#00c0f3]
                after:transition-all after:duration-300
                after:-translate-x-1/2

                hover:after:w-[calc(100%-1.5rem)]
                "
              >
                Producción Científica
              </Link>
              <Link
                href="/projects"
                className="
                relative inline-block px-3 py-2 rounded-md
                transition-colors duration-300
                hover:text-[#00c0f3]

                after:absolute after:left-1/2 after:bottom-1
                after:h-[2px] after:w-0
                after:bg-[#00c0f3]
                after:transition-all after:duration-300
                after:-translate-x-1/2

                hover:after:w-[calc(100%-1.5rem)]
                "
              >
                Proyectos
              </Link>
            </div>
            <div className="sm:hidden dropdown dropdown-end bg-[#F2F2F2]">
              {/*Responsive part for Intern Links, please do not touch*/}
              <label tabIndex={0} className="btn btn-ghost bg-white">
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
                className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
              >
                <li>
                  <Link
                    href="/"
                    className="px-3 py-2 rounded-md hover:bg-[#D9D9D9] transition active:bg-[#D9D9D9] focus:bg-[#D9D9D9]"
                  >
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link
                    href="/researchers"
                    className="px-3 py-2 rounded-md hover:bg-[#D9D9D9] transition active:bg-[#D9D9D9] focus:bg-[#D9D9D9]"
                  >
                    Perfiles
                  </Link>
                </li>
                <li>
                  <Link
                    href="/units"
                    className="px-3 py-2 rounded-md hover:bg-[#D9D9D9] transition active:bg-[#D9D9D9] focus:bg-[#D9D9D9]"
                  >
                    Unidades
                  </Link>
                </li>
                <li>
                  <Link
                    href="/scientific-productions"
                    className="px-3 py-2 rounded-md hover:bg-[#D9D9D9] transition active:bg-[#D9D9D9] focus:bg-[#D9D9D9]"
                  >
                    Producción Científica
                  </Link>
                </li>
                <li>
                  <Link
                    href="/projects"
                    className="px-3 py-2 rounded-md hover:bg-[#D9D9D9] transition active:bg-[#D9D9D9] focus:bg-[#D9D9D9]"
                  >
                    Proyectos
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
