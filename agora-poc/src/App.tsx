import React, { useState, useEffect } from "react";
import AgoraRTC, {
  LocalUser,
  RemoteUser,
  useIsConnected,
  useJoin,
  useLocalMicrophoneTrack,
  useLocalCameraTrack,
  usePublish,
  useRemoteUsers,
} from "agora-rtc-react";

import "./styles.css";
import logo from "./agora-logo.svg";

export const Basics: React.FC = () => {
  const [calling, setCalling] = useState<boolean>(false);
  const isConnected = useIsConnected();
  const [appId, setAppId] = useState<string>("");
  const [channel, setChannel] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [hostUID, setHostUID] = useState<number>(12345); // Replace with the actual host's UID

  // Initialize Agora RTC client
  const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

  // Join the call when 'calling' is true
  useJoin(
    { appid: appId, channel: channel, token: token ? token : null },
    calling
  );

  // Local user state for mic and camera
  const [micOn, setMic] = useState<boolean>(true);
  const [cameraOn, setCamera] = useState<boolean>(true);

  // Tracks for microphone and camera
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
  const { localCameraTrack } = useLocalCameraTrack(cameraOn);
  usePublish([localMicrophoneTrack, localCameraTrack]);

  // Remote users state
  const remoteUsers = useRemoteUsers();

  // Function to handle leaving the call
  const handleLeaveCall = async () => {
    if (client.localTracks) {
      client.localTracks.forEach((track) => track.stop());
      client.localTracks.forEach((track) => track.close());
    }
    await client.leave();
    setCalling(false);
    setAppId("");
    setChannel("");
    setToken("");
    setMic(true); // Reset mic state to default
    setCamera(true); // Reset camera state to default
    console.log("Call ended and session cleared");
  };

  // Event listener for when any user leaves the call
  const onUserLeft = async (user: any) => {
    console.log("User left: ", user.uid);

    // Check if the host has left
    if (user.uid === hostUID) {
      console.log("Host has left the call, ending session...");
      alert("The host has ended the session.");
      await handleLeaveCall(); // Leave the call when the host leaves
    }
  };

  // Effect to manage the 'user-left' event
  useEffect(() => {
    // Attach the event listener
    client.on("user-left", onUserLeft);

    // Cleanup the event listener when the component unmounts
    return () => {
      client.off("user-left", onUserLeft);
    };
  }, [client, hostUID]);

  return (
    <>
      <div className='room'>
        {isConnected ? (
          <div className='user-list'>
            <div className='user'>
              {/* Local user */}
              <LocalUser
                audioTrack={localMicrophoneTrack}
                cameraOn={cameraOn}
                micOn={micOn}
                videoTrack={localCameraTrack}
                cover='https://www.agora.io/en/wp-content/uploads/2022/10/3d-spatial-audio-icon.svg'>
                <samp className='user-name'>You</samp>
              </LocalUser>
            </div>
            {/* Remote users */}
            {remoteUsers.map((user) => (
              <div className='user' key={user.uid}>
                <RemoteUser
                  cover='https://www.agora.io/en/wp-content/uploads/2022/10/3d-spatial-audio-icon.svg'
                  user={user}>
                  <samp className='user-name'>{user.uid}</samp>
                </RemoteUser>
              </div>
            ))}
          </div>
        ) : (
          <div className='join-room'>
            <img alt='agora-logo' className='logo' src={logo} />
            <input
              onChange={(e) => setAppId(e.target.value)}
              placeholder='<Your app ID>'
              value={appId}
            />
            <input
              onChange={(e) => setChannel(e.target.value)}
              placeholder='<Your channel name>'
              value={channel}
            />
            <input
              onChange={(e) => setToken(e.target.value)}
              placeholder='<Your token>'
              value={token}
            />

            <button
              className={`join-channel ${!appId || !channel ? "disabled" : ""}`}
              disabled={!appId || !channel}
              onClick={() => setCalling(true)}>
              <span>Join Channel</span>
            </button>
          </div>
        )}
      </div>

      {/* In-call controls */}
      {isConnected && (
        <div className='control'>
          <div className='left-control'>
            <button className='btn' onClick={() => setMic((prev) => !prev)}>
              <i className={`i-microphone ${!micOn ? "off" : ""}`} />
            </button>
            <button className='btn' onClick={() => setCamera((prev) => !prev)}>
              <i className={`i-camera ${!cameraOn ? "off" : ""}`} />
            </button>
          </div>
          <button
            className={`btn btn-phone ${calling ? "btn-phone-active" : ""}`}
            onClick={calling ? handleLeaveCall : () => setCalling(true)}>
            {calling ? (
              <i className='i-phone-hangup' />
            ) : (
              <i className='i-mdi-phone' />
            )}
          </button>
        </div>
      )}
    </>
  );
};

export default Basics;
