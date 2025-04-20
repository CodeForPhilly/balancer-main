// src/components/Layout/Layout.tsx
import React, { ReactNode } from "react";
import { connect } from "react-redux";
import { RootState } from "../../services/actions/types";
import Header from "./Layout_V2_Header";
import Sidebar from "./Layout_V2_Sidebar";

interface LayoutProps {
  children: ReactNode;
  isAuthenticated: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, isAuthenticated }) => {
  return (
    <div className="mx-auto flex w-full max-w-[100%] overflow-hidden">
      <Sidebar />

      <div className="flex flex-col h-screen w-full overflow-hidden">
        <Header isAuthenticated={isAuthenticated} />
        <div className="flex-grow overflow-hidden">{children}</div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps)(Layout);
