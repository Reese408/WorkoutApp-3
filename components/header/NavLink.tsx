'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";

const classes = {
  link: "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded transition-colors duration-200",
  active: "font-semibold text-blue-600 dark:text-blue-400 underline"
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