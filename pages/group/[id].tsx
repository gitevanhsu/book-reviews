import styled from "styled-components";
import {
  getBookInfo,
  BookInfo,
  getMemberData,
  MemberInfo,
  getFirstBook,
  getFirstChat,
  ChatMessage,
} from "../../utils/firebaseFuncs";
import { useRouter } from "next/router";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  VideoHTMLAttributes,
} from "react";

import { useSelector } from "react-redux";
import { RootState } from "../../store";
import Link from "next/link";
import Image from "next/image";
import { BookComponent } from "../book/[id]";
import ChatRoomComponent from "../../components/group_chat";
import LinkImg from "../../public/img/link.svg";
import videoChat from "../../public/img/video-call.svg";
import microPhone from "../../public/img/microphone.svg";
import video from "../../public/img/video.svg";
import phone from "../../public/img/phone.svg";
import {
  getDatabase,
  ref,
  child,
  onValue,
  update,
  onDisconnect,
  remove,
} from "firebase/database";
import { rtcFireSession, RTCFireSession } from "../../utils/service";
import { GetServerSideProps } from "next/types";
import { ParsedUrlQuery } from "querystring";

const GroupPage = styled.div`
  width: 100%;
  min-height: calc(100vh - 50px);
  background-color: ${(props) => props.theme.lightWhite};
  padding: 50px 30px;
`;
const GroupPageWrap = styled.div`
  max-width: 1280px;
  margin: 0 auto;
`;
const GoToReviewBox = styled(Link)`
  display: inline-block;
  margin-bottom: 30px;
`;
const GoToReview = styled.p`
  vertical-align: middle;
  display: inline-block;
  margin-left: 10px;
  color: #000;
  cursor: pointer;
`;
const GoToReviewImg = styled(Image)`
  border-radius: 5px;
  vertical-align: middle;
`;
const VideoAndChatBox = styled.div`
  width: 100%;
  border-top: 1px solid ${(props) => props.theme.black};
  display: flex;
  justify-content: space-between;
  @media screen and (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

// const VideoBox = styled.div`
//   display: flex;
//   align-items: center;
//   justify-content: center;
// `;
// const Title3 = styled.h3``;
// const Video = styled.video`
//   width: 40vw;
//   height: 30vw;
//   margin: 2rem;
//   background: rgb(44, 62, 80);
//   margin: 0;
// `;
// const MyVideo = styled(Video)`
//   transform: scaleX(-1);
// `;
// const StartButton = styled.button`
//   padding: 5px 10px;
//   border: solid 1px;
//   cursor: pointer;
// `;
// const CreateButton = styled(StartButton)``;
// const AnswerButton = styled(StartButton)``;
// const HangupButton = styled(StartButton)``;

// const RoomNumberInput = styled.input``;

export default function Group({
  firstData,
  firstChat,
}: {
  firstData: BookInfo;
  firstChat: string;
}) {
  // const userInfo = useSelector((state: RootState) => state.userInfo);

  // const [showVideo, setShoeVideo] = useState<boolean>(false);
  // const localVideoRef = useRef<HTMLVideoElement>(null);
  // const remotoVideoRef = useRef<HTMLVideoElement>(null);
  // const answeInputrRef = useRef<HTMLInputElement>(null);

  // const webcamButton = useRef<HTMLButtonElement>(null);
  // const webcamCreateButton = useRef<HTMLButtonElement>(null);
  // const webcamAnswerButton = useRef<HTMLButtonElement>(null);
  // const webcamHangupButton = useRef<HTMLButtonElement>(null);
  // const pcRef = useRef<RTCPeerConnection>();
  // useEffect(() => {
  //   if (!localVideoRef.current) return;
  //   const localRemove = localVideoRef.current;
  //   if (!remotoVideoRef.current) return;
  //   const remotoRemove = remotoVideoRef.current;

  //   return () => {
  //     if (pcRef.current && localRemove) {
  //       (localRemove.srcObject as MediaStream)
  //         .getTracks()
  //         .forEach((track: { stop: () => void }) => track.stop());
  //       if (pcRef.current && remotoRemove) {
  //         (remotoRemove.srcObject as MediaStream)
  //           .getTracks()
  //           .forEach((track: { stop: () => void }) => track.stop());
  //       }
  //     }
  //   };
  // }, []);

  // const start = async () => {
  //   const servers = {
  //     iceServers: [
  //       {
  //         urls: [
  //           "stun:stun.l.google.com:19302",
  //           "stun:stun1.l.google.com:19302",
  //           "stun:stun2.l.google.com:19302",
  //           "stun:stun3.l.google.com:19302",
  //           "stun:stun4.l.google.com:19302",
  //         ],
  //       },
  //     ],
  //     iceCandidatePoolSize: 10,
  //   };
  //   const pc = new RTCPeerConnection(servers);
  //   pcRef.current = pc;
  //   setTimeout(async () => {
  //     const webcamVideo = localVideoRef.current;
  //     const remoteVideo = remotoVideoRef.current;
  //     const templocalStream = await navigator.mediaDevices.getUserMedia({
  //       video: true,
  //       audio: true,
  //     });
  //     templocalStream.getTracks().forEach((track) => {
  //       pcRef.current!.addTrack(track, templocalStream);
  //     });

  //     webcamVideo!.srcObject = templocalStream;

  //     const tempremoteStream = new MediaStream();
  //     pcRef.current!.ontrack = (event) => {
  //       event.streams[0].getTracks().forEach((track) => {
  //         tempremoteStream.addTrack(track);
  //       });
  //     };

  //     remoteVideo!.srcObject = tempremoteStream;
  //   });
  // };
  // const create = async () => {
  //   const callDoc = doc(collection(db, "calls"));
  //   answeInputrRef.current!.value = callDoc.id;

  //   // Get candidates for caller, save to db
  //   pcRef.current!.onicecandidate = async (event) => {
  //     event.candidate &&
  //       (await setDoc(
  //         doc(collection(db, `calls/${callDoc.id}/offerCandidates`)),
  //         event.candidate.toJSON()
  //       ));
  //   };

  //   // Create offer
  //   const offerDescription = await pcRef.current!.createOffer();
  //   await pcRef.current!.setLocalDescription(offerDescription);

  //   const offer = {
  //     sdp: offerDescription.sdp,
  //     type: offerDescription.type,
  //   };

  //   await setDoc(callDoc, { offer });

  //   // Listen for remote answer
  //   const unsubscribe1 = onSnapshot(callDoc, (snapshot) => {
  //     const data = snapshot.data();
  //     if (!pcRef.current!.currentRemoteDescription && data?.answer) {
  //       const answerDescription = new RTCSessionDescription(data.answer);
  //       pcRef.current!.setRemoteDescription(answerDescription);
  //     }
  //   });
  //   // Listen for remote ICE candidates
  //   const unsubscribe2 = onSnapshot(
  //     collection(db, `calls/${callDoc.id}/answerCandidates`),
  //     (snapshot) => {
  //       snapshot.docChanges().forEach((change: any) => {
  //         if (change.type === "added") {
  //           console.log(change.doc.data());
  //           const candidate = new RTCIceCandidate(change.doc.data());
  //           pcRef.current!.addIceCandidate(candidate);
  //         }
  //       });
  //     }
  //   );
  //   return () => {
  //     unsubscribe1();
  //     unsubscribe2();
  //   };
  // };
  // const answer = async () => {
  //   const callId = answeInputrRef.current!.value;
  //   const callDoc = await getDoc(doc(db, "calls", callId));

  //   pcRef.current!.onicecandidate = async (event) => {
  //     console.log("onicecandidate");
  //     event.candidate &&
  //       (await setDoc(
  //         doc(collection(db, `calls/${callDoc.id}/offerCandidates`)),
  //         event.candidate.toJSON()
  //       ));
  //   };

  //   const callData = callDoc.data();

  //   const offerDescription = callData!.offer;
  //   await pcRef.current!.setRemoteDescription(
  //     new RTCSessionDescription(offerDescription)
  //   );

  //   const answerDescription = await pcRef.current!.createAnswer();
  //   console.log("answerDescription", answerDescription);
  //   await pcRef.current!.setLocalDescription(answerDescription);

  //   const answer = {
  //     type: answerDescription.type,
  //     sdp: answerDescription.sdp,
  //   };

  //   await updateDoc(doc(db, "calls", callId), { answer });

  //   // Listen to offer candidates

  //   const unsubscribe3 = onSnapshot(
  //     collection(db, `calls/${callDoc.id}/offerCandidates`),
  //     (snapshot) => {
  //       snapshot!
  //         .docChanges()
  //         .forEach((change: { type: string; doc: { data: () => any } }) => {
  //           if (change.type === "added") {
  //             let data = change.doc.data();
  //             pcRef.current!.addIceCandidate(new RTCIceCandidate(data));
  //           }
  //         });
  //     }
  //   );
  //   return () => {
  //     unsubscribe3();
  //   };
  // };
  // const hangup = async () => {
  //   if (pcRef.current && localVideoRef.current && remotoVideoRef.current) {
  //     (localVideoRef.current.srcObject as MediaStream)
  //       .getTracks()
  //       .forEach((track: { stop: () => void }) => track.stop());
  //     (remotoVideoRef.current.srcObject as MediaStream)
  //       .getTracks()
  //       .forEach((track: { stop: () => void }) => track.stop());
  //     setShoeVideo(false);
  //   }
  // };
  const chatdata = JSON.parse(firstChat) as ChatMessage[];

  return (
    <GroupPage>
      <GroupPageWrap>
        <BookComponent data={firstData} />
        <GoToReviewBox href={`/book/id:${firstData.isbn}`}>
          <GoToReviewImg src={LinkImg} alt="link" width={20} height={20} />
          <GoToReview>Review Page</GoToReview>
        </GoToReviewBox>
        {/* <VideoBox>
        {showVideo && (
          <>
            <Title3>Local Stream</Title3>
            <br />
            <MyVideo ref={localVideoRef} autoPlay playsInline muted />
          </>
        )}

        {showVideo && (
          <>
            <Title3>Remote Stream</Title3>
            <br />
            <Video ref={remotoVideoRef} autoPlay playsInline />
          </>
        )}
      </VideoBox>
      {showVideo ? (
        <>
          <CreateButton
            ref={webcamCreateButton}
            onClick={() => {
              create();
            }}
          >
            開啟聊天室
          </CreateButton>
          <br />

          <RoomNumberInput id="callInput" ref={answeInputrRef} />
          <AnswerButton
            ref={webcamAnswerButton}
            onClick={() => {
              answer();
            }}
          >
            加入聊天室
          </AnswerButton>
          <br />
          <HangupButton
            ref={webcamHangupButton}
            onClick={() => {
              hangup();
            }}
          >
            結束通話
          </HangupButton>
        </>
      ) : (
        <StartButton
          ref={webcamButton}
          onClick={() => {
            setShoeVideo(true);
            start();
          }}
        >
          開啟 1 to 1 通話
        </StartButton>
      )} */}
        <VideoAndChatBox>
          {typeof firstData.isbn === "string" && (
            <LiveChat id={firstData.isbn} />
          )}
          {typeof firstData.isbn === "string" && (
            <ChatRoomComponent id={firstData.isbn} chatdata={chatdata} />
          )}
        </VideoAndChatBox>
      </GroupPageWrap>
    </GroupPage>
  );
}

const PlayVideo = styled.video`
  width: 100%;
  aspect-ratio: 4/3;
  background-color: ${(props) => props.theme.grey};
`;
const OpenChatBTN = styled.button`
  background-color: ${(props) => props.theme.greyBlue};
  color: ${(props) => props.theme.black};
  border-radius: 10px;
  font-size: ${(props) => props.theme.fz}px;
  cursor: pointer;
  padding: 10px 20px;
`;
const MyVideoBox = styled.div`
  margin-top: 30px;
  width: 30%;
  display: flex;
  flex-direction: column;
  align-items: center;
  align-self: end;
  @media screen and (max-width: 480px) {
    width: 100%;
  }
`;
const MyLocalVideo = styled(PlayVideo)`
  transform: scaleX(-1);
`;
const OpenVideoBox = styled.div`
  width: 50%;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
`;
const VideosBox = styled.div`
  padding: 10px 10px;
  max-width: 600px;
  display: flex;
  flex-direction: column;
`;
const OpenVideoImg = styled(Image)``;
const VideoControls = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: end;
  align-self: end;
  height: 50px;
`;
interface SoundProps {
  sound?: boolean;
}
interface CameraProps {
  camera: boolean;
}
const SoundControl = styled.div<SoundProps>`
  background-image: url(${microPhone.src});
  background-size: 100%;
  background-position: center center;
  width: 30px;
  height: 30px;
  position: relative;
  border: solid 1px ${(props) => props.theme.greyGreen};
  border-radius: 5px;
  background-color: ${(props) => props.theme.grey};
  cursor: pointer;
  &::after {
    content: ${(props) => (props.sound ? `''` : null)};
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    transform: rotate(-45deg) translate(0%, -50%);
    border-bottom: solid 3px ${(props) => props.theme.red};
  }
`;
const CameraControl = styled(SoundControl)<CameraProps>`
  background-image: url(${video.src});
  &::after {
    content: ${(props) => (props.camera ? `''` : null)};
    transform: rotate(-45deg) translate(0%, -40%);
  }
`;
const PhoneControl = styled(SoundControl)`
  margin-right: auto;
  background-image: url(${phone.src});
  &::after {
    content: "";
    transform: rotate(-45deg) translate(0%, -40%);
  }
`;
const VideoChatName = styled.h4`
  font-size: ${(props) => props.theme.fz * 1.5}px;
  text-align: center;
`;
const Participants = styled.ul`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`;
interface ParticipentProps {
  length: number;
}
const Participant = styled.li<ParticipentProps>`
  height: auto;
  width: ${(props) => {
    if (props.length === 1) {
      return "100%";
    } else if (props.length === 2) {
      return "50%";
    } else {
      return "32%";
    }
  }};
  @media screen and (max-width: 576px) {
    width: ${(props) => {
      if (props.length === 1) {
        return "100%";
      } else {
        return "48%";
      }
    }};
  }
  @media screen and (max-width: 480px) {
    width: 100%;
  }
`;

interface VideoProps extends VideoHTMLAttributes<HTMLVideoElement> {
  srcObject: MediaStream;
}
function VideoConponent({ srcObject, ...props }: VideoProps) {
  const refVideo = useCallback(
    (node: HTMLVideoElement) => {
      if (node) node.srcObject = srcObject;
    },
    [srcObject]
  );

  return <PlayVideo ref={refVideo} {...props} autoPlay playsInline />;
}

function LiveChat({ id }: { id: string }) {
  const db = getDatabase();
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [openChat, setOpenChat] = useState(false);
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const participantsRef = useRef<string[]>([]);
  const videoStreamsRef = useRef<{ [key: string]: MediaStream }>();
  const rtcSessionRef = useRef<RTCFireSession>();

  const allVideoStream = useRef<{
    [key: string]: MediaStream;
  }>();
  const otherParticipant = useRef<string[]>([]);

  const [participants, setParticipants] = useState<MemberInfo[]>([]);
  const [videoStreams, setVideoStreams] = useState<{
    [key: string]: MediaStream;
  }>({});

  const [sound, setSound] = useState(false);
  const [camera, setCamera] = useState(false);

  const updatePeers = async (
    participants: string[],
    videoStreams: { [key: string]: MediaStream }
  ) => {
    const otherparticipant = participants.filter((pid) => pid !== userInfo.uid);
    const requests = otherparticipant.map(async (pid: string) => {
      return await getMemberData(pid);
    });
    const newParticipants = (await Promise.all(requests)) as MemberInfo[];
    otherParticipant.current = participants;
    setParticipants(newParticipants);
    allVideoStream.current = videoStreams;
    setVideoStreams(videoStreams);
  };

  const setupVideo = async () => {
    const livechatRef = ref(db, `livechat/${id}/participants`);
    videoStreamsRef.current = {};
    let meRef = child(livechatRef, userInfo.uid!);
    update(meRef, { joined: true });
    onDisconnect(meRef).set(null);

    rtcSessionRef.current = rtcFireSession({
      myId: userInfo.uid!,
      negotiationRef: ref(db, `livechat/${id}/negotiations`),
      onMyStream: (stream) => {
        return (myVideoRef.current!.srcObject = stream);
      },
      onParticipantStream: (pid, stream) => {
        videoStreamsRef.current![pid] = stream!;
        updatePeers(participantsRef.current, videoStreamsRef.current!);
      },
    });
    onValue(livechatRef, (snap) => {
      participantsRef.current = Object.keys(snap.val() || {});
      rtcSessionRef.current!.participants = participantsRef.current;
      updatePeers(participantsRef.current, videoStreamsRef.current!);
    });
  };
  const hanUp = () => {
    (myVideoRef.current!.srcObject as MediaStream)
      .getTracks()
      .forEach((track: { stop: () => void }) => track.stop());
    remove(ref(db, `livechat/${id}/participants/${userInfo.uid}`));
    remove(ref(db, `livechat/${id}/negotiations/${userInfo.uid}`));
  };
  const toggleMediaStream = (type: "video" | "audio", state: boolean) => {
    (myVideoRef.current?.srcObject as MediaStream)
      .getTracks()
      .forEach((track) => {
        if (track.kind === type) {
          track.enabled = state;
        }
      });
  };
  const mute = () => {
    toggleMediaStream("audio", sound);
  };
  const screen = () => {
    toggleMediaStream("video", camera);
  };
  return (
    <>
      {openChat ? (
        <VideosBox>
          <Participants>
            {participants &&
              participants.map((participant: MemberInfo) => (
                <Participant length={participants.length} key={participant.uid}>
                  <VideoConponent srcObject={videoStreams[participant.uid!]} />
                  <VideoChatName>{participant.name}</VideoChatName>
                </Participant>
              ))}
          </Participants>
          <MyVideoBox>
            <MyLocalVideo
              key="myvideo"
              ref={myVideoRef}
              muted
              autoPlay
              playsInline
            />
            <VideoControls>
              <PhoneControl
                onClick={() => {
                  setOpenChat(false);
                  hanUp();
                }}
              />
              <SoundControl
                sound={sound}
                onClick={() => {
                  setSound((prev) => !prev);
                  mute();
                }}
              />
              <CameraControl
                camera={camera}
                onClick={() => {
                  setCamera((prev) => !prev);
                  screen();
                }}
              />
            </VideoControls>
          </MyVideoBox>
        </VideosBox>
      ) : (
        ""
      )}
      {openChat || (
        <OpenVideoBox>
          <OpenVideoImg
            src={videoChat}
            alt="videoChat"
            width={200}
            height={200}
          />
          <OpenChatBTN
            onClick={() => {
              setOpenChat(true);
              setupVideo();
              setSound(false);
              setCamera(false);
            }}
          >
            OPEN!
          </OpenChatBTN>
        </OpenVideoBox>
      )}
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const url = (params as ParsedUrlQuery).id as string;
  const bookIsbn = url.split("id:")[1];
  const firstData = await getFirstBook(bookIsbn);
  const firstChat = await getFirstChat(bookIsbn);
  return {
    props: { firstData, firstChat: JSON.stringify(firstChat) },
  };
};
