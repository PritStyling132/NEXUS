"use client";

import { Card, CardContent } from "@/components/ui/card";
import { NEXUS_CONSTANTS } from "@/constants";
import { useNavigation } from "@/hooks/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link"; // ✅ correct import for navigation links
import React from "react";

type Props = {
  orientation: "mobile" | "desktop";
};

const Menu: React.FC<Props> = ({ orientation }) => {
  const { section, onSetSection } = useNavigation(); // ✅ added onSetSection from hook

  switch (orientation) {
    case "desktop":
      return (
        <Card
          className="bg-themeGray border-themeGray bg-clip-padding backdrop-filter backdrop-blur-2xl bg-opacity-60 p-1 lg:flex hidden rounded-xl"
        >
          <CardContent className="p-0 flex gap-2">
            {NEXUS_CONSTANTS.landingPageMenu.map((menuItem) => (
              <Link
                href={menuItem.path}
                key={menuItem.id}
                onClick={() => onSetSection(menuItem.path)} // ✅ fixed click handler
                className={cn(
                  "rounded-xl flex gap-2 px-4 py-2 items-center transition-colors duration-200",
                  section === menuItem.path ? "bg-[#27272A]" : "hover:bg-zinc-800/30"
                )}
              >
                {section === menuItem.path && menuItem.icon}
                {menuItem.label}
              </Link>
            ))}
          </CardContent>
        </Card>
      );

    case "mobile":
      return <div>Menu (mobile version)</div>;

    default:
      return <></>;
  }
};

export default Menu;
