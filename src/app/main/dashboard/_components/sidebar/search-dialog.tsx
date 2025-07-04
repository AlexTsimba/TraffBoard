"use client";
import { ChartPie, Grid2X2, ChartLine, ShoppingBag, Search, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

const searchItems = [
  { group: "Reports", icon: Home, label: "Overview", url: "/main/dashboard/overview" },
  { group: "Reports", icon: ChartPie, label: "Conversions", url: "/main/dashboard/conversions" },
  { group: "Reports", icon: Grid2X2, label: "Quality Breakdown", disabled: true, url: "/main/dashboard/traffic" },
  { group: "Reports", icon: ChartLine, label: "Cohorts", disabled: true, url: "/main/dashboard/cohorts" },
  { group: "Reports", icon: ShoppingBag, label: "Landings", disabled: true, url: "/main/dashboard/landings" },
  { group: "Authentication", label: "Login v1", url: "/main/dashboard/auth/v1/login" },
  { group: "Authentication", label: "Register v1", url: "/main/dashboard/auth/v1/register" },
];

export function SearchDialog() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  return (
    <>
      <button
        className="text-muted-foreground flex cursor-pointer items-center gap-2 text-sm"
        type="button"
        onClick={() => {
          setOpen(true);
        }}
      >
        <Search className="size-4" />
        Search
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search dashboards, users, and more…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {[...new Set(searchItems.map((item) => item.group))].map((group, i) => (
            <React.Fragment key={group}>
              {i !== 0 && <CommandSeparator />}
              <CommandGroup key={group} heading={group}>
                {searchItems
                  .filter((item) => item.group === group)
                  .map((item) => (
                    <CommandItem
                      key={item.label}
                      className="!py-1.5"
                      disabled={item.disabled}
                      onSelect={() => {
                        setOpen(false);
                        if (item.url && !item.disabled) {
                          router.push(item.url);
                        }
                      }}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.label}</span>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </React.Fragment>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
