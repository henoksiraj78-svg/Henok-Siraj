// components/Navbar.tsx
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="text-xl font-bold text-blue-600">
        Eng<span className="text-black">Blog</span>
      </div>
      
      <div className="flex gap-6 font-medium text-gray-600">
        <Link href="/home" className="hover:text-blue-600 transition">Home</Link>
        <Link href="/admin" className="hover:text-blue-600 transition">Admin</Link>
        <Link href="/contact" className="hover:text-blue-600 transition">Contact</Link>
      </div>

      <button className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:opacity-80">
        Subscribe
      </button>
    </nav>
  );
}