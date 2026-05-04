import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function EmptyState({ icon: Icon, title, description, actionLabel, actionLink }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-muted-foreground" />
        </div>
      )}
      <h3 className="font-heading font-semibold text-lg mb-1">{title}</h3>
      {description && <p className="text-muted-foreground text-sm max-w-sm">{description}</p>}
      {actionLabel && actionLink && (
        <Link to={actionLink} className="mt-4">
          <Button className="bg-primary hover:bg-primary/90">{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}
