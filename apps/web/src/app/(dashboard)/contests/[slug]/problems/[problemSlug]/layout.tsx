export default function ProblemSolverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="-m-4 flex h-[calc(100vh-4rem)] min-h-0 flex-col overflow-hidden lg:-m-6">
      {children}
    </div>
  );
}
