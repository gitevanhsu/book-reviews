import {
  useCallback,
  useEffect,
  useRef,
  useState,
  VideoHTMLAttributes,
} from "react";
import { GetServerSideProps } from "next/types";
import { useRouter } from "next/router";
import { ParsedUrlQuery } from "querystring";
import Link from "next/link";
import Image from "next/image";

import styled from "styled-components";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
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

import { RootState } from "../../store";
import { BookComponent } from "../book/[id]";
import ChatRoomComponent from "../../components/group_chat";
import {
  BookInfo,
  getMemberData,
  MemberInfo,
  getFirstBook,
  getFirstChat,
  ChatMessage,
} from "../../utils/firebaseFuncs";
import {
  openBook,
  videoChat,
  microPhone,
  video,
  phone,
} from "../../utils/imgs";

const GroupPage = styled.div`
  width: 100%;
  min-height: calc(100vh - 50px);
  background-color: ${(props) => props.theme.grey};
  padding: 50px 30px;
`;
const GroupPageWrap = styled.div`
  max-width: 1280px;
  margin: 0 auto;
`;
const GoToReviewBox = styled(Link)`
  display: inline-block;
`;
const GoToReview = styled.p`
  font-size: ${(props) => props.theme.fz4};
  vertical-align: middle;
  display: inline-block;
  margin-left: 10px;
  color: ${(props) => props.theme.black};
  cursor: pointer;
`;
const GoToReviewImg = styled(Image)`
  border-radius: 5px;
  vertical-align: middle;
`;
const VideoAndChatBox = styled.div`
  width: 100%;
  border-top: 1px solid ${(props) => props.theme.grey};
  display: flex;
  justify-content: space-between;
  @media screen and (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;
const Wrap = styled.div`
  z-index: 2;
  top: 25%;
  right: 5px;
  position: fixed;
  margin-left: 20px;
  margin-bottom: 20px;
  background-color: ${(props) => props.theme.darkYellow};
  opacity: 0.9;
  padding: 20px 10px;
  border-radius: 10px;
  color: ${(props) => props.theme.black};
`;

interface GroupProps {
  firstData: BookInfo;
  firstChat: string;
}

export default function Group({ firstData, firstChat }: GroupProps) {
  const chatData = JSON.parse(firstChat) as ChatMessage[];

  return (
    <GroupPage>
      <GroupPageWrap>
        <Wrap>
          <GoToReviewBox href={`/book/id:${firstData.isbn}`}>
            <GoToReviewImg src={openBook} alt="link" width={20} height={20} />
            <GoToReview>返回評論頁面</GoToReview>
          </GoToReviewBox>
        </Wrap>
        <BookComponent data={firstData} />

        <VideoAndChatBox>
          {typeof firstData.isbn === "string" && (
            <LiveChat id={firstData.isbn} />
          )}
          {typeof firstData.isbn === "string" && (
            <ChatRoomComponent id={firstData.isbn} chatData={chatData} />
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
  background-color: ${(props) => props.theme.yellow};
  color: ${(props) => props.theme.black};
  border-radius: 10px;
  font-size: ${(props) => props.theme.fz4};
  cursor: pointer;
  padding: 10px 20px;
  &:hover {
    background-color: ${(props) => props.theme.darkYellow};
  }
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
  background-color: ${(props) => props.theme.red};
  background-image: url(${phone.src});
`;
const VideoChatName = styled.h4`
  font-size: ${(props) => props.theme.fz3};
  text-align: center;
`;
const Participants = styled.ul`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`;
interface ParticipantProps {
  length: number;
}
const Participant = styled.li<ParticipantProps>`
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
function VideoComponent({ srcObject, ...props }: VideoProps) {
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
  const otherParticipantRef = useRef<string[]>([]);
  const [participants, setParticipants] = useState<MemberInfo[]>([]);
  const [videoStreams, setVideoStreams] = useState<{
    [key: string]: MediaStream;
  }>({});
  const [sound, setSound] = useState(false);
  const [camera, setCamera] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let tempVideoTag: HTMLVideoElement | null;
    if (myVideoRef) {
      tempVideoTag = myVideoRef.current;
    }
    return () => {
      if (tempVideoTag) {
        (tempVideoTag.srcObject as MediaStream)
          .getTracks()
          .forEach((track: { stop: () => void }) => track.stop());
        remove(ref(db, `livechat/${id}/participants/${userInfo.uid}`));
        remove(ref(db, `livechat/${id}/negotiations/${userInfo.uid}`));
      }
    };
  }, [db, id, openChat, userInfo.uid]);

  const updatePeers = async (
    participants: string[],
    videoStreams: { [key: string]: MediaStream }
  ) => {
    const otherParticipant = participants.filter((pid) => pid !== userInfo.uid);
    const requests = otherParticipant.map(async (pid: string) => {
      return await getMemberData(pid);
    });
    const newParticipants = (await Promise.all(requests)) as MemberInfo[];
    otherParticipantRef.current = participants;
    setParticipants(newParticipants);
    allVideoStream.current = videoStreams;
    setVideoStreams(videoStreams);
  };

  const setupVideo = async () => {
    const liveChatRef = ref(db, `livechat/${id}/participants`);
    videoStreamsRef.current = {};
    let meRef = child(liveChatRef, userInfo.uid!);
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
    onValue(liveChatRef, (snap) => {
      participantsRef.current = Object.keys(snap.val() || {});
      rtcSessionRef.current!.participants = participantsRef.current;
      updatePeers(participantsRef.current, videoStreamsRef.current!);
    });
  };
  const hangUp = () => {
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
                  <VideoComponent srcObject={videoStreams[participant.uid!]} />
                  <VideoChatName>{participant.name}</VideoChatName>
                </Participant>
              ))}
          </Participants>
          <MyVideoBox>
            <MyLocalVideo
              key="myVideo"
              ref={myVideoRef}
              muted
              autoPlay
              playsInline
            />
            <VideoControls>
              <PhoneControl
                onClick={() => {
                  Swal.fire({
                    icon: "warning",
                    title: "確定要結束通訊嗎？",
                    showCancelButton: true,
                    showCloseButton: true,
                    confirmButtonText: "確定",
                    cancelButtonText: "取消",
                  }).then((result) => {
                    if (result.isConfirmed) {
                      setOpenChat(false);
                      hangUp();
                    }
                  });
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
      ) : null}
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
              if (!userInfo.isSignIn) {
                Swal.fire({
                  icon: "info",
                  title: "請先登入喔！",
                  confirmButtonText: "前往登入",
                }).then((result) => {
                  result.isConfirmed && router.push("/profile");
                });
              } else {
                setOpenChat(true);
                setupVideo();
                setSound(false);
                setCamera(false);
              }
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
  if (firstData) {
    return {
      props: { firstData, firstChat: JSON.stringify(firstChat) },
    };
  } else {
    return {
      notFound: true,
    };
  }
};
