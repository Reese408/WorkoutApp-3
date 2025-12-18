import Link from "next/link";
import NavLink from "./NavLink";
import LogoutButton from "../LogoutButton";

export default function MainHeader() {
  return (
    <header className="flex justify-between items-center px-6 py-4 bg-gray-800 text-white shadow-lg">
      <Link 
        className="text-xl font-bold hover:text-blue-400 transition-colors" 
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