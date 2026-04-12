import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <div className="w-full bg-[#666666] pl-10 pr-7 pt-5 pb-5 grid sm:grid-cols-4 gap-4 text-xs">
      <div className="p-4">
        <div className="pl-10 pr-7 pt-2 pb-3">
          <a href="https://www.ucr.ac.cr/" target="_blank" rel="noopener noreferrer">
            <Image src="/logo_UCR_2.png" alt="logo" width={150} height={50} />
          </a>
        </div>
        <div className="pl-10 pr-7 pt-2 pb-7">
          <a href="/" target="_blank" rel="noopener noreferrer">
            <Image src="/logo_SAGA_white.png" alt="logo" width={150} height={50} />
          </a>
        </div>
        <h2 className="mb-2 text-white">Ⓒ 2026 Universidad de Costa Rica</h2>
      </div>
      <div className="p-4">
        <h2 className="font-bold mb-2 text-white">Mapa del sitio</h2>
        <ul className="flex flex-col gap-6 pt-4 text-white">
          <li>
            <Link href="/researchers" className="hover:underline">
              Investigadores
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
            <Link href="/other-productions" className="hover:underline">
              Otros tipos de producción
            </Link>
          </li>
        </ul>
      </div>
      <div className="p-4">
        <h2 className="font-bold mb-2 text-white">Enlaces de Interés</h2>
        <ul className="flex flex-col gap-6 pt-4 text-white">
          <li>
            <Link href="https://www.ucr.ac.cr/" className="hover:underline">
              Universidad de Costa Rica
            </Link>
          </li>
          <li>
            <Link href="https://rectoria.ucr.ac.cr/" className="hover:underline">
              Rectoria
            </Link>
          </li>
          <li>
            <Link href="/" className="hover:underline">
              Observatorio de datos Institucionales
            </Link>
          </li>
        </ul>
      </div>
      <div className="p-4">
        <h2 className="font-bold mb-2 text-white">Contacto</h2>
        <ul className="flex flex-col gap-6 pt-4 text-white">
          <li>
            <h2 className="text-white">Correo: obdi@ucr.ac.cr</h2>
          </li>
          <li>
            <h2 className="text-white">Teléfono: 2211-5183</h2>
          </li>
          <li>
            <h2 className="text-white">San José, San Pedro, Saprissa</h2>
          </li>
        </ul>
      </div>
    </div>
  );
}
