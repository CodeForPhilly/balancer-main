import { ReactNode } from "react";
import Header from "../../components/Header/Header";

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <main>
      <div className="main">
        <div className="gradient" />
      </div>
      <div className="container">
        <Header />
        {children}
      </div>
    </main>
  );
}

export default Layout;
