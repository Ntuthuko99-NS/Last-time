import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function FilterBar({ filters, setFilters, options }) {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search..."
          value={filters.search || ""}
          onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="pl-10"
        />
      </div>
      {options.map(opt => (
        <Select
          key={opt.key}
          value={filters[opt.key] || "all"}
          onValueChange={v => setFilters(prev => ({ ...prev, [opt.key]: v }))}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder={opt.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All {opt.label}</SelectItem>
            {opt.items.map(item => (
              <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  );
}
