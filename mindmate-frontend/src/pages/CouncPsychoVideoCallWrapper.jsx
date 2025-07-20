import { useParams } from 'react-router-dom';
import CouncPsychVideoCall from '../components/CouncPsychoVideoCall';

const CouncPsychoVideoCallWrapper = () => {
  const { myId, targetId } = useParams();
  return <CouncPsychVideoCall myId={myId} targetId={targetId} />;
};

export default CouncPsychoVideoCallWrapper;