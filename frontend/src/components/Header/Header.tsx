import {useState, useRef, useEffect, Fragment} from "react";
// import { useState, Fragment } from "react";
import accountLogo from "../../assets/account.svg";
import {Link, useNavigate, useLocation} from "react-router-dom";
import LoginMenuDropDown from "./LoginMenuDropDown";
import "../../components/Header/header.css";
import Chat from "./Chat";
import {FeatureMenuDropDown} from "./FeatureMenuDropDown";
import MdNavBar from "./MdNavBar";
import {connect, useDispatch} from "react-redux";
import {RootState} from "../../services/actions/types";
import {logout, AppDispatch} from "../../services/actions/auth";
import {HiChevronDown} from "react-icons/hi";
import {useGlobalContext} from "../../contexts/GlobalContext.tsx";

interface LoginFormProps {
    isAuthenticated: boolean;
    isSuperuser: boolean;
}

const Header: React.FC<LoginFormProps> = ({
                                              isAuthenticated,
                                              isSuperuser,
                                          }) => {
    const navigate = useNavigate();
    const [showFeaturesMenu, setShowFeaturesMenu] = useState(false);
    const dropdownRef = useRef(null);
    let delayTimeout: number | null = null;
    const [showChat, setShowChat] = useState(false);
    const [showLoginMenu, setShowLoginMenu] = useState(false);
    const [redirect, setRedirect] = useState(false);
    const {setShowSummary, setEnterNewPatient, triggerFormReset, setIsEditing} = useGlobalContext()

    const dispatch = useDispatch<AppDispatch>();

    const logout_user = () => {
        dispatch(logout());
        setRedirect(false);
    };

    const guestLinks = () => (
        <nav onClick={handleLoginMenu} className="flex cursor-pointer items-center">
            <img
                src={accountLogo}
                alt="logo"
                className="mr-5 h-5  object-contain lg:h-4 "
            />
            <span className=" text-black hover:border-b-2 hover:border-blue-600 hover:text-black hover:no-underline lg:text-sm xl:text-lg">
        Sign in
      </span>
        </nav>
    );

    const authLinks = () => (
        <nav onClick={logout_user} className="flex cursor-pointer items-center">
            <img src={accountLogo} alt="logo" className="mr-5 h-5  object-contain "/>
            <span className=" text-black hover:border-b-2 hover:border-blue-600 hover:text-black hover:no-underline lg:text-sm xl:text-lg">
        Sign out
      </span>
        </nav>
    );

    const handleLoginMenu = () => {
        setShowLoginMenu(!showLoginMenu);
    };

    const handleMouseEnter = () => {
        if (delayTimeout !== null) {
            clearTimeout(delayTimeout);
        }
        setShowFeaturesMenu(true);
    };

    const handleMouseLeave = () => {
        delayTimeout = setTimeout(() => {
            setShowFeaturesMenu(false);
        }, 300) as unknown as number; // Adjust the delay time as needed
    };

    useEffect(() => {
        return () => {
            if (delayTimeout !== null) {
                clearTimeout(delayTimeout);
            }
        };
    }, [delayTimeout]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [navigate]);


    const handleForm = () => {
        setIsEditing(false);
        triggerFormReset();
        setEnterNewPatient(true);
        setShowSummary(false);
        navigate("/");
    };

    const location = useLocation();
    const currentPath = location.pathname;

    return (
        <header className="z-50 fixed w-full items-center no-print">
            <div className="hidden w-full items-center justify-center border-b border-gray-300 bg-blue-100 p-1 text-center text-sm font-light text-gray-500 lg:flex">
                <p className="">
                    Welcome to Balancer’s first release! Found a bug or have feedback? Let us know {" "}
                  <Link
                      to="/feedback"
                      className="underline hover:border-blue-600 hover:text-blue-600 hover:no-underline"
                  >
                    here
                  </Link> {" "}
                  or email {" "}
                  <a
                    href="mailto:balancerteam@codeforphilly.org"
                    className="underline hover:border-blue-600 hover:text-blue-600 hover:no-underline"
                    target="_blank"
                  >
                    balancerteam@codeforphilly.org
                  </a>.
                </p>
            </div>
            <div className="flex items-center justify-center border-b border-gray-300 bg-blue-100 p-1 text-center text-sm font-light text-gray-500 lg:hidden ">
                App is in beta; Do not use info as medical advice.
            </div>
            <div
                className={
                    "  hidden h-20  w-full items-center justify-between border-b border-gray-300 bg-white px-96 md:px-20 lg:flex lg:px-10 xl:px-28"
                }
            >
                <Link to="/" onClick={() => handleForm()}>
          <span className="bg-gradient-to-r  from-blue-500 via-blue-700 to-blue-300 bg-clip-text font-quicksand text-xl font-bold text-transparent lg:text-2xl xl:text-5xl">
            Balancer
          </span>
                </Link>
                <nav className=" flex space-x-2 font-satoshi lg:space-x-3 xl:gap-3 xl:font-bold ">
                    <Link
                        to="/"
                        onClick={() => handleForm()}
                        className={currentPath === "/" ? "header-nav-item header-nav-item-selected" : "header-nav-item"}
                    >
                        Medication Suggester
                    </Link>
                    <>
                        <Link
                            to="/medications"
                            className={currentPath === "/medications" ? "header-nav-item header-nav-item-selected" : "header-nav-item"}
                        >
                            Medication List
                        </Link>
                        <Link
                            to="/about"
                            className={currentPath === "/about" ? "header-nav-item header-nav-item-selected" : "header-nav-item" }
                        >
                            About
                        </Link>
                        <Link
                            to="/help"
                            className={currentPath === "/help" ? "header-nav-item header-nav-item-selected" : "header-nav-item" }
                        >
                            Help
                        </Link>
                        <Link
                            to="/feedback"
                            className={currentPath === "/feedback" ? "header-nav-item header-nav-item-selected" : "header-nav-item" }
                        >
                            Leave Feedback
                        </Link>
                        <a href="https://www.flipcause.com/secure/cause_pdetails/MjMyMTIw"
                          target="_blank"
                          className="header-nav-item"
                        >
                          Donate
                        </a>
                        {isSuperuser && (
                            <div
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                                ref={dropdownRef}
                                className=""
                            >
                <span
                    className={`header-nav-item ${
                        showFeaturesMenu && "text-blue-600"
                    } ${
                        (currentPath === "/rulesmanager" || currentPath === "/ManageMeds") && "header-nav-item-selected"
                    }`
                  }
                >
                  Admin Portal
                  <span
                      className={` ${
                          showFeaturesMenu
                              ? "absolute ml-1.5 rotate-180 transition-transform duration-300"
                              : "absolute ml-1.5 "
                      }`}
                  >
                    <HiChevronDown className="inline-block"/>
                  </span>
                </span>
                                {showFeaturesMenu && <FeatureMenuDropDown/>}
                            </div>
                        )}

                        {redirect ? navigate("/") : <Fragment></Fragment>}
                    </>
                </nav>
                <LoginMenuDropDown
                    showLoginMenu={showLoginMenu}
                    handleLoginMenu={handleLoginMenu}
                />
                {isAuthenticated && (
                    <Chat showChat={showChat} setShowChat={setShowChat}/>
                )}
                {/* <Chat showChat={showChat} setShowChat={setShowChat} /> */}
                {isAuthenticated ? authLinks() : guestLinks()}
            </div>
            <MdNavBar handleForm={handleForm} isAuthenticated={isAuthenticated}/>
        </header>
    );
};

const mapStateToProps = (state: RootState) => ({
    isAuthenticated: state.auth.isAuthenticated,
    isSuperuser: state.auth.isSuperuser,
});

const ConnectedLayout = connect(mapStateToProps)(Header);
export default ConnectedLayout;