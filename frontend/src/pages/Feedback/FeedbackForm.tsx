import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is a required field'),
    email: Yup.string().email('You have entered an invalid email').required('Email is a required field'),
    message: Yup.string().required('Message is a required field'),
});

const FeedbackForm = () => {
  const formik = useFormik({
    initialValues: {
        name: '',
        email: '',
        message: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
        //submission logic
        console.log('Submitted data:', values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <div>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          onChange={formik.handleChange}
          value={formik.values.name}
        />
        {formik.touched.name && formik.errors.name ? (
          <div>{formik.errors.name}</div>
        ) : null}
      </div>

      <div>
        <label htmlFor="email">E-Mail</label>
        <input
          type="text"
          id="email"
          name="email"
          onChange={formik.handleChange}
          value={formik.values.email}
        />
        {formik.touched.email && formik.errors.email ? (
          <div>{formik.errors.email}</div>
        ) : null}
      </div>

      <div>
        <label htmlFor="message">Message</label>
        <input
          type="text"
          id="message"
          name="message"
          onChange={formik.handleChange}
          value={formik.values.message}
        />
        {formik.touched.message && formik.errors.message ? (
          <div>{formik.errors.message}</div>
        ) : null}
      </div>
      
      <button type="submit">Submit</button>
    </form>
  );
};

export default FeedbackForm;
