import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import socket from '../config/socket';
import { Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Mic, MicMute, CameraVideo, CameraVideoOff, TelephoneFill } from 'react-bootstrap-icons';

const StudentVideoCall = ({ studentId }) => {
  const [stream, setStream] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const navigate = useNavigate();

  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [callerId, setCallerId] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        console.log("🎥 Attempting to access media devices...");
        const currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        console.log("🎥 Media access success");

        setStream(currentStream);
        if (myVideo.current) myVideo.current.srcObject = currentStream;

        socket.emit('readyForCall', { studentId });
        console.log("✅ Student emitted readyForCall:", studentId);

        socket.on('callUser', ({ from, signalData }) => {
          console.log("📞 callUser received from:", from);
          setCallerId(from);

          const peer = new Peer({ initiator: false, trickle: false, stream: currentStream });

          peer.on('signal', (data) => {
            console.log('📞 Sending answer to:', from);
            socket.emit('answerCall', { to: from, signal: data });
          });

          peer.on('stream', (remoteStream) => {
            console.log("📹 Got remote stream");
            if (userVideo.current) userVideo.current.srcObject = remoteStream;
          });

          peer.signal(signalData);
          connectionRef.current = peer;
          setCallAccepted(true);
        });

        socket.on('callEnded', () => {
          console.log('📴 Call ended by counselor');

          connectionRef.current?.destroy();
          setCallAccepted(false);

          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }

          navigate('/student/home');
        });

      } catch (err) {
        console.error("❌ Error in StudentVideoCall useEffect:", err);
      }
    };

    init();

    return () => {
      // Disconnect peer
      connectionRef.current?.destroy();

      // Stop all media tracks to release camera/mic
      stream?.getTracks().forEach(track => track.stop());

      socket.off('callUser');
      socket.off('callAccepted');
      socket.off('callEnded');
    };
  }, [studentId]);


  const toggleAudio = () => {
    if (!stream) return;
    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setAudioEnabled(audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    if (!stream) return;
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setVideoEnabled(videoTrack.enabled);
    }
  };

  const endCall = () => {
    console.log("📴 Call was ended by student");

    // Emit endCall to notify counselor
    if (callerId) {
      socket.emit('endCall', { to: callerId }); // Send endCall to counselor
    }

    if (connectionRef.current) {
      connectionRef.current.destroy(); // closes the peer connection
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop()); // stops media
    }
    setCallAccepted(false);
    navigate('/student/home');
  };

  return (
    <Container fluid style={{ background: 'url("/Green.png")', minHeight: '100vh', minWidth: '100vh' }}>
      <div className="p-4 text-center">
        <h2 className="mb-4">Student Video Call</h2>
        <div className="d-flex justify-content-around mb-4">
          <video
            playsInline
            muted
            ref={myVideo}
            autoPlay
            style={{ width: '350px', borderRadius: '8px', background: 'black' }}
          />
          {callAccepted && (
            <video
              playsInline
              ref={userVideo}
              autoPlay
              style={{ width: '350px', borderRadius: '8px', background: 'black' }}
            />
          )}
        </div>
      </div>

      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: '10px 20px',
        borderRadius: '10px',
        display: 'flex',
        gap: '10px',
        zIndex: 999
      }}>
        <Button variant="light" onClick={toggleAudio}>
          {audioEnabled ? <Mic size={20} /> : <MicMute size={20} />}
        </Button>
        <Button className="btn btn-light" onClick={toggleVideo}>
          {videoEnabled ? <CameraVideo size={20} /> : <CameraVideoOff size={20} />}
        </Button>
        <Button variant="light" onClick={endCall}>
          <TelephoneFill size={20} color='red' />
        </Button>
      </div>

    </Container>
  );
};

export default StudentVideoCall;