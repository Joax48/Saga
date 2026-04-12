import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full">
      {/*First Bar - Logos*/}
      <div className="flex justify-start h-22 bg-[#005DA4] px-8 py-2">
        <div className="flex h-full w-full max-w-6xl items-center">
          <div className="pr-7">
            <a href="https://www.ucr.ac.cr/" target="_blank" rel="noopener noreferrer">
              <Image src="/logo_UCR.png" alt="logo" width={200} height={50} />
            </a>
          </div>
          <div className="pr-2">
            <a href="/" target="_blank" rel="noopener noreferrer">
              <Image src="/logo_OBDI.png" alt="logo" width={100} height={50} />
            </a>
          </div>
          <h1 className="font-bold text-white/80 w-42 max-sm:hidden">
            Observatorio de Datos Institucionales
          </h1>
        </div>
      </div>
      {/*Second Bar - Intern Links*/}
      <div className="h-12 bg-[#F2F2F2] px-6 py-2">
        <div className="mx-auto flex h-full w-full max-w-6xl items-center">
          <div className="grow flex sm:items-center sm:justify-center max-sm:justify-end max-sm:pr-11">
            <div className="hidden sm:flex items-center justify-center gap-2 md:gap-8 whitespace-nowrap">
              <Link
                href="/"
                className="px-3 py-2 rounded-md hover:bg-[#D9D9D9] transition"
              >
                Inicio
              </Link>
              <Link
                href="/researchers"
                className="px-3 py-2 rounded-md hover:bg-[#D9D9D9] transition"
              >
                Investigadores
              </Link>
              <Link
                href="/units"
                className="px-3 py-2 rounded-md hover:bg-[#D9D9D9] transition"
              >
                Unidades
              </Link>
              <Link
                href="/scientific-productions"
                className="px-3 py-2 rounded-md hover:bg-[#D9D9D9] transition"
              >
                Producción Científica
              </Link>
              <Link
                href="/projects"
                className="px-3 py-2 rounded-md hover:bg-[#D9D9D9] transition"
              >
                Proyectos
              </Link>
              <Link
                href="/other-productions"
                className="px-3 py-2 rounded-md hover:bg-[#D9D9D9] transition"
              >
                Otros tipos de producción
              </Link>
            </div>
            <div className="sm:hidden dropdown dropdown-end bg-[#F2F2F2]">
              {/*Responsive part for Intern Links, please do not touch*/}
              <label tabIndex={0} className="btn btn-ghost">
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
                    Investigadores
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
                <li>
                  <Link
                    href="/other-productions"
                    className="px-3 py-2 rounded-md hover:bg-[#D9D9D9] transition active:bg-[#D9D9D9] focus:bg-[#D9D9D9]"
                  >
                    Otros tipos de producción
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
