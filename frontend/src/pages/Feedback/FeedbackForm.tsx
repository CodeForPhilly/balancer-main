import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { useMutation } from "react-query";
import { object, string } from "yup";
import axios from "axios";

interface FormValues {
  name: string;
  email: string;
  message: string;
  image: string;
}

const FeedbackForm = () => {
  const [feedback, setFeedback] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPressed, setIsPressed] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const feedbackValidation = object().shape({
    name: string().required("Name is a required field"),
    email: string()
      .email("You have entered an invalid email")
      .required("Email is a required field"),
    message: string().required("Message is a required field"),
  });

  // implement useEffect to ensure that submit button causes changes in state
  useEffect(() => {
    // Update a feedback message div to render after Submit
    const feedbackMessage = document.getElementById("feedback-message");
    if (feedbackMessage) {
      feedbackMessage.innerText = feedback;
    }

    // Update an error message div after Submit
    const errorMessageDiv = document.getElementById("error-message");
    if (errorMessageDiv) {
      errorMessageDiv.innerText = errorMessage;
    }
  }, [feedback, errorMessage]);

  //reset the form fields and states when clicking cancel
  const handleCancel = () => {
    resetForm();
    setFeedback("");
    setErrorMessage("");
  };

  const handleMouseDown = () => {
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const { isLoading } = useMutation(async (values: FormValues) => {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("email", values.email);
    formData.append("message", values.message);
    formData.append("image", values.image);

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
      onSubmit: async (values) => {
        setFeedback("");
        try {
          // Call 1: Create Feedback request
          const response = await axios.post(
            "http://localhost:8000/api/jira/create_new_feedback/",
            {
              name: values.name,
              email: values.email,
              message: values.message,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          // check to see if request was successful and get the issue key
          if (response.data.status === 201) {
            const issueKey = response.data.issueKey;

            if (values.image) {
              // Call 2: Upload Image
              const formData = new FormData();
              formData.append("issueKey", issueKey);
              formData.append("attachment", values.image);

              const response2 = await axios.post(
                "http://localhost:8000/api/jira/upload_servicedesk_attachment/",
                formData,
                {
                  headers: {
                    "Content-Type": "multipart/form-data",
                  },
                }
              );

              // Check if attachment upload was successful
              if (response2.data.status === 200) {
                const attachmentId = response2.data.tempAttachmentId;

                // Step 3: Attach upload image to feedback request
                const response3 = await axios.post(
                  "http://localhost:8000/api/jira/attach_feedback_attachment/",
                  {
                    issueKey: issueKey,
                    tempAttachmentId: attachmentId,
                  }
                );

                // Check if the attachment was successfully attached
                if (response3.status === 200) {
                  setFeedback("Feedback and image submitted successfully!");
                  resetForm();
                } else {
                  setErrorMessage("Error attaching image");
                }
              } else {
                setErrorMessage("Error uploading the image.");
                console.log(response2);
              }
            } else {
              setFeedback("Feedback submitted successfully!");
              resetForm();
            }
          } else {
            setErrorMessage("Error creating a new feedback request.");
          }
        } catch (error) {
          setErrorMessage("An error occurred while submitting the form");
        }
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
              <dt className="flex text-sm font-semibold leading-6 text-gray-900">
                Feedback Type:
              </dt>
              <dd className="mt-2 pl-24 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <div className="flex items-center gap-x-3 pr-16">
                  <input
                    id="feature-request"
                    name="feedback-type"
                    type="radio"
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    value="Yes"
                  />
                  <label
                    className="block text-sm font-medium leading-6 text-gray-900"
                    htmlFor="psychotic-yes"
                  >
                    Feature Request
                  </label>
                  <input
                    id="bug"
                    name="feedback-type"
                    type="radio"
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    value="No"
                  />
                  <label
                    className="block text-sm font-medium leading-6 text-gray-900"
                    htmlFor="psychotic-no"
                  >
                    Issue
                  </label>
                  <input
                    id="general-improvements"
                    name="feedback-type"
                    type="radio"
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    value="No"
                  />
                  <label
                    className="block text-sm font-medium leading-6 text-gray-900"
                    htmlFor="psychotic-no"
                  >
                    General Feedback
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
                  <div className="relative rounded-xl border-2 border-dashed border-gray-500 bg-gray-100 p-4">
                    <label htmlFor="image" className="block cursor-pointer">
                      <div className="mx-auto mb-2 h-32 w-32">
                        {selectedImage ? (
                          <>
                            <img
                              src={URL.createObjectURL(selectedImage)}
                              alt="Selected Image"
                              className="h-full w-full rounded-lg object-cover"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setSelectedImage(null);
                                const fileInput = document.getElementById(
                                  "image"
                                ) as HTMLInputElement;
                                if (fileInput) {
                                  fileInput.value = "";
                                }
                              }}
                              className="absolute right-2 top-2 cursor-pointer rounded-full bg-white p-1.5"
                            >
                              X
                            </button>
                          </>
                        ) : (
                          <img
                            src="../src/assets/upload-image-icon.png"
                            alt="Upload Image"
                            className="h-full w-full rounded-lg object-cover"
                          />
                        )}
                      </div>
                    </label>
                    <input
                      type="file"
                      id="image"
                      name="image"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Handle the selected file
                          setSelectedImage(file);
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
                className={`btnBlue  ${
                  isPressed &&
                  "transition-transform focus:outline-none focus:ring focus:ring-blue-200"
                }${
                  isLoading
                    ? "bg-white-600 transition-transform focus:outline-none focus:ring focus:ring-blue-500"
                    : ""
                }`}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center  justify-center">
                    <div className="mr-2 h-4 w-4 animate-ping rounded-full bg-white"></div>
                    <p>Loading...</p>
                  </div>
                ) : (
                  <p>Submit</p>
                )}
              </button>
            </div>
            <div id="feedback-message">{feedback}</div>
            <div id="error-message">{errorMessage}</div>
          </div>
        </form>
      </section>
    </>
  );
};

export default FeedbackForm;
