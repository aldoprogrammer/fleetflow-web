export default function PortalTemplate({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="page-transition">{children}</div>;
}
