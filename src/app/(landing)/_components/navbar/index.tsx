"use client";

import GlassSheet from "@/components/global/glass-sheet";
import { Button } from "@/components/ui/button";
import { LogOut, MenuIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Menu from "./menu";

type Props = {};

const LandingPageNavbar: React.FC<Props> = () => {
  return (
    <div className="w-full flex justify-between items-center py-5 px-6 sticky top-0 z-50 bg-black/30 backdrop-blur-lg border-b border-themeGray">
      {/* Left Logo or Title */}
      <Image
          src="/assets/nexus-logo.png"
          alt="Nexus Logo"
          width={190}
          height={80}
          className="object-contain"
        />

      {/* Center Title */}
      {/* <p className="font-bold text-2xl text-white">HI PRITAM</p> */}

      {/* Desktop Menu */}
      <div className="hidden lg:flex">
        <Menu orientation="desktop" />
      </div>

      {/* Right Controls (Login + Mobile Menu) */}
      <div className="flex gap-2 items-center">
        <Link href="/sign-in">
          <Button
            variant="outline"
            className="bg-themeBlack text-white rounded-2xl flex gap-2 border-themeGray hover:bg-themeGray"
          >
            <LogOut size={18} />
            Login
          </Button>
        </Link>

        {/* Mobile Menu Sheet */}
        <GlassSheet
          triggerClass="lg:hidden"
          trigger={
            <Button variant="ghost" className="hover:bg-transparent">
              <MenuIcon size={30} />
            </Button>
          }
        >
          {/* You can render mobile <Menu orientation="mobile" /> here */}
          <div className="p-4">
            <Menu orientation="mobile" />
          </div>
        </GlassSheet>
      </div>
    </div>
  );
};

export default LandingPageNavbar;
