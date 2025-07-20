import { useParams } from 'react-router-dom';
import StudentVideoCall from '../components/StudentVideoCall';

const StudentVideoCallWrapper = () => {
  const { studentId } = useParams();
  if (!studentId) {
    return <div>⚠️ Invalid student ID</div>;
  }
  return <StudentVideoCall studentId={studentId} />;
};

export default StudentVideoCallWrapper;