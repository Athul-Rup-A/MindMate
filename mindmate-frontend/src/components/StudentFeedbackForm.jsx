import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from '../config/axios';
import { toast } from 'react-toastify';

const StudentFeedbackForm = () => {
  const { studentId, counselorId } = useParams();
  const navigate = useNavigate();

  const initialValues = {
    rating: '',
    comment: '',
  };

  const validationSchema = Yup.object({
    rating: Yup.number().min(1).max(5).required('Rating is required'),
    comment: Yup.string().min(5, 'Comment too short').required('Comment is required'),
  });

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const payload = {
        Rating: values.rating,
        Comment: values.comment,
        StudentId: studentId,
        Type: 'session',
      };

      await axios.post('/feedbacks', payload);
      toast.success('Feedback submitted successfully!');
      resetForm();
      navigate('/student/home');
    } catch (err) {
      console.error('❌ Feedback error:', err);
      toast.error('Failed to submit feedback');
    }
  };

  return (
    <div className="container mt-5 p-4 rounded shadow" style={{ background: 'linear-gradient(to bottom right, #e0f7fa, #80deea)' }}>
      <h3 className="text-center mb-4">Session Feedback</h3>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        <Form className="mx-auto" style={{ maxWidth: '400px' }}>
          <div className="mb-3">
            <label>Rating (1–5)</label>
            <Field as="select" name="rating" className="form-control">
              <option value="">Select rating</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Field>
            <ErrorMessage name="rating" component="div" className="text-danger" />
          </div>

          <div className="mb-3">
            <label>Comment</label>
            <Field as="textarea" name="comment" className="form-control" rows="4" />
            <ErrorMessage name="comment" component="div" className="text-danger" />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Submit Feedback
          </button>
        </Form>
      </Formik>
    </div>
  );
};

export default StudentFeedbackForm;