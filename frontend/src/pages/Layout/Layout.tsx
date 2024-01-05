// Layout.tsx
import { ReactNode } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { connect } from "react-redux";
import { useAuth } from "./authHooks";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps): JSX.Element => {
  useAuth();
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
};

const ConnectedLayout = connect(null)(Layout);
export default ConnectedLayout;
