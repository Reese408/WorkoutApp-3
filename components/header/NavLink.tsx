'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";

const classes = {
  link: "text-gray-700 hover:text-blue-600 px-3 py-2 rounded transition-colors duration-200",
  active: "font-semibold text-blue-600 underline"
};

export default function NavLink({ href, children }: { href: string, children: React.ReactNode }) {
  const path = usePathname();

  return (
    <Link
      href={href}
      className={
        path.startsWith(href)
          ? `${classes.link} ${classes.active}`
          : classes.link
      }
    >
      {children}
    </Link>
  );
}