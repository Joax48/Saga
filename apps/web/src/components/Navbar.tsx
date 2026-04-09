import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  return (
    <div className="w-full">
      {/*First Bar - Logos*/}
      <div className="max-w flex items-center px-6 py-2 h-22 bg-[#005DA4]">
        <div className="pl-10 pr-7">
          <a href="https://www.ucr.ac.cr/" target="_blank" rel="noopener noreferrer">
            <Image src="/logo_UCR.png" alt="logo" width={200} height={50} />
          </a>
        </div>
        <div className="pr-2">
          <a href="/" target="_blank" rel="noopener noreferrer">
            <Image src="/logo_OBDI.png" alt="logo" width={100} height={50} />
          </a>
        </div>
        <h1 className="font-bold text-white/80 w-40">
          Observatorio de Datos Institucionales
        </h1>
      </div>
      {/*Second Bar - Intern Links*/}
      <div className="max-w flex items-center px-6 py-2 h-12 bg-[#F2F2F2]">
        <div className="grow flex sm:items-center sm:justify-center max-sm:justify-end max-sm:pr-11">
          <div className="hidden sm:flex items-center justify-center gap-2 md:gap-8">
            <Link
              href="/home"
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
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
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
                  href="/home"
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
  );
}
