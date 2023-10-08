import { useState } from "react";
import { useFormik } from "formik";
import { useMutation } from "react-query";
import { object, string } from "yup";
import axios from "axios";

interface FormValues {
  name: string;
  email: string;
  message: string;
  image: string,
}

const feedbackValidation = object().shape({
  name: string().required("Name is a required field"),
  email: string()
    .email("You have entered an invalid email")
    .required("Email is a required field"),
  message: string().required("Message is a required field"),
});

const handleCancel =() => {
  //handle logic for cancelling form
}

const FeedbackForm = () => {
  // const [feedback, setFeedback] = useState("");
  // const [errorMessage, setErrorMessage] = useState("");
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseDown = () => {
    setIsPressed(true);
  };
  
  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const { isLoading, mutate } = useMutation(async (values: FormValues) => {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("email", values.email);
    formData.append("message", values.message);


    try {
      const res = await axios.post(
        "http://localhost:3001/text_extraction",
        formData,
        {
          headers: {},
        }
      );
      return res;
    } catch (e: unknown) {
      console.error(e);
      // const defaultErrorMessage =
      //     "Something went wrong. Please try again later.";
    }
  });

  const { errors, handleChange, handleSubmit, resetForm, touched, values } =
    useFormik<FormValues>({
      initialValues: {
        name: "",
        email: "",
        message: "",
        image: "",
      },
      onSubmit: (values) => {
        // setFeedback("");
        mutate(values, {
          onSuccess: (response) => {
            const message =
              response?.data?.message?.choices?.[0]?.message?.content;
            if (message) {
              //   setFeedback(message);
            }
          },
          onError: () => {
            // setErrorMessage("An error occured while submitting the form");
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
    <div className="flex w-[100%] justify-between">
      <h2 className="header_logo cursor-pointer font-satoshi text-xl font-bold text-gray-600  hover:text-blue-600 ">
        Leave Us Feedback!
      </h2>
    </div>
      <section className="mx-auto w-full">
        <form onSubmit={handleSubmit} className="mt-2">
          <div className="summary_box font_body">
          <fieldset className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="flex text-sm font-semibold leading-6 text-gray-900">Feedback Type:</dt>
            <dd className="mt-2 pl-24 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              <div className="flex items-center gap-x-3 pr-16">
                <input id="feature-request" name="feedback-type" type="radio" className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600" value="Yes" />
                <label className="block text-sm font-medium leading-6 text-gray-900" htmlFor="psychotic-yes">
                  Feature Request
                </label>
                <input id="bug" name="feedback-type" type="radio" className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600" value="No" />
                <label className="block text-sm font-medium leading-6 text-gray-900" htmlFor="psychotic-no">
                  Bug
                </label>
                <input id="general-improvements" name="feedback-type" type="radio" className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600" value="No" />
                <label className="block text-sm font-medium leading-6 text-gray-900" htmlFor="psychotic-no">
                  General Improvements
                </label>
              </div>
            </dd>
          </fieldset>
            <div className="mb-4">
              <fieldset className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="flex text-sm font-semibold leading-6 text-gray-900">
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-bold text-gray-700"
                  >
                    Name
                  </label>
                </dt>
                <dd className="mt-2 pl-24 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
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
                </dd>
              </fieldset>
            </div>
            <div className="mb-4">
              <fieldset className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="flex text-sm font-semibold leading-6 text-gray-900">
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-bold text-gray-700"
                  >
                    Email
                  </label>
                </dt>
                <dd className="mt-2 pl-24 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
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
                </dd>
              </fieldset>
            </div>
            <div className="mb-4">
              <fieldset className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="flex text-sm font-semibold leading-6 text-gray-900">
                  <label
                    htmlFor="message"
                    className="mb-2 block text-sm font-bold text-gray-700"
                  >
                    Message
                  </label>
                </dt>
                <dd className="mt-2 pl-24 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
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
                </dd>
              </fieldset>
            </div>
            <div className="mb-4">
              <fieldset className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="flex text-sm font-semibold leading-6 text-gray-900">
                  <label
                    htmlFor="image"
                    className="mb-2 block text-sm font-bold text-gray-700"
                  >
                    Upload Image:
                  </label>
                </dt>
                <dd className="mt-2 pl-24 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  <div className="relative rounded-xl border-dashed border-2 border-gray-500 p-4 bg-gray-100">
                    <label
                      htmlFor="image"
                      className="cursor-pointer block"
                    >
                      <div className="w-32 h-32 mx-auto mb-2">
                        <img
                          src="../src/assets/upload-image-icon.png" 
                          alt="Upload Image"
                          className="h-full w-full object-cover rounded-lg"
                        />
                      </div>
                    </label>
                    <input
                      type="file"
                      id="image"
                      name="image"
                      onChange={(e) => {
                        const file = e.target.files?.[0]; 
                        if (file) {
                          // Handle the selected file here, you can set it in your form values
                          // You might want to upload the file to the backend using the 'axios' library
                          handleChange({
                            target: {
                              name: "image",
                              value: file,
                            },
                          });
                        }
                      }}
                      className="hidden" 
                    />
                  </div>
                </dd>
              </fieldset>
            </div>
            <div className="flex items-center justify-end">
            <div className="flex w-full justify-end">
              <button
                type="button"
                className="btnGray mr-5"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
            <button
                  type="submit"
                  className={`btnBlue  ${isPressed &&
                    "transition-transform focus:outline-none focus:ring focus:ring-blue-200"
                    }${isLoading
                      ? "bg-white-600 transition-transform focus:outline-none focus:ring focus:ring-blue-500"
                      : ""
                    }`}
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                  disabled={isLoading} // Disable the button while loading
                >
                  {isLoading ? ( // Render loading icon if loading
                    <div className="flex items-center  justify-center">
                      <div className="mr-2 h-4 w-4 animate-ping rounded-full bg-white"></div>
                      <p>Loading...</p>
                    </div>
                  ) : (
                    <p>Submit</p>
                  )}
                </button>
            </div>
          </div>
        </form>
      </section>
    </>
  );
};

export default FeedbackForm;
