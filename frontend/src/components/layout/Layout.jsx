import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppButton from "../ui/WhatsAppButton";
import CartDrawer from "../ui/CartDrawer";
import useCartDrawerStore from "../../store/cartDrawerStore";

export default function Layout() {
  const { isOpen, close } = useCartDrawerStore();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-[52px]"><Outlet /></main>
      <Footer />
      <WhatsAppButton />
      <CartDrawer open={isOpen} onClose={close} />
    </div>
  );
}
