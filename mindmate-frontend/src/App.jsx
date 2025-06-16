import StudentRoutes from '../src/routes/StudentRoutes';
import CounselorPsychologistRoutes from '../src/routes/CounselorPsychologistRoutes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {

  return (
    <>
      <StudentRoutes />
      <CounselorPsychologistRoutes />
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default App;