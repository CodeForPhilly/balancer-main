import { useFormik } from "formik";
import { Link } from "react-router-dom";

const LoginForm = () => {
  const { handleChange, handleSubmit, values } = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit: async (values) => {
      console.log("values", values);
      // make login post request here.
      await fetch("http://localhost:8000/accounts/csrf/")
    },
  });
  return (
    <>
      <section className="mt-12 mx-auto w-full max-w-xs">
        <h2 className="font-satoshi font-bold text-gray-600 text-xl blue_gradient mb-6">
          Login
        </h2>
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              onChange={handleChange}
              value={values.email}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              onChange={handleChange}
              value={values.password}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="flex items-center justify-between">
            <a
              className="inline-block align-baseline font-bold text-sm hover:text-blue-600"
              href="register">
              Forgot Password?
            </a>
            <button className="black_btn" type="submit">
              Sign In
            </button>
          </div>
        </form>
      </section>
      <p>
        Don't have an account?{" "}
        <Link to="/register" className="font-bold hover:text-blue-600">
          {" "}
          Register here
        </Link>
        .
      </p>
    </>
  );
};

export default LoginForm;
