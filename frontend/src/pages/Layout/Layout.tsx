import { ReactNode } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

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
        <Footer />
      </div>
    </main>
  );
}

export default Layout;
