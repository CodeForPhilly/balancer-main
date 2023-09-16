import { useState } from "react";
import { useFormik } from 'formik';
import { useMutation } from "react-query";
import { object, string, mixed } from 'yup';
import axios, { AxiosError } from 'axios';

interface FormValues {
    name: string;
    email: string;
    message: string;
  }

const feedbackValidation = object().shape({
    name: string().required('Name is a required field'),
    email: string().email('You have entered an invalid email').required('Email is a required field'),
    message: string().required('Message is a required field'),
});

const FeedbackForm = () => {
    const [feedback, setFeedback] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const { isLoading, mutate } = useMutation(
        async ({ string }: FormValues) => {
            const formData = new FormData();

            try {
                const res = await axios.post(
                    "http://localhost:3001/text_extraction",
                    formData,
                    {
                        headers: {
                        },
                    }
                );
                return res;
            } catch (e: unknown) {
                console.error(e);
                const defaultErrorMessage =
                    "Something went wrong. Please try again later.";
            }
        }
    );


  const {
    errors,
    handleChange,
    handleSubmit,
    resetForm,
    touched,
    values,
  } = useFormik<FormValues>({
    initialValues: {
        name: '',
        email: '',
        message: '',
    },
    onSubmit: (values) => {
        setFeedback("");
        mutate(values, {
            onSuccess: (response) => {
              const message =
                response?.data?.message?.choices?.[0]?.message?.content;
              if (message) {
                setFeedback(message);
              }
            },
            onError: () => {
              setErrorMessage("An error occured while submitting the form");
            },
            onSettled: () => {
              resetForm();
            },
        });
    },
    validationSchema: feedbackValidation,
  });

  return (
    <>
        <section className="mx-auto mt-12 w-full max-w-xs">
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label 
                        htmlFor="name"
                        className="mb-2 block text-sm font-bold text-gray-700"
                    >
                        Name
                    </label>
                    <input
                    type="text"
                    id="name"
                    name="name"
                    onChange={handleChange}
                    value={values.name}
                    className={` focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none disabled:bg-gray-200`}
                    />
                    <div className="form-error-container">
                        {touched.name && errors.name && (
                            <p className="text-sm text-red-500">{errors.name}</p>
                        )}
                    </div>
                </div>
                <div className="mb-4">
                    <label 
                        htmlFor="email"
                        className="mb-2 block text-sm font-bold text-gray-700"
                    >
                        Email
                    </label>
                    <input
                    type="text"
                    id="email"
                    name="email"
                    onChange={handleChange}
                    value={values.email}
                    className={` focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none disabled:bg-gray-200`}
                    />
                    <div className="form-error-container">
                        {touched.email && errors.email && (
                            <p className="text-sm text-red-500">{errors.email}</p>
                        )}
                    </div>
                </div>
                <div className="mb-4">
                    <label 
                        htmlFor="message"
                        className="mb-2 block text-sm font-bold text-gray-700"
                    >
                        Message
                    </label>
                    <textarea
                    id="message"
                    name="message"
                    onChange={handleChange}
                    value={values.message}
                    rows={8} 
                    className={` focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none disabled:bg-gray-200`}
                    />
                    <div className="form-error-container">
                        {touched.message && errors.message && (
                            <p className="text-sm text-red-500">{errors.message}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center justify-end">
                    <button
                    className="black_btn disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-600"
                    type="submit"
                    disabled={ isLoading }
                    >
                    Submit
                    </button>
                </div>
            </form>
        </section>
    </>
  );
};

export default FeedbackForm;
