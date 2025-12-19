// Layout.tsx
import {ReactNode} from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import {connect} from "react-redux";
import {useAuth} from "./authHooks.ts";
import {RootState} from "../../services/actions/types";

interface LayoutProps {
    children: ReactNode;
}

interface LoginFormProps {
    isAuthenticated: boolean | null;
}

export const Layout = ({
    children
}: LayoutProps & LoginFormProps): JSX.Element => {
    useAuth();
    return (
        <main>
            <div className="main">
                <div className="gradient"/>
            </div>
            <div className="relative z-10 mx-auto flex w-full flex-col items-center">
                <Header/>
                {children}
                <Footer/>
            </div>
        </main>
    );
};

const mapStateToProps = (state: RootState) => ({
    isAuthenticated: state.auth.isAuthenticated,
});

const ConnectedLayout = connect(mapStateToProps)(Layout);
export default ConnectedLayout;
