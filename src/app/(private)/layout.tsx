import '../../assets/styles/globals.css';

export default function PrivateNoSidebarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div>{children}</div>;
}
