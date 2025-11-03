import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Form, Row, Col, Button } from 'react-bootstrap';
import { Formik, Field, Form as FormikForm, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import authHeader from '../../config/authHeader';
import getCurrentUserId from '../../config/getCurrentUserId';
import CustomTable from '../../components/CustomTable';
import Select from 'react-select'

const Report = () => {
  const [targetList, setTargetList] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [myReports, setMyReports] = useState([]);
  const currentUserId = getCurrentUserId();

  const BASE_URL = `${import.meta.env.VITE_API_URL}students`;

  const fetchMyReports = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/reports`, authHeader());
      setMyReports(res.data);
    } catch (err) {
      toast.error('Failed to load your reports');
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, []);

  useEffect(() => {
    const fetchAllTargets = async () => {
      try {
        // Fetch counselors & psychologists
        const resCounselors = await axios.get(`${BASE_URL}/counselorPsychologist`, authHeader());
        const counselorData = resCounselors.data.map((p) => ({
          ...p,
          FullName: p.FullName,
          Role: p.Role,
          ModelName: 'CounselorPsychologist',
        }));

        setTargetList(counselorData);
      } catch (err) {
        toast.error('Failed to load target list');
      }
    };

    fetchAllTargets();
  }, []);

  const handleTypeChange = async (type) => {
    setTargetList([]);

    if (!type) return;

    try {
      if (type === 'counselor' || type === 'psychologist') {
        const res = await axios.get(`${BASE_URL}/counselorPsychologist`, authHeader());

        // Filter only matching roles
        const filtered = res.data.filter((p) => p.Role === type);

        const transformed = filtered.map((p) => ({
          ...p,
          ModelName: 'CounselorPsychologist',
        }));

        setTargetList(transformed);
      }
    } catch (error) {
      console.error('Failed to fetch targets:', error);
      toast.error('Failed to load target list.');
    }
  };

  const validationSchema = Yup.object().shape({
    reportRole: Yup.string()
      .oneOf(['counselor', 'psychologist'], 'Select a valid report type')
      .required('Report type is required'),
    TargetType: Yup.string()
      .oneOf(['CounselorPsychologist'], 'Invalid type')
      .required('Target type is required'),
    TargetUsername: Yup.string().when('TargetType', {
      is: (val) => val === 'CounselorPsychologist',
      then: () => Yup.string().required('TargetUsername is required'),
      otherwise: () => Yup.string().notRequired(),
    }),
    TargetId: Yup.string()
      .required('Please select a target'),
    Reason: Yup.string()
      .oneOf(
        ['spam', 'abuse', 'offensive', 'harassment', 'misinformation', 'other'],
        'Invalid reason'
      )
      .required('Reason is required'),
    CustomReason: Yup.string().when('Reason', {
      is: 'other',
      then: () =>
        Yup.string()
          .min(3, 'Please describe your reason')
          .required('Please enter a custom reason'),
      otherwise: () => Yup.string().notRequired(),
    }),

  });

  const handleSubmit = async (values, { resetForm }) => {

    if (values.TargetType !== 'CounselorPsychologist') {
      delete values.TargetUsername;
    }

    try {
      const payload = { ...values };

      // if other
      if (values.Reason === 'other') {
        payload.OtherReason = values.CustomReason;
      } else {
        delete payload.CustomReason;
        delete payload.OtherReason;
      }

      if (payload.TargetType !== 'CounselorPsychologist') delete payload.TargetUsername;

      await axios.post(`${BASE_URL}/reports`, payload, authHeader());
      toast.success('Report submitted successfully');

      resetForm({ values: { TargetId: '', TargetType: '', TargetUsername: '', Reason: '', CustomReason: '', reportRole: '' } });
      setTargetList([]);
      setSelectedTarget(null);
      fetchMyReports();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to submit report');
    }
  };

  const deleteReport = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/reports/${id}`, authHeader());
      toast.success('Report deleted');
      fetchMyReports();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete report');
    }
  };

  return (
    <Container
      className="position-relative"
      style={{
        background: 'transparent',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(4px)',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
      }}
    >

      <h3 className='text-center mb-4'>Anonymous Report Center</h3>
      <Formik
        initialValues={{
          TargetId: '',
          TargetType: '',
          TargetUsername: '',
          Reason: '',
          CustomReason: '',
          reportRole: '', //To track UI dropdown
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue }) => (
          <FormikForm>
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Report Type</Form.Label>
                  <Field
                    as="select"
                    name="reportRole"
                    className="form-control"
                    onChange={(e) => {
                      const selectedRole = e.target.value;
                      handleTypeChange(selectedRole);

                      let backendType = 'CounselorPsychologist';

                      setFieldValue("TargetType", backendType);
                      setFieldValue("reportRole", selectedRole);
                    }}
                  >
                    <option value="">-- Select Type --</option>
                    <option value="counselor">Counselor</option>
                    <option value="psychologist">Psychologist</option>
                  </Field>

                  <div className="text-danger small">
                    <ErrorMessage name="reportRole" />
                  </div>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Select Target</Form.Label>
                  <Select
                    name="TargetId"
                    value={selectedTarget}
                    options={targetList.map((t) => ({
                      value: t._id,
                      label: `${t.FullName} (${t.Role})`,
                      username: t.Username,
                      modelName: t.ModelName
                    }))}
                    onChange={(selectedOption) => {
                      setSelectedTarget(selectedOption);
                      setFieldValue('TargetId', selectedOption?.value || '');

                      // Only set TargetUsername if it's a CounselorPsychologist
                      if (selectedOption?.modelName === 'CounselorPsychologist') {
                        setFieldValue('TargetUsername', selectedOption.username || '');
                      } else {
                        setFieldValue('TargetUsername', '');
                      }
                    }}
                    placeholder="Select or search target..."
                    isClearable
                  />

                  <div className="text-danger small"><ErrorMessage name="TargetId" /></div>
                </Form.Group>
              </Col>

            </Row>

            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Reason</Form.Label>
                  <Field as="select" name="Reason" className="form-control"
                    onChange={(e) => {
                      const value = e.target.value;
                      setFieldValue("Reason", value);
                      if (value !== "other") {
                        setFieldValue("CustomReason", "");
                      }
                    }}>
                    <option value="">-- Select --</option>
                    <option value="spam">Spam</option>
                    <option value="abuse">Abuse</option>
                    <option value="offensive">Offensive</option>
                    <option value="harassment">Harassment</option>
                    <option value="misinformation">Misinformation</option>
                    <option value="other">Other</option>
                  </Field>

                  <Field name="CustomReason">
                    {({ field, form }) =>
                      form.values.Reason === "other" && (
                        <Form.Control
                          type="text"
                          placeholder="Type your custom reason..."
                          className="mt-2"
                          {...field}
                        />
                      )
                    }
                  </Field>

                  <div className="text-danger small"><ErrorMessage name="Reason" /></div>
                </Form.Group>
              </Col>

              <Col md={6}>
                <div className="text-end mt-4">
                  <Button type="submit" disabled={isSubmitting}>
                    Submit Report
                  </Button>
                </div></Col>
            </Row>

          </FormikForm>
        )}
      </Formik>

      <hr className="my-4" />
      <h5 className="text-center mb-3">Your Submitted Reports</h5>

      {myReports.length === 0 ? (
        <p className="text-center">No reports submitted yet.</p>
      ) : (
        <CustomTable
          columns={[
            { header: '#', accessor: (_, index) => index + 1 },
            {
              header: 'Target',
              accessor: (report) =>
                report.TargetName === 'N/A' ? <i>Not Available</i> : report.TargetName,
            },
            {
              header: 'Type',
              accessor: (report) => {
                if (report.TargetUsername?.toLowerCase().includes('psychologist')) return 'psychologist';
                return 'counselor';
              },
            },
            { header: 'Reason', accessor: 'Reason' },
            { header: 'Status', accessor: 'Status' },
            {
              header: 'Date',
              accessor: (report) => new Date(report.createdAt).toLocaleString(),
            },
          ]}
          data={myReports}
          actions={[
            {
              label: 'Delete',
              variant: 'danger',
              onClick: (report) => {
                if (report.ReporterId === currentUserId) {
                  deleteReport(report._id);
                }
              },
              condition: (report) => report.ReporterId === currentUserId,
              disabled: (report) => report.Status?.toLowerCase() === 'resolved',
            },
          ]}
          rowKey={(report) => `report-${report._id}`}
        />
      )}

    </Container>
  );
};

export default Report;