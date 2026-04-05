export function QrCodeImage({
  employeeID,
  className = "h-40 w-40 rounded-2xl border border-slate-200 bg-white p-3",
}: {
  employeeID: string;
  className?: string;
}) {
  return (
    <img
      src={`/api/employees/${employeeID}/qr`}
      alt={`QR code for ${employeeID}`}
      className={className}
    />
  );
}
