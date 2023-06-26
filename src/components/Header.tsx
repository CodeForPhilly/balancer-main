import logo from "../assets/balancer.png";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

const Header = () => {
  const { pathname } = useLocation();

  return (
    <header className="w-full flex justify-center items-center flex-col">
      <nav className="flex justify-between items-center w-full pt-3">
        <Link to="/">
          <img src={logo} alt="logo" className="w-28 object-contain" />
        </Link>
        {pathname === "/" && (
          <>
            <Link to="/login" className="hover:text-blue-600 font-bold">
              Login
            </Link>
            <Link to="/register" className="hover:text-blue-600 font-bold">
              Register
            </Link>
          </>
        )}
        <a
          href="https://codeforphilly.org/"
          target="_blank"
          className="black_btn">
          Code for Philly
        </a>
      </nav>

      <h1 className="head_text">
        {/* AI-powered Bipolar Medication: <br className="max-md:hidden" /> */}
        <span className="orange_gradient">Balancer</span>
      </h1>
      <h2 className="desc">
        Balancer is an innovative AI-powered web application designed to assist
        psychiatrists in selecting the most appropriate bipolar medication for
        first-time patients. It is open-source and free to use
      </h2>
    </header>
  );
};

export default Header;
