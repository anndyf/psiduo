export default function PatientDetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-0 md:pb-0 overflow-x-hidden">
      {children}
    </div>
  );
}
