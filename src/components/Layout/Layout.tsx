import { ReactNode } from "react";
import Header from "../Header";

interface LayoutProps {
  children?: ReactNode;
  // any props that come into the component
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
