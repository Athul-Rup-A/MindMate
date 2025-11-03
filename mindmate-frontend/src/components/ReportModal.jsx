import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Formik, Field, Form as FormikForm } from 'formik';
import * as Yup from 'yup';

const ReportSchema = Yup.object().shape({
  Reason: Yup.string().required("Please select a reason"),
  CustomReason: Yup.string()
    .when("Reason", {
      is: "other",
      then: (schema) => schema.required("Please provide a custom reason"),
      otherwise: (schema) => schema.notRequired(),
    }),
});

const ReportModal = ({ show, onHide, onSubmit, resource }) => (
  <Modal show={show} onHide={onHide} centered>
    <Modal.Header closeButton>
      <Modal.Title>Report Resource</Modal.Title>
    </Modal.Header>

    <Formik
      initialValues={{ Reason: '', CustomReason: '' }}
      validationSchema={ReportSchema}
      onSubmit={(values, { resetForm }) => {
        onSubmit(resource, values);
        resetForm();
        onHide();
      }}
    >
      {({ errors, touched, values }) => (
        <FormikForm>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Select Reason</Form.Label>
              <Field as="select" name="Reason" className="form-control">
                <option value="">-- Choose --</option>
                <option value="spam">Spam</option>
                <option value="offensive">Offensive</option>
                <option value="harassment">Harassment</option>
                <option value="misinformation">Misinformation</option>
                <option value="other">Other</option>
              </Field>
              {errors.Reason && touched.Reason && (
                <div className="text-danger small">{errors.Reason}</div>
              )}
            </Form.Group>

            {/* Show textbox only when Reason === "other" */}
            {values.Reason === "other" && (
              <Form.Group className="mt-3">
                <Form.Label>Explain Reason</Form.Label>
                <Field
                  as="textarea"
                  name="CustomReason"
                  rows="3"
                  className="form-control"
                  placeholder="Tell us more..."
                />
                {errors.CustomReason && touched.CustomReason && (
                  <div className="text-danger small">{errors.CustomReason}</div>
                )}
              </Form.Group>
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>Cancel</Button>
            <Button type="submit" variant="danger">Submit Report</Button>
          </Modal.Footer>
        </FormikForm>
      )}
    </Formik>
  </Modal>
);

export default ReportModal;