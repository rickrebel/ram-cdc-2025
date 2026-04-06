import { Link, NavLink, useLoaderData, Form } from "@remix-run/react";

import ArrowRightStartOnRectangleIcon from "~/icons/arrow_right";
import Bars3Icon from "~/icons/bars3";

import logo from "~/images/Logos/salud.webp";
import { loader } from "~/routes/_app";

import { AppProps } from "~/utilities/types";

interface MainNavigationProps {
  flushState: AppProps["flushState"];
}

const navigation = [
  { name: "Inicio", href: "/" },
  { name: "Sobre Nosotros", href: "/about" },
  { name: "Añadir Nuevo Registro", href: "/add/characteristics" },
  { name: "InDRE", href: "/indre" },
  { name: "Analizar Resultados", href: "/analyse" },
  { name: "Capacitación", href: "/training" },
];

export default function MainNavigation({ flushState }: MainNavigationProps) {

  // On first visit, 'profileId' will be undefined. Otherwise it will be a string.
  const profileId: string | null = useLoaderData<typeof loader>();

  return (
    <div className="navbar bg-primary text-primary-content h-32 py-6 border-b-4 border-accent">
      {/* NAVBAR START */}
      <div className="navbar-start">
        <Link to="/" className="btn btn-ghost normal-case text-xl">
          <img className="h-12 w-auto" src={logo} alt="" />
        </Link>

        <div className="dropdown">
          <button tabIndex={0} className="btn btn-ghost lg:hidden">
            <Bars3Icon
              className="h-6 w-6 text-primary-content"
              aria-hidden="true"
            />
          </button>
          <menu className="menu menu-sm dropdown-content mt-3 p-1 shadow bg-primary rounded-box w-56 z-50">
            {profileId &&
              navigation.map((item) => (
                <li
                  key={item.name}
                  className="my-1 px-1 btn btn-ghost normal-case text-sm content-center"
                >
                  <NavLink to={item.href}>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        if (item.name === "Añadir Nuevo Registro") {
                          flushState();
                        }
                      }}
                    >
                      {item.name}
                    </button>
                  </NavLink>
                </li>
              ))}
          </menu>
        </div>
      </div>

      {/* NAVBAR CENTER */}
      <div className="navbar-center hidden lg:flex">
        <menu className="menu menu-horizontal px-1">
          {profileId &&
            navigation.map((item) => (
              <li key={item.name} className="mx-4">
                <NavLink
                  className="btn btn-sm btn-ghost normal-case content-center rounded-md"
                  to={item.href}
                >
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      if (item.name === "Añadir Nuevo Registro") {
                        flushState();
                      }
                    }}
                  >
                    {item.name}
                  </button>
                </NavLink>
              </li>
            ))}
        </menu>
      </div>

      {/* NAVBAR END */}
      <div className="navbar-end">
        {profileId && (
          <Form method="POST" action="/logout">
            <button className="btn btn-ghost normal-case text-primary-content">
              Salir
              <ArrowRightStartOnRectangleIcon
                className="h-6"
                aria-label="Logout"
              />
            </button>
          </Form>
        )}
      </div>
    </div>
  );
}
