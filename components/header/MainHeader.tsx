import Link from "next/link";
import NavLink from "./NavLink";
import LogoutButton from "../LogoutButton";

export default function MainHeader() {
  return (
    <header className="flex justify-between items-center px-6 py-4 bg-gray-800 dark:bg-gray-900 text-white border-b border-gray-700 dark:border-gray-800 shadow-lg">
      <Link
        className="text-xl font-bold hover:text-blue-400 dark:hover:text-blue-300 transition-colors"
        href="/"
      >
        Home
      </Link>

      <nav>
        <ul className="flex items-center space-x-6">
          <li>
            <NavLink href='/workouts'>Browse Workouts</NavLink>
          </li>
          <li>
            <NavLink href='/profile'>Profile Page</NavLink>
          </li>
          <li>
            <NavLink href='/community'>Workout Community</NavLink>
          </li>
          <li>
            <LogoutButton />
          </li>
        </ul>
      </nav>
    </header>
  );
}