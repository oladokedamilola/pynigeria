import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
               <img
              src="/logo.svg"
              alt="Python 9ja"
              className="w-8 h-8 rounded-lg"
            />
              <span className="font-display font-bold text-lg text-white">
                Python<span className="text-green-400">9ja</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Building Nigeria's most vibrant Python developer community — one line of code at a time. 🇳🇬
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Platform</h4>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/jobs"           className="hover:text-green-400 transition-colors">Jobs Board</Link>
              <Link href="/news"           className="hover:text-green-400 transition-colors">Tech News</Link>
              <Link href="/register" className="hover:text-green-400 transition-colors">Sign Up</Link>
              <Link href="/login" className="hover:text-green-400 transition-colors">Sign In</Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Community</h4>
            <div className="flex flex-col gap-2 text-sm">
              <a href="https://chat.whatsapp.com/BiQWwZnBTgwFaAbLmhiF43" className="hover:text-green-400 transition-colors">WhatsApp Group</a>
              <a href="#" className="hover:text-green-400 transition-colors">Telegram</a>
              <a href="#" className="hover:text-green-400 transition-colors">Discord</a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <p>© {new Date().getFullYear()} Python 9ja.</p>
          <p className="text-green-500">🇳🇬 Empowering Nigerian Developers</p>
        </div>
      </div>
    </footer>
  );
}
