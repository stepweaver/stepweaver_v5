export default function DaybookLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col w-full min-w-0 overflow-x-hidden">
      {children}
    </div>
  );
}
