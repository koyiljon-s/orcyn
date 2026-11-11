"use client";

import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { IconCommand, IconSearch } from "@tabler/icons-react";
import { cn } from "cn";

function SearchBar({
  className,
  ...props
}: React.ComponentProps<"input">) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      data-slot="search-bar"
      className={cn(
        "group/search-bar relative flex h-8 w-full min-w-0 items-center rounded-full bg-[#f7f7f7] transition-colors outline-none focus-within:ring-1 focus-within:ring-ring/50 disabled:opacity-50 ",
        className,
      )}
    >
      <IconSearch
        stroke={1.75}
        className="pointer-events-none absolute left-2.5 size-4 shrink-0 text-muted-[#3e4045] transition-colors group-focus-within/search-bar:text-[#3e4045]"
      />
      <InputPrimitive
        ref={inputRef}
        type="search"
        data-slot="search-bar-input"
        className="h-full w-full min-w-0 bg-transparent pl-8 pr-14 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
      />
      <IconCommand
        stroke={1.75}
        className="pointer-events-none absolute right-8 size-4 shrink-0 text-[#717378]"
      />
      <kbd className="pointer-events-none absolute right-4 flex h-5 min-w-5 items-center justify-center px-2 font-sans text-sm font-medium text-[#717378] select-none">
        K
      </kbd>
    </div>
  );
}

export { SearchBar };
