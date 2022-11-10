import male from "/public/img/reading-male.png";
import x from "/public/img/VectorX.png";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getMemberData,
  friendRequestRef,
  db,
  acceptFriendRequest,
  rejectFriendRequest,
  MemberInfo,
  noticeRef,
  NoticeData,
  removeNotice,
} from "../../utils/firebaseFuncs";
import { useDispatch, useSelector } from "react-redux";
import { userSignIn } from "../../slices/userInfoSlice";
import { doc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { RootState } from "../../store";

const Ul = styled.ul`
  display: flex;
`;
const Li = styled.li`
  margin: 10px 20px;
`;
const NoticeBox = styled.div``;
const FriendRequests = styled.div``;
const FriendRequestBox = styled.div``;
const Invitor = styled.h4``;
const AcceptButton = styled.button`
  border: solid 1px;
  padding: 5px 10px;
  cursor: pointer;
`;

const RejectButton = styled(AcceptButton)``;
const Notices = styled.div``;
const Notice = styled.div``;
const PosterData = styled.div``;
const PosterName = styled.h3``;
const PosterImg = styled(Image)``;
const NoticeMessage = styled.p``;
const RemoveButton = styled(Image)`
  background-color: #f00;
  padding: 3px;
  margin-left: auto;
  cursor: pointer;
`;

function NoticeComponent() {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [notices, setNotice] = useState<NoticeData[]>([]);
  const [friendRequest, setFriendRequest] = useState<MemberInfo[]>();

  useEffect(() => {
    let unsub1: Function;
    const getFriendRequest = async () => {
      unsub1 = onSnapshot(
        query(
          friendRequestRef,
          where("receiver", "==", userInfo.uid),
          where("state", "==", "pending")
        ),
        async (querySnapshot) => {
          const invitors = querySnapshot.docs.map((doc) => doc.data().invitor);
          const newInviteData = invitors.map(
            async (invitor) => await getMemberData(invitor)
          );
          const invitorData = (await Promise.all(
            newInviteData
          )) as MemberInfo[];
          setFriendRequest(invitorData);
        }
      );
    };
    let unsub2: Function;
    const getReviewNotice = async () => {
      unsub2 = onSnapshot(
        query(noticeRef, where("reciver", "==", userInfo.uid)),
        async (querySnapshot) => {
          const notices = querySnapshot.docs.map((doc) => doc.data());
          const members = notices.map(
            async (notice) => await getMemberData(notice.poster)
          );
          const memberDatas = (await Promise.all(members)) as MemberInfo[];
          const newNotices = notices.map(
            (notice, index) =>
              ({
                ...notice,
                posterInfo: memberDatas[index],
              } as NoticeData)
          );
          setNotice(newNotices);
        }
      );
    };
    getFriendRequest();
    getReviewNotice();
    return () => {
      if (unsub1) {
        unsub1();
      }
      if (unsub2) {
        unsub2();
      }
    };
  }, [userInfo.uid]);
  return (
    <NoticeBox>
      <FriendRequests>
        {friendRequest &&
          friendRequest.map((invitor) => {
            return (
              <FriendRequestBox key={invitor && invitor.uid}>
                <Invitor>{invitor.name}向您發出好友邀請</Invitor>
                <AcceptButton
                  onClick={() => {
                    if (userInfo.uid && invitor.uid)
                      acceptFriendRequest(userInfo.uid, invitor.uid);
                  }}
                >
                  接受
                </AcceptButton>
                <RejectButton
                  onClick={() => {
                    if (userInfo.uid && invitor.uid) {
                      rejectFriendRequest(userInfo.uid, invitor.uid);
                    }
                  }}
                >
                  拒絕
                </RejectButton>
              </FriendRequestBox>
            );
          })}
      </FriendRequests>
      <Notices>
        {notices &&
          notices.map((notice) => {
            return (
              <Notice key={`${+notice.time}`}>
                <PosterData>
                  <Link href={`/member/id:${notice.poster}`}>
                    <PosterImg
                      src={
                        notice?.posterInfo && notice?.posterInfo?.img
                          ? notice?.posterInfo?.img
                          : male
                      }
                      alt={
                        notice?.posterInfo && notice?.posterInfo?.name
                          ? notice?.posterInfo.name
                          : "user Img"
                      }
                      width={25}
                      height={25}
                    ></PosterImg>
                  </Link>
                  <PosterName>{notice?.posterInfo?.name}</PosterName>
                </PosterData>
                <NoticeMessage>在您的評論下回應了！</NoticeMessage>
                <Link href={notice?.postUrl}>點擊查看內容</Link>
                <RemoveButton
                  src={x}
                  alt="delete"
                  width={20}
                  height={20}
                  onClick={() => {
                    removeNotice(notice);
                  }}
                />
              </Notice>
            );
          })}
      </Notices>
    </NoticeBox>
  );
}

export function Header() {
  const dispatch = useDispatch();
  useEffect(() => {
    const auth = getAuth();
    const unSubscriptAuthState = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const uid = user.uid;
        const userdata = await getMemberData(uid);
        userdata && dispatch(userSignIn(userdata));
      } else {
      }
    });
    return () => {
      unSubscriptAuthState();
    };
  });
  return (
    <>
      <Ul>
        <Li>
          <Link href="/">Home</Link>
        </Li>
        <Li>
          <Link href="/profile">Profile</Link>
        </Li>
        <Li>
          <Link href="/books/">Books</Link>
        </Li>
        <Li>
          <Link href="/search/">搜尋</Link>
        </Li>
      </Ul>
      <NoticeComponent />
    </>
  );
}
