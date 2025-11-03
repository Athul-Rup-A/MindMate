import React, { useEffect, useRef, useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Peer from 'simple-peer';
import { Mic, MicMute, CameraVideo, CameraVideoOff, TelephoneFill } from 'react-bootstrap-icons';
import socket from '../config/socket'

const CouncPsychVideoCall = ({ myId, targetId }) => {
  const [stream, setStream] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [savedSignal, setSavedSignal] = useState(null);
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const navigate = useNavigate();
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  useEffect(() => {
    socket.connect();
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });
    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });
  }, []);

  useEffect(() => {
    let isMounted = true; // To prevent side-effects if unmounted quickly
    let localStream;

    const startMedia = async () => {
      try {
        console.log("🎥 Trying to access webcam and mic...");
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        if (isMounted) {
          setStream(localStream);
          if (myVideo.current) {
            myVideo.current.srcObject = localStream;
          }
          console.log("✅ Media stream started");
        }
      } catch (err) {
        console.error("❌ Error accessing media devices:", err.name, err.message);

        if (err.name === "NotAllowedError") {
          alert("Permission denied. Please allow camera and microphone access.");
        } else if (err.name === "NotFoundError") {
          alert("No media devices found. Please connect a camera or microphone.");
        } else {
          alert("Failed to start media: " + err.message);
        }
      }
    };

    startMedia();

    socket.emit('join', myId);

    socket.on('callAccepted', (signal) => {
      console.log('📞 Caller received answer signal');
      setCallAccepted(true);
      connectionRef.current?.signal(signal);
    });

    // When student is ready, resend call
    socket.on('readyForCall', ({ studentId }) => {
      if (studentId === targetId && savedSignal) {
        console.log("🔁 Student ready — resending callUser signal");
        socket.emit('callUser', {
          from: myId,
          to: studentId,
          signalData: savedSignal,
        });
      }
    });

    socket.on('callEnded', () => {
      console.log("📴 Call was ended by student");

      if (connectionRef.current) {
        connectionRef.current.destroy();
        connectionRef.current = null;
      }

      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      if (myVideo.current) {
        myVideo.current.srcObject = null;
      }
      if (userVideo.current) {
        userVideo.current.srcObject = null;
      }

      setCallAccepted(false);
      setStream(null);         // Fully reset
      setSavedSignal(null);    // Clear saved signal

      setTimeout(() => {
        navigate('/counselorpsychologist/stat');
      }, 300);
    });

    return () => {
      isMounted = false;

      // Stop all media tracks to release camera/mic
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }

      // Disconnect peer
      connectionRef.current?.destroy();

      socket.off('callUser');
      socket.off('callEnded');
      socket.off('callAccepted');
      socket.off('readyForCall');
    };
  }, [myId, targetId, savedSignal]);

  const callUser = () => {
    if (!stream) {
      alert('Cannot start call — camera or microphone is blocked.');
      return;
    }

    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on('signal', (data) => {
      console.log('📞 Caller signal emitted to student');
      console.log("👤 Target ID (student):", targetId);

      setSavedSignal(data);

      socket.emit('callUser', {
        from: myId,
        to: targetId,
        signalData: data,
      });
    });

    peer.on('stream', (remoteStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = remoteStream;
      }
    });

    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallAccepted(false);
    connectionRef.current?.destroy();
    socket.emit('endCall', { to: targetId });
  };

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

  return (
    <Container fluid style={{ background: 'url("/Green.png")', minHeight: '100vh', minWidth: '100vh' }}>
      <div className="p-4 text-center">
        <h2 className="mb-4">Video Call Interface</h2>
        <div className="d-flex justify-content-around mb-4">
          <video playsInline muted ref={myVideo} autoPlay style={{ width: '350px', borderRadius: '8px' }} />
          {callAccepted && (
            <video playsInline ref={userVideo} autoPlay style={{ width: '350px', borderRadius: '8px' }} />
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
        {!callAccepted && (
          <Button variant="light" onClick={callUser}>
            <TelephoneFill size={20} />
          </Button>
        )}
        {callAccepted && stream && (
          <>
            <Button variant="light" onClick={toggleAudio}>
              {audioEnabled ? <Mic size={20} /> : <MicMute size={20} />}
            </Button>
            <Button className="btn btn-light" onClick={toggleVideo}>
              {videoEnabled ? <CameraVideo size={20} /> : <CameraVideoOff size={20} />}
            </Button>
            <Button variant="light" onClick={leaveCall}>
              <TelephoneFill size={20} color='red' />
            </Button>
          </>
        )}
      </div>

    </Container>
  );
};

export default CouncPsychVideoCall;