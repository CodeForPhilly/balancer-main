import { useFormik } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signup, AppDispatch } from "../../services/actions/auth";
import { RootState } from "../../services/actions/types";
import { useState } from "react";
import axios from "axios";
import { AUTH_ENDPOINTS } from "../../api/endpoints";

const validationSchema = Yup.object({
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
  email: Yup.string().email("Enter a valid email").required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  re_password: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

const RegistrationForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const signupError = useSelector((state: RootState) => state.auth.error);
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [resendStatus, setResendStatus] = useState<"idle" | "sent" | "error">("idle");

  const { handleSubmit, handleChange, handleBlur, values, errors, touched, isSubmitting } =
    useFormik({
      initialValues: {
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        re_password: "",
      },
      validationSchema,
      onSubmit: async (values, { setSubmitting }) => {
        try {
          await dispatch(signup(values.first_name, values.last_name, values.email, values.password, values.re_password));
          setSubmittedEmail(values.email);
          setSubmitted(true);
        } catch {
          // error is stored in Redux state and displayed via signupError
        } finally {
          setSubmitting(false);
        }
      },
    });

  const handleResend = async () => {
    try {
      await axios.post(AUTH_ENDPOINTS.USERS_RESEND_ACTIVATION, { email: submittedEmail });
      setResendStatus("sent");
    } catch {
      setResendStatus("error");
    }
  };

  if (submitted) {
    return (
      <section className="mx-auto mt-24 w-[20rem] md:mt-48 md:w-[32rem]">
        <div className="mb-4 rounded-md bg-white px-3 pb-12 pt-6 shadow-md ring-1 md:px-12 text-center">
          <h2 className="blue_gradient mb-4 font-satoshi text-3xl font-bold text-gray-600">
            Check your email
          </h2>
          <p className="text-gray-600 mb-6">
            We sent an activation link to <strong>{submittedEmail}</strong>. Click the link to activate your account.
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/login" className="btnBlue w-full text-lg text-center">
              Go to log in
            </Link>
            <button onClick={handleResend} className="text-sm text-blue-600 hover:underline" type="button">
              {resendStatus === "sent"
                ? "Email resent!"
                : resendStatus === "error"
                ? "Failed to resend. Try again."
                : "Resend email"}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto mt-24 w-[20rem] md:mt-48 md:w-[32rem]">
      <form
        onSubmit={handleSubmit}
        className="mb-4 rounded-md bg-white px-3 pb-12 pt-6 shadow-md ring-1 md:px-12"
      >
        <h2 className="blue_gradient mb-6 font-satoshi text-3xl font-bold text-gray-600 text-center">
          Create account
        </h2>

        {signupError && (
          <p className="text-red-500 text-sm mb-4">{signupError}</p>
        )}

        <div className="mb-4">
          <label htmlFor="first_name" className="mb-2 block text-lg font-bold text-gray-700">
            First name
          </label>
          <input
            id="first_name"
            name="first_name"
            type="text"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.first_name}
            className="focus:shadow-outline w-full appearance-none rounded border px-3 py-3 leading-tight text-gray-700 shadow focus:outline-none"
          />
          {touched.first_name && errors.first_name && (
            <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="last_name" className="mb-2 block text-lg font-bold text-gray-700">
            Last name
          </label>
          <input
            id="last_name"
            name="last_name"
            type="text"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.last_name}
            className="focus:shadow-outline w-full appearance-none rounded border px-3 py-3 leading-tight text-gray-700 shadow focus:outline-none"
          />
          {touched.last_name && errors.last_name && (
            <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="mb-2 block text-lg font-bold text-gray-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.email}
            className="focus:shadow-outline w-full appearance-none rounded border px-3 py-3 leading-tight text-gray-700 shadow focus:outline-none"
          />
          {touched.email && errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="mb-2 block text-lg font-bold text-gray-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.password}
            className="focus:shadow-outline w-full appearance-none rounded border px-3 py-3 leading-tight text-gray-700 shadow focus:outline-none"
          />
          {touched.password && errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="re_password" className="mb-2 block text-lg font-bold text-gray-700">
            Confirm password
          </label>
          <input
            id="re_password"
            name="re_password"
            type="password"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.re_password}
            className="focus:shadow-outline w-full appearance-none rounded border px-3 py-3 leading-tight text-gray-700 shadow focus:outline-none"
          />
          {touched.re_password && errors.re_password && (
            <p className="text-red-500 text-sm mt-1">{errors.re_password}</p>
          )}
        </div>

        <button
          className="btnBlue w-full text-lg"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="text-center">
        Already have an account?{" "}
        <Link to="/login" className="font-bold hover:text-blue-600">
          Log in
        </Link>
      </p>
    </section>
  );
};

export default RegistrationForm;
