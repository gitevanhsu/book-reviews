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
} from "../../utils/firebaseFuncs";
import { useDispatch, useSelector } from "react-redux";
import { userSignIn } from "../../slices/userInfoSlice";
import { doc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { RootState } from "../../store";

interface NoticeType {
  friendsRequests?: MemberInfo[];
}

interface Invitation {
  invitor?: string;
  receiver?: string;
  state?: string;
}

const Ul = styled.ul`
  display: flex;
`;
const Li = styled.li`
  margin: 10px 20px;
`;
const NoticeBox = styled.div``;
const Notice = styled.div``;
const FriendRequestBox = styled.div``;
const Invitor = styled.h4``;
const AcceptButton = styled.button`
  border: solid 1px;
  padding: 5px 10px;
  cursor: pointer;
`;

const RejectButton = styled(AcceptButton)``;

function NoticeComponent() {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [notices, setNotice] = useState<NoticeType>();

  useEffect(() => {
    let unOnSnapshot: Function;
    let allNotices: NoticeType = {
      friendsRequests: [],
    };
    const getNotice = async () => {
      unOnSnapshot = onSnapshot(
        query(
          friendRequestRef,
          where("receiver", "==", userInfo.uid),
          where("state", "==", "pending")
        ),
        async (querySnapshot) => {
          const notices: Invitation[] = [];
          const invitors: string[] = [];
          const newFriendsRequests: MemberInfo[] = [];
          querySnapshot.forEach((doc) => {
            notices.push(doc.data());
            invitors.push(doc.data().invitor);
          });
          const requests = invitors.map(async (userId) => {
            const docData = await getDoc(doc(db, "members", userId));
            return docData.data();
          });
          const allMemberInfo = (await Promise.all(requests)) as MemberInfo[];

          allMemberInfo.forEach((memberInfo) => {
            if (memberInfo) {
              newFriendsRequests.push(memberInfo);
            }
          });
          setNotice({ ...allNotices, friendsRequests: newFriendsRequests });
        }
      );
    };
    getNotice();
    return () => {
      if (unOnSnapshot) {
        unOnSnapshot();
      }
    };
  }, [userInfo.uid]);
  return (
    <NoticeBox>
      <Notice>
        {notices &&
          notices.friendsRequests &&
          notices.friendsRequests.map((invitor) => {
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
      </Notice>
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
          <Link href="/group/">Groups</Link>
        </Li>
        <Li>
          <Link href="/search/">搜尋</Link>
        </Li>
      </Ul>
      <NoticeComponent />
    </>
  );
}
