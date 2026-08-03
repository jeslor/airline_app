import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

const MAX_RESULTS = 50;

// Lazily loaded (not a top-level import) so the ~530KB airport dataset only
// downloads the first time a user actually opens this picker, not as part
// of the initial page bundle. Cached in module scope so re-opening the
// picker (or a second AirportCombobox on the same page, e.g. multi-city
// leg rows) doesn't refetch it.
let airportsPromise: Promise<Airport[]> | null = null;
function loadAirports(): Promise<Airport[]> {
  if (!airportsPromise) {
    airportsPromise = import("@/assets/airports.json").then(
      (mod) => (mod.default ?? mod) as unknown as Airport[],
    );
  }
  return airportsPromise;
}

function formatAirportLabel(airport: Airport) {
  return `${airport.city} (${airport.code})`;
}

function searchAirports(airports: Airport[], query: string): Airport[] {
  const q = query.trim().toLowerCase();
  if (!q) return airports.slice(0, MAX_RESULTS);

  const matches = airports.filter(
    (airport) =>
      airport.code.toLowerCase().includes(q) ||
      airport.city.toLowerCase().includes(q) ||
      airport.name.toLowerCase().includes(q) ||
      airport.country.toLowerCase().includes(q),
  );

  // Exact/prefix code matches (e.g. typing "lhr") float to the top ahead of
  // city/name/country substring matches.
  matches.sort((a, b) => {
    const aCode = a.code.toLowerCase();
    const bCode = b.code.toLowerCase();
    const rank = (code: string) => (code === q ? 0 : code.startsWith(q) ? 1 : 2);
    const diff = rank(aCode) - rank(bCode);
    return diff !== 0 ? diff : a.city.localeCompare(b.city);
  });

  return matches.slice(0, MAX_RESULTS);
}

export function AirportCombobox({
  value,
  onChange,
  placeholder = "Search airport or city...",
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [airports, setAirports] = useState<Airport[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open || airports) return;
    setIsLoading(true);
    loadAirports()
      .then(setAirports)
      .finally(() => setIsLoading(false));
  }, [open, airports]);

  const results = useMemo(
    () => (airports ? searchAirports(airports, query) : []),
    [airports, query],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
          )}
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        {/* shouldFilter=false: we do our own code/city/name/country search
            and cap results ourselves, rather than cmdk's built-in filter
            (which only matches against each item's `value`). */}
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Type a city or airport code..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {isLoading ? (
              <div className="text-muted-foreground flex items-center justify-center gap-2 py-6 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading airports...
              </div>
            ) : (
              <>
                <CommandEmpty>No airport found.</CommandEmpty>
                <CommandGroup>
                  {results.map((airport) => {
                    const label = formatAirportLabel(airport);
                    return (
                      <CommandItem
                        key={airport.code}
                        value={airport.code}
                        onSelect={() => {
                          onChange(label);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "h-4 w-4",
                            value === label ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <div className="flex flex-col">
                          <span>{label}</span>
                          <span className="text-muted-foreground text-xs">
                            {airport.name}, {airport.country}
                          </span>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default AirportCombobox;
