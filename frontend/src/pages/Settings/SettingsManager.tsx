import { useFormik } from "formik";
import { Link } from "react-router-dom";

const LoginForm = () => {
  const { handleSubmit, handleChange, values } = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit: (values) => {
      console.log("values", values);
      // make registration post request here.
    },
  });
  return (
    <>
      <section className="mx-auto mt-12 w-full max-w-xs">
        <h2 className="blue_gradient mb-6 font-satoshi text-xl font-bold text-gray-600">
          Register
        </h2>
        <form
          onSubmit={handleSubmit}
          className="mb-4 rounded bg-white px-8 pb-8 pt-6 shadow-md"
        >
          <div className="mb-4">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-bold text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              onChange={handleChange}
              value={values.email}
              className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-bold text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              onChange={handleChange}
              value={values.password}
              className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
            />
          </div>

          <button className="black_btn ml-auto block" type="submit">
            Register
          </button>
        </form>
      </section>
      <p>
        Already have an account?{" "}
        <Link to="/login" className="font-bold hover:text-blue-600">
          {" "}
          Login here.
        </Link>
      </p>
    </>
  );
};

export default LoginForm;
