import { useState } from "react";

import axios, { AxiosError } from "axios";
import { useFormik } from "formik";
import { useMutation } from "react-query";
import { object, string, mixed } from "yup";

import Summary from "./Summary";

interface FormValues {
  pdf: File | null;
  url: string;
}

const DrugSummaryValidation = object().shape({
  url: string().url("Please enter a valid URL."),
  pdf: mixed()
    .nullable()
    .test("pdf", "Maximum file size is 25MB.", (value) => {
      if (value == null) return true; // pdf is optional
      if (value && value instanceof File) {
        return value?.size <= 2.5e7; // 25MB limit
      }
    })
    .test("pdf", "File type must be PDF.", (value) => {
      if (value == null) return true; // pdf is optional
      if (value && value instanceof File) {
        return value.type.includes("pdf");
      }
    }),
});

const DrugSummaryForm = () => {
  const [summary, setSummary] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { isLoading, mutate } = useMutation(
    async ({ url, pdf }: FormValues) => {
      const formData = new FormData();

      if (url) {
        formData.append("url", url);
      } else if (pdf) {
        formData.append("pdf", pdf);
      }

      const contentType = url ? "application/json" : "multi-part/form";
      let baseUrl = window.location.origin + '/api';
      baseUrl = baseUrl.replace(":3000", ":8000");
      const completeBaseURL = `${baseUrl}/chatgpt`;
      try {
        // TODO change this to actual endpoint url once hosted
        const res = await axios.post(
          completeBaseURL + `/extract_text/`,
          formData,
          {
            headers: {
              "Content-Type": contentType,
            },
          }
        );
        return res;
      } catch (e: unknown) {
        console.error(e);
        const defaultErrorMessage =
          "Something went wrong. Please try again later.";
        if (e instanceof AxiosError) {
          const resErrorMessage = e?.response?.data?.error;
          const fileType =
            resErrorMessage && resErrorMessage.includes("Invalid")
              ? "URL"
              : "PDF";
          const message = !resErrorMessage
            ? defaultErrorMessage
            : `Please enter a valid ${fileType}.`;

          setErrorMessage(message);
        } else {
          setErrorMessage(defaultErrorMessage);
        }
      }
    }
  );

  const {
    errors,
    handleChange,
    handleSubmit,
    resetForm,
    setFieldValue,
    touched,
    values,
  } = useFormik<FormValues>({
    initialValues: {
      url: "",
      pdf: null,
    },
    onSubmit: (values) => {
      setSummary("");
      mutate(values, {
        onSuccess: (response) => {
          const message =
            response?.data?.message?.choices?.[0]?.message?.content;
          if (message) {
            setSummary(message);
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
    validationSchema: DrugSummaryValidation,
  });

  return (
    <>
      <section className="mx-auto mt-12 w-full max-w-xs">
        <form
          onSubmit={handleSubmit}
          className="mb-4 rounded bg-white px-8 pb-8 pt-6 shadow-md"
        >
          <div className="mb-4">
            <label
              htmlFor="url"
              className="mb-2 block text-sm font-bold text-gray-700"
            >
              Enter a URL
            </label>
            <input
              id="url"
              name="url"
              type="text"
              onChange={handleChange}
              disabled={Boolean(values.pdf)}
              value={values.url}
              className={` focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none disabled:bg-gray-200`}
            />
            <div className="form-error-container">
              {touched?.url && errors?.url && (
                <p className="text-sm text-red-500">{errors.url}</p>
              )}
            </div>
          </div>
          <p className="mb-4 font-bold text-blue-600">OR</p>
          <div className="mb-4">
            <label
              id="pdf-label"
              htmlFor="pdf"
              className={`inline-block w-full appearance-none border px-3 py-2 leading-tight text-gray-700 shadow transition ease-in-out hover:cursor-pointer focus:outline-none ${
                values.pdf
                  ? "bg-green-200 hover:bg-green-200"
                  : values.url
                  ? "bg-gray-200 hover:cursor-default hover:bg-gray-200"
                  : "bg-white hover:bg-green-100"
              } rounded-md`}
            >
              {values?.pdf?.name || `Upload a PDF`}
            </label>
            <input
              id="pdf"
              name="pdf"
              type="file"
              disabled={Boolean(values.url)}
              hidden
              onChange={(event) => {
                setFieldValue("pdf", event?.currentTarget?.files?.[0]);
              }}
              // TODO: Replace with custom input component. temporary workaround to stay within Formik value state manager.
              value={undefined}
            />
            <div className="form-error-container">
              {touched?.pdf && errors?.pdf && (
                <p className="text-sm text-red-500">{errors.pdf}</p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-end">
            <button
              className="black_btn disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-600"
              type="submit"
              disabled={(!values.url && !values.pdf) || isLoading}
            >
              Submit
            </button>
          </div>
        </form>
      </section>
      <Summary
        errorMessage={errorMessage}
        isLoading={isLoading}
        summary={summary}
      />
    </>
  );
};

export default DrugSummaryForm;
