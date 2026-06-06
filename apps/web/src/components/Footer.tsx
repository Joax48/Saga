import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <div className="w-full bg-[#00c0f3] pl-10 pr-7 pt-5 pb-5 grid sm:grid-cols-4 gap-4 text-sm">
      <div className="p-4">
        <div className="pl-10 pr-7 pt-2 pb-3">
          <a href="https://www.ucr.ac.cr/" target="_blank" rel="noopener noreferrer">
            <Image src="/logo_ucr_white_acronym.png" alt="logo" width={150} height={50} />
          </a>
        </div>
        <h2 className="mb-2 mt-30 text-white text-xs">
          Ⓒ 2026 Universidad de Costa Rica
        </h2>
      </div>
      <div className="p-4">
        <h2 className="font-bold mb-2 text-[#005da4]">Mapa del sitio</h2>
        <ul className="flex flex-col gap-2 pt-4 text-white text-xs">
          <li>
            <Link href="/researchers" className="hover:underline">
              Perfiles
            </Link>
          </li>
          <li>
            <Link href="/units" className="hover:underline">
              Unidades
            </Link>
          </li>
          <li>
            <Link href="/scientific-productions" className="hover:underline">
              Producción científica
            </Link>
          </li>
          <li>
            <Link href="/projects" className="hover:underline">
              Proyectos
            </Link>
          </li>
          <li>
            <Link href="/about" className="hover:underline">
              Sobre este proyecto
            </Link>
          </li>
        </ul>
      </div>
      <div className="p-4">
        <h2 className="font-bold mb-2 text-[#005da4]">Enlaces de Interés</h2>
        <ul className="flex flex-col gap-2 pt-4 text-white text-xs">
          <li>
            <Link href="https://www.ucr.ac.cr/" className="hover:underline">
              Universidad de Costa Rica
            </Link>
          </li>
          <li>
            <Link href="https://rectoria.ucr.ac.cr/" className="hover:underline">
              Rectoría
            </Link>
          </li>
          <li>
            <Link href="/" className="hover:underline">
              Observatorio de Datos Institucionales
            </Link>
          </li>
        </ul>
      </div>
      <div className="p-4">
        <h2 className="font-bold mb-2 text-[#005da4]">Contacto</h2>
        <ul className="flex flex-col gap-2 pt-4 text-white text-xs">
          <li>
            <h2>Correo: obdi@ucr.ac.cr</h2>
          </li>
          <li>
            <h2>Teléfono: 2211-5183</h2>
          </li>
          <li>
            <h2>San José, San Pedro, Saprissa</h2>
          </li>
        </ul>
      </div>
    </div>
  );
}
