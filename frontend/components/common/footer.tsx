import Image from "next/image"
import Link from "next/link"

import Logo from "@/public/images/dark-logo.svg"

const FOOTER_LINKS = [
  { href: "/privacy-policy", label: "개인정보처리방침" },
  { href: "/terms", label: "이용약관" },
  { href: "/data-ai-usage", label: "데이터·AI 이용 안내" },
]

export default function Footer() {
  return (
    <footer className="flex h-max flex-col items-center justify-center gap-4 bg-neutral-800 px-6 py-8 text-center text-xs text-neutral-300">
      <Image src={Logo} alt="개미굴 로고" width={130} />
      <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        {FOOTER_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="hover:text-white hover:underline">
            {link.label}
          </Link>
        ))}
      </nav>
      <p className="text-neutral-400">© 2026 Anthill. All rights reserved.</p>
    </footer>
  )
}
