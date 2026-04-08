import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { verify, AppDispatch } from "../../services/actions/auth";
import Layout from "../Layout/Layout";
import Spinner from "../../components/LoadingSpinner/LoadingSpinner";

const Activate = () => {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!uid || !token) {
      setStatus("error");
      return;
    }

    (async () => {
      try {
        await dispatch(verify(uid, token));
        setStatus("success");
      } catch {
        setStatus("error");
      }
    })();
  }, [dispatch, uid, token]);

  if (status === "loading") {
    return (
      <Layout>
        <Spinner />
      </Layout>
    );
  }

  if (status === "error") {
    return (
      <Layout>
        <section className="mx-auto mt-24 w-[20rem] md:mt-48 md:w-[32rem] text-center">
          <div className="mb-4 rounded-md bg-white px-3 pb-12 pt-6 shadow-md ring-1 md:px-12">
            <h2 className="blue_gradient mb-4 font-satoshi text-3xl font-bold text-gray-600">
              Activation failed
            </h2>
            <p className="text-gray-600 mb-6">
              This activation link is invalid or has already been used. Please register again or request a new activation email.
            </p>
            <Link to="/register" className="btnBlue w-full text-lg text-center block">
              Back to register
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="mx-auto mt-24 w-[20rem] md:mt-48 md:w-[32rem] text-center">
        <div className="mb-4 rounded-md bg-white px-3 pb-12 pt-6 shadow-md ring-1 md:px-12">
          <h2 className="blue_gradient mb-4 font-satoshi text-3xl font-bold text-gray-600">
            Email verified
          </h2>
          <p className="text-gray-600 mb-6">
            Your account has been activated. You can now log in.
          </p>
          <Link to="/login" className="btnBlue w-full text-lg text-center block">
            Continue to log in
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Activate;
