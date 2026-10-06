"use client";
// Adattatore minimo: i componenti nati con react-router usano `to`, Next usa `href`.
import NextLink from "next/link";
import { usePathname } from "next/navigation";

export const Link = ({ to, href, ...props }) => <NextLink href={to ?? href} {...props} />;

// NavLink con stato attivo, come in react-router (className/children possono essere funzioni).
export const NavLink = ({ to, end = false, className, children, ...props }) => {
  const pathname = usePathname() || "/";
  const isActive = end ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);
  return (
    <NextLink
      href={to}
      aria-current={isActive ? "page" : undefined}
      className={typeof className === "function" ? className({ isActive }) : className}
      {...props}
    >
      {typeof children === "function" ? children({ isActive }) : children}
    </NextLink>
  );
};
