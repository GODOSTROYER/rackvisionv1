import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/enterprise/StatusBadge";

type Column = { key: string; label: string };

export function EnterpriseDataTable({
  columns,
  rows,
  statusKey,
}: {
  columns: Column[];
  rows: Record<string, string>[];
  statusKey?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-3 py-2">
        <div className="text-sm text-muted-foreground">Bulk actions</div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            Assign
          </Button>
          <Button size="sm" variant="outline">
            Export
          </Button>
        </div>
      </div>
      <Table>
        <TableHeader className="sticky top-10 z-10 bg-card">
          <TableRow>
            <TableHead className="w-10">
              <Checkbox aria-label="Select all" />
            </TableHead>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <Checkbox aria-label={`Select ${row.id}`} />
              </TableCell>
              {columns.map((column) => (
                <TableCell key={`${row.id}-${column.key}`}>
                  {statusKey && column.key === statusKey ? <StatusBadge status={row[column.key]} /> : row[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between border-t border-border px-3 py-2 text-sm text-muted-foreground">
        <span>Showing 1–{rows.length} of 42</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
