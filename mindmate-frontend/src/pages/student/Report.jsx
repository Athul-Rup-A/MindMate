import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Form, Row, Col, Button, Table } from 'react-bootstrap';
import { Formik, Field, Form as FormikForm, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import authHeader from '../../config/authHeader';
import getCurrentUserId from '../../config/getCurrentUserId';
import { useNavigate } from 'react-router-dom';
import CustomTable from '../../components/CustomTable';
import Select from 'react-select'
import GoHomeButton from '../../components/GoHomeButton'

const Report = () => {
  const [targetList, setTargetList] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [myReports, setMyReports] = useState([]);
  const currentUserId = getCurrentUserId();
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/students';

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

        // Fetch vents
        const resVents = await axios.get(`${BASE_URL}/vents`, authHeader());
        const ventData = resVents.data.map((v) => ({
          _id: v._id,
          FullName: v.Topic || 'Untitled Vent',
          Role: 'Vent',
          ModelName: 'Vent',
        }));

        // Fetch resources
        const resResources = await axios.get(`${BASE_URL}/resources`, authHeader());
        const resourceData = resResources.data.map((r) => ({
          _id: r._id,
          FullName: r.title,
          Role: 'Resource',
          ModelName: 'Resource',
        }));

        // Combine all
        setTargetList([...counselorData, ...ventData, ...resourceData]);
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
      if (type === 'resource') {
        const res = await axios.get(`${BASE_URL}/resources`, authHeader());
        const transformed = res.data.map((r) => ({
          _id: r._id,
          FullName: r.title,
          Role: 'Resource',
          ModelName: 'Resource',
        }));
        setTargetList(transformed);
      }
      else if (type === 'counselor' || type === 'psychologist') {
        const res = await axios.get(`${BASE_URL}/counselorPsychologist`, authHeader());

        // Filter only matching roles
        const filtered = res.data.filter((p) => p.Role === type);

        const transformed = filtered.map((p) => ({
          ...p,
          ModelName: 'CounselorPsychologist',
        }));

        setTargetList(transformed);
      }
      else if (type === 'vent') {
        const res = await axios.get(`${BASE_URL}/vents`, authHeader());
        const transformed = res.data.map((v) => ({
          _id: v._id,
          FullName: v.Topic || 'Untitled Vent',
          Role: 'Vent',
          ModelName: 'Vent',
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
      .oneOf(['counselor', 'psychologist', 'vent', 'resource'], 'Select a valid report type')
      .required('Report type is required'),
    TargetType: Yup.string()
      .oneOf(['CounselorPsychologist', 'Resource', 'Vent'], 'Invalid type')
      .required('Target type is required'),
    TargetAliasId: Yup.string().when('TargetType', {
      is: (val) => val === 'CounselorPsychologist',
      then: () => Yup.string().required('TargetAliasId is required'),
      otherwise: () => Yup.string().notRequired(),
    }),
    TargetId: Yup.string()
      .required('Please select a target'),
    Reason: Yup.string()
      .oneOf(['spam', 'abuse', 'offensive', 'harassment', 'misinformation'], 'Invalid reason')
      .required('Reason is required'),
  });

  const handleSubmit = async (values, { resetForm }) => {

    if (values.TargetType !== 'CounselorPsychologist') {
      delete values.TargetAliasId;
    }

    try {
      await axios.post(`${BASE_URL}/reports`, values, authHeader());
      toast.success('Report submitted successfully');

      resetForm({
        values: {
          TargetId: '',
          TargetType: '',
          TargetAliasId: '',
          Reason: '',
          reportRole: '',
        }
      });

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
      fluid
      className="py-5"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to right,rgb(110, 139, 188),rgb(96, 196, 111))',
        padding: '2rem',
        borderRadius: '20px',
      }}
    >
      <GoHomeButton />

      <h3 className='text-center mb-4'>Anonymous Report Center</h3>
      <Formik
        initialValues={{
          TargetId: '',
          TargetType: '',
          TargetAliasId: '',
          Reason: '',
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

                      let backendType = '';
                      if (selectedRole === 'resource') backendType = 'Resource';
                      else if (selectedRole === 'vent') backendType = 'Vent';
                      else backendType = 'CounselorPsychologist';

                      setFieldValue("TargetType", backendType);
                      setFieldValue("reportRole", selectedRole);
                    }}
                  >
                    <option value="">-- Select Type --</option>
                    <option value="vent">Vent</option>
                    <option value="counselor">Counselor</option>
                    <option value="psychologist">Psychologist</option>
                    <option value="resource">Resource</option>
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
                      aliasId: t.AliasId,
                      modelName: t.ModelName
                    }))}
                    onChange={(selectedOption) => {
                      setSelectedTarget(selectedOption);
                      setFieldValue('TargetId', selectedOption?.value || '');

                      // Only set TargetAliasId if it's a CounselorPsychologist
                      if (selectedOption?.modelName === 'CounselorPsychologist') {
                        setFieldValue('TargetAliasId', selectedOption.aliasId || '');
                      } else {
                        setFieldValue('TargetAliasId', '');
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
                  <Field as="select" name="Reason" className="form-control">
                    <option value="">-- Select --</option>
                    <option value="spam">Spam</option>
                    <option value="abuse">Abuse</option>
                    <option value="offensive">Offensive</option>
                    <option value="harassment">Harassment</option>
                    <option value="misinformation">Misinformation</option>
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
                if (report.TargetType === 'Resource') return 'resource';
                if (report.TargetType === 'Vent') return 'vent';
                if (report.TargetAliasId?.toLowerCase().includes('psychologist')) return 'psychologist';
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
            },
          ]}
          rowKey={(report) => `report-${report._id}`}
        />
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </Container>
  );
};

export default Report;