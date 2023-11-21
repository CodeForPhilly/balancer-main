import { useFormik } from "formik";
import { Link } from "react-router-dom";
import axios from "axios";

const LoginForm = () => {
  const { handleSubmit, handleChange, values } = useFormik({
    initialValues: {
      email: "",
      password1: "",
      password2: "",
    },
    onSubmit: async (values) => {
      try {
        const csrfTokenResponse = await fetch('http://localhost:8000/auth/csrf/', {
          method: 'GET',
          credentials: 'include',
        });

        if (!csrfTokenResponse.ok) {
          throw new Error('Failed to get CSRF token.');
        }

        const data = await csrfTokenResponse.json();
        const csrfToken = data.csrfToken;
        console.log(csrfToken);

        let body = new FormData();
        body.append("email", values.email);
        body.append("password1", values.password1);
        body.append("password2", values.password2);

        await axios({
          method: "post",
          url: "http://localhost:8000/accounts/signup/",
          data: body,
          headers: {
            "Content-Type": "multipart/form-data",
            "X-CSRFToken": csrfToken,
          },
        });
        
        // Additional logic after successful submission if needed

      } catch (error) {
        console.error('Error submitting form:', error);
      }
    },
  });
  
  return (
    <>
      <section className="mt-12 mx-auto w-full max-w-xs">
        <h2 className="font-satoshi font-bold text-gray-600 text-xl blue_gradient mb-6">
          Register
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
              htmlFor="password1"
              className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              id="password1"
              name="password1"
              type="password"
              onChange={handleChange}
              value={values.password1}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <label
              htmlFor="password2"
              className="block text-gray-700 text-sm font-bold mb-2">
              Verify Password
            </label>
            <input
              id="password2"
              name="password2"
              type="password"
              onChange={handleChange}
              value={values.password2}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
