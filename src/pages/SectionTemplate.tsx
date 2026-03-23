import { ActionButtonGroup } from "@/components/enterprise/ActionButtonGroup";
import { EnterpriseDataTable } from "@/components/enterprise/EnterpriseDataTable";
import { FilterBar } from "@/components/enterprise/FilterBar";
import { PageHeader } from "@/components/enterprise/PageHeader";
import { WidgetCard } from "@/components/enterprise/WidgetCard";

type TemplateProps = {
  title: string;
  subtitle: string;
  filters: string[];
  actions: string[];
  highlights: string[];
  columns: { key: string; label: string }[];
  rows: Record<string, string>[];
  statusKey?: string;
};

export default function SectionTemplate({
  title,
  subtitle,
  filters,
  actions,
  highlights,
  columns,
  rows,
  statusKey,
}: TemplateProps) {
  return (
    <section className="space-y-4">
      <PageHeader title={title} subtitle={subtitle} actions={<ActionButtonGroup actions={actions} />} />
      <FilterBar filters={filters} />
      <div className="grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <WidgetCard key={item} title={item}>
            <p className="text-sm text-muted-foreground">Visual placeholder panel for {item.toLowerCase()}.</p>
          </WidgetCard>
        ))}
      </div>
      <EnterpriseDataTable columns={columns} rows={rows} statusKey={statusKey} />
    </section>
  );
}
