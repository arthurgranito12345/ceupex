import { Menu } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { Link } from "react-router-dom";
import logo from '../../../public/logo.png'

const Nav = () => {
  return (
    <>
      <nav className="flex items-center justify-between p-4">
        <Link to="/">
          <div className="flex items-center justify-center gap-3">
            <img src={logo} alt="Logo CEUPEX" className="w-10"/>
            <h1 className="text-2xl font-semibold text-amber-800">CEUPEX</h1>
          </div>
        </Link>
        <div className="lg:hidden">
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline">
                <Menu />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>CEUPEX</DrawerTitle>
                <DrawerDescription>Balanço Financeiro CEUPEX</DrawerDescription>
              </DrawerHeader>
              <div className="p-4 flex flex-col gap-3">
                <DrawerClose asChild>
                  <Link to="/" className="w-full">
                    <Button variant="outline" className="w-full">
                      Relatório Visual
                    </Button>
                  </Link>
                </DrawerClose>
                <DrawerClose asChild>
                  <Link to="/despesas" className="w-full">
                    <Button variant="outline" className="w-full">
                      Despesas
                    </Button>
                  </Link>
                </DrawerClose>
                <DrawerClose asChild>
                  <Link to="/receitas" className="w-full">
                    <Button variant="outline" className="w-full">
                      Receitas
                    </Button>
                  </Link>
                </DrawerClose>
                <DrawerClose asChild>
                  <Link to="/mediuns" className="w-full">
                    <Button variant="outline" className="w-full">
                      Médiuns
                    </Button>
                  </Link>
                </DrawerClose>
              </div>
            </DrawerContent>
          </Drawer>
        </div>

        <div className="hidden lg:flex">
          <ul className="flex gap-4 nav-ul">
            <Link to="/">
              <li>Relatório Visual</li>
            </Link>
            <Link to="/despesas">
              <li>Despesas</li>
            </Link>
            <Link to="/receitas">
              <li>Receitas</li>
            </Link>
            <Link to="/mediuns">
              <li>Médiuns</li>
            </Link>
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Nav;
