import {useState} from "react";
import {Link} from "react-router-dom";
// import { useLocation } from "react-router-dom";
import Chat from "./Chat";
// import logo from "../../assets/balancer.png";
import closeLogo from "../../assets/close.svg";
import hamburgerLogo from "../../assets/hamburger.svg";

interface LoginFormProps {
    isAuthenticated: boolean;
    handleForm: () => void;
}

const MdNavBar = (props: LoginFormProps) => {
    const [nav, setNav] = useState(true);
    // const { pathname } = useLocation();
    const [showChat, setShowChat] = useState(false);
    const {isAuthenticated, handleForm} = props;
    const handleNav = () => {
        setNav(!nav);
    };

    return (
        <div
            className={
                "mx-auto flex items-center justify-between border-b border-gray-300 bg-white p-2 px-5 md:h-20 lg:hidden"
            }
        >
            <nav className="flex w-full ">
                {/* <Link to="/">
          <img src={logo} alt="logo" className="mr-16 w-28 object-contain " />
        </Link> */}
                <Link to="/">
          <span
              className="bg-gradient-to-r  from-blue-500 via-blue-700 to-blue-300 bg-clip-text font-quicksand text-2xl font-bold text-transparent md:text-3xl "
              onClick={handleForm}>
            Balancer
          </span>
                </Link>
            </nav>
            <div onClick={handleNav} className="">
                {nav && (
                    <img
                        src={hamburgerLogo}
                        alt="logo"
                        className="h-8 w-7 md:h-8 md:w-7"
                    />
                )}
            </div>
            <div
                className={
                    !nav
                        ? "fixed left-0 top-0 h-full w-[100%] border-r border-r-gray-900 bg-white duration-500 ease-in-out"
                        : "ease-out-in fixed left-[-100%] duration-1000"
                }
            >
                <div className="flex items-center justify-between p-5">
          <span className="bg-gradient-to-r  from-blue-500 via-blue-700 to-blue-300 bg-clip-text font-quicksand text-3xl font-bold text-transparent md:text-3xl lg:text-3xl ">
            Balancer
          </span>

                    <div onClick={handleNav} className="">
                        {!nav && (
                            <img
                                src={closeLogo}
                                alt="logo"
                                className="h-8 w-7 md:h-8 md:w-7"
                            />
                        )}
                    </div>
                </div>

                <ul className="mt-10 font-satoshi uppercase">
                    <li className="border-b border-gray-300 p-4">
                        <Link
                            to="/about"
                            className="mr-9 text-black hover:border-b-2 hover:border-blue-600 hover:text-black hover:no-underline"
                        >
                            About Balancer
                        </Link>
                    </li>
                    <li className="border-b border-gray-300 p-4">
                        <Link
                            to="/help"
                            className="mr-9 text-black hover:border-b-2 hover:border-blue-600 hover:text-black hover:no-underline"
                        >
                            Help
                        </Link>
                    </li>
                    <li className="border-b border-gray-300 p-4">
                        <Link
                            to="/login"
                            className="mr-9 text-black hover:border-b-2 hover:border-blue-600 hover:text-black hover:no-underline"
                        >
                            Medical Suggester
                        </Link>
                    </li>
                    <li className="border-b border-gray-300 p-4">
                        <Link
                            to="/medications"
                            className="mr-9 text-black hover:border-b-2 hover:border-blue-600 hover:text-black hover:no-underline"
                        >
                            Medications List
                        </Link>
                    </li>
                    <li className="border-b border-gray-300 p-4">
                        <Link
                            to="/drugSummary"
                            className="mr-9 text-black hover:border-b-2 hover:border-blue-600 hover:text-black hover:no-underline"
                        >
                            Chat
                        </Link>
                    </li>
                    <li className="border-b border-gray-300 p-4">
                        <Link
                            to="/feedback"
                            className="mr-9 text-black hover:border-b-2 hover:border-blue-600 hover:text-black hover:no-underline"
                        >
                            Leave Feedback
                        </Link>
                    </li>
                    <li className="border-b border-gray-300 p-4">
                        <a href="https://www.flipcause.com/secure/cause_pdetails/MjMyMTIw"
                          target="_blank"
                          className="mr-9 text-black hover:border-b-2 hover:border-blue-600 hover:text-black hover:no-underline"
                        >
                          Donate
                        </a>
                    </li>
                    {isAuthenticated &&
                      <li className="border-b border-gray-300 p-4">
                        <Link
                              to="/logout"
                              className="mr-9 text-black hover:border-b-2 hover:border-blue-600 hover:text-black hover:no-underline"
                          >Sign Out
                        </Link>
                      </li>
                    }
                </ul>
            </div>
            <Chat showChat={showChat} setShowChat={setShowChat}/>
        </div>
    );
};

export default MdNavBar;
