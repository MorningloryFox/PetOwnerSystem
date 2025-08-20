import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ResponsiveTableProps {
  children: ReactNode;
  className?: string;
}

interface ResponsiveTableRowProps {
  children: ReactNode;
  mobileCard?: ReactNode;
  className?: string;
}

export function ResponsiveTable({ children, className }: ResponsiveTableProps) {
  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block">
        <Table className={className}>
          {children}
        </Table>
      </div>
    </>
  );
}

export function ResponsiveTableRow({ children, mobileCard, className }: ResponsiveTableRowProps) {
  return (
    <>
      {/* Desktop Row */}
      <TableRow className={`hidden md:table-row ${className}`}>
        {children}
      </TableRow>
      
      {/* Mobile Card */}
      {mobileCard && (
        <div className="md:hidden mb-4">
          {mobileCard}
        </div>
      )}
    </>
  );
}

export function MobileCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Card className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <CardContent className="p-4">
        {children}
      </CardContent>
    </Card>
  );
}

// Re-export table components for convenience
export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow };
