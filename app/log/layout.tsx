export default function DaybookLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col">
      {children}
    </div>
  );
}
