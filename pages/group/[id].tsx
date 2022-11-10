import styled from "styled-components";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { getBookInfo, BookInfo, db } from "../../utils/firebaseFuncs";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

import { useSelector } from "react-redux";
import { RootState } from "../../store";
import Link from "next/link";
import { BookComponent } from "../book/[id]";
import ChatRoomComponent from "../../components/group_chat";

const GoToReview = styled(Link)`
  padding: 5px 10px;
  border: solid 1px;
  display: inline-block;
`;

const VideoBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;
const Title3 = styled.h3``;
const Video = styled.video`
  width: 40vw;
  height: 30vw;
  margin: 2rem;
  background: rgb(44, 62, 80);
  margin: 0;
`;
const MyVideo = styled(Video)`
  transform: scaleX(-1);
`;
const StartButton = styled.button`
  padding: 5px 10px;
  border: solid 1px;
  cursor: pointer;
`;
const CreateButton = styled(StartButton)``;
const AnswerButton = styled(StartButton)``;
const HangupButton = styled(StartButton)``;

const RoomNumberInput = styled.input``;

export default function Group() {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [bookData, setBookData] = useState<BookInfo>({});
  const router = useRouter();
  const { id } = router.query;
  const [showVideo, setShoeVideo] = useState<boolean>(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remotoVideoRef = useRef<HTMLVideoElement>(null);
  const answeInputrRef = useRef<HTMLInputElement>(null);

  const webcamButton = useRef<HTMLButtonElement>(null);
  const webcamCreateButton = useRef<HTMLButtonElement>(null);
  const webcamAnswerButton = useRef<HTMLButtonElement>(null);
  const webcamHangupButton = useRef<HTMLButtonElement>(null);
  const pcRef = useRef<RTCPeerConnection>();

  useEffect(() => {
    if (typeof id === "string") {
      getBookInfo(id.replace("id:", "")).then(
        (data: BookInfo | undefined) => data && setBookData(data)
      );
    }
  }, [id]);
  useEffect(() => {
    if (!localVideoRef.current) return;
    const localRemove = localVideoRef.current;
    if (!remotoVideoRef.current) return;
    const remotoRemove = remotoVideoRef.current;

    return () => {
      if (pcRef.current && localRemove) {
        (localRemove.srcObject as MediaStream)
          .getTracks()
          .forEach((track: { stop: () => void }) => track.stop());
        if (pcRef.current && remotoRemove) {
          (remotoRemove.srcObject as MediaStream)
            .getTracks()
            .forEach((track: { stop: () => void }) => track.stop());
        }
      }
    };
  });

  const start = async () => {
    const servers = {
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:stun1.l.google.com:19302",
            "stun:stun2.l.google.com:19302",
            "stun:stun3.l.google.com:19302",
            "stun:stun4.l.google.com:19302",
          ],
        },
      ],
      iceCandidatePoolSize: 10,
    };
    const pc = new RTCPeerConnection(servers);
    pcRef.current = pc;
    setTimeout(async () => {
      const webcamVideo = localVideoRef.current;
      const remoteVideo = remotoVideoRef.current;
      const templocalStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      templocalStream.getTracks().forEach((track) => {
        pcRef.current!.addTrack(track, templocalStream);
      });

      webcamVideo!.srcObject = templocalStream;

      const tempremoteStream = new MediaStream();
      pcRef.current!.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          tempremoteStream.addTrack(track);
        });
      };

      remoteVideo!.srcObject = tempremoteStream;
    });
  };
  const create = async () => {
    const callDoc = doc(collection(db, "calls"));
    answeInputrRef.current!.value = callDoc.id;

    // Get candidates for caller, save to db
    pcRef.current!.onicecandidate = async (event) => {
      event.candidate &&
        (await setDoc(
          doc(collection(db, `calls/${callDoc.id}/offerCandidates`)),
          event.candidate.toJSON()
        ));
    };

    // Create offer
    const offerDescription = await pcRef.current!.createOffer();
    await pcRef.current!.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    await setDoc(callDoc, { offer });

    // Listen for remote answer
    const unsubscribe1 = onSnapshot(callDoc, (snapshot) => {
      const data = snapshot.data();
      if (!pcRef.current!.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        pcRef.current!.setRemoteDescription(answerDescription);
      }
    });
    // Listen for remote ICE candidates
    const unsubscribe2 = onSnapshot(
      collection(db, `calls/${callDoc.id}/answerCandidates`),
      (snapshot) => {
        snapshot.docChanges().forEach((change: any) => {
          if (change.type === "added") {
            const candidate = new RTCIceCandidate(change.doc.data());
            pcRef.current!.addIceCandidate(candidate);
          }
        });
      }
    );
    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  };
  const answer = async () => {
    const callId = answeInputrRef.current!.value;
    const callDoc = await getDoc(doc(db, "calls", callId));

    pcRef.current!.onicecandidate = async (event) => {
      event.candidate &&
        (await setDoc(
          doc(collection(db, `calls/${callDoc.id}/offerCandidates`)),
          event.candidate.toJSON()
        ));
    };

    const callData = callDoc.data();

    const offerDescription = callData!.offer;
    await pcRef.current!.setRemoteDescription(
      new RTCSessionDescription(offerDescription)
    );

    const answerDescription = await pcRef.current!.createAnswer();
    await pcRef.current!.setLocalDescription(answerDescription);

    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    };

    await updateDoc(doc(db, "calls", callId), { answer });

    // Listen to offer candidates

    const unsubscribe3 = onSnapshot(
      collection(db, `calls/${callDoc.id}/offerCandidates`),
      (snapshot) => {
        snapshot!
          .docChanges()
          .forEach((change: { type: string; doc: { data: () => any } }) => {
            if (change.type === "added") {
              let data = change.doc.data();
              pcRef.current!.addIceCandidate(new RTCIceCandidate(data));
            }
          });
      }
    );
    return () => {
      unsubscribe3();
    };
  };
  const hangup = async () => {
    if (pcRef.current && localVideoRef.current && remotoVideoRef.current) {
      (localVideoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((track: { stop: () => void }) => track.stop());
      (remotoVideoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((track: { stop: () => void }) => track.stop());
      setShoeVideo(false);
    }
  };

  return (
    <>
      {/* <video src=""></video> */}
      <BookComponent data={bookData} />
      {typeof id === "string" && (
        <GoToReview href={`/book/id:${id.replace("id:", "")}`}>
          Go to Review Page
        </GoToReview>
      )}
      <VideoBox>
        {showVideo && (
          <>
            <Title3>Local Stream</Title3>
            <br />
            <MyVideo ref={localVideoRef} autoPlay playsInline />
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
      )}
      {typeof id === "string" && (
        <ChatRoomComponent id={id.replace("id:", "")} />
      )}
    </>
  );
}
