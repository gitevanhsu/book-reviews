import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";

import { useDispatch, useSelector } from "react-redux";
import { onSnapshot, query, where } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import styled from "styled-components";
import Swal from "sweetalert2";

import { userSignIn, userSignOut } from "../../slices/userInfoSlice";
import { RootState } from "../../store";
import {
  getMemberData,
  friendRequestRef,
  MemberInfo,
  noticeRef,
  NoticeData,
  signout,
  removeNotice,
  acceptFriendRequest,
  rejectFriendRequest,
} from "../../utils/firebaseFuncs";
import { menu, bell } from "../../utils/imgs";
import FriendRequestComponent from "./friendRequest";
import CommentNoticeComponent from "./commentNotice";
import FriendsListComponent from "./friendsList";

const NoticeContent = styled.div`
  white-space: nowrap;
  display: flex;
  flex-direction: column;
`;
const NoNoticeContent = styled(NoticeContent)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 10px;
  height: 50px;
  width: 200px;
  font-size: ${(props) => props.theme.fz4};
  transition: 0.3s;
  height: 0;
`;
interface MesProps {
  mesCount?: number;
}
const MesBox = styled.div<MesProps>`
  margin-right: 20px;
  position: relative;
  &::after {
    content: ${(props) =>
      props.mesCount !== 0 ? `'` + `${props.mesCount}` + `'` : null};
    font-size: ${(props) => props.theme.fz4};
    display: inline-block;
    background-color: ${(props) => props.theme.red};
    color: ${(props) => props.theme.white};
    position: absolute;
    text-align: center;
    line-height: 15px;
    width: 15px;
    height: 15px;
    bottom: -5px;
    right: -8px;
    border-radius: 50%;
  }
  &:hover > ${NoNoticeContent} {
    transition: 0.3s;
    height: 80px;
  }
`;
const Header = styled.header`
  padding-top: 10px;
  width: 100%;
  border-bottom: solid 1px ${(props) => props.theme.grey};
  height: 60px;
  position: relative;
  display: flex;
  align-items: center;
  background: ${(props) => props.theme.white};
`;
const Ul = styled.ul`
  display: flex;
  align-items: center;
  padding: 0 20px;
  height: 100%;
  overflow: hidden;
`;
interface LiProps {
  nowPath: boolean;
}
const Li = styled.li<LiProps>`
  list-style: none;
  display: inline-block;
  height: 100%;
  width: 150px;
  letter-spacing: 10px;
  text-indent: 10px;
  font-weight: 500;
  background-color: ${(props) =>
    props.nowPath ? props.theme.darkYellow : props.theme.grey};
  display: flex;
  align-items: center;
  border-radius: 10px 10px 0 0;
  font-size: ${(props) => props.theme.fz4};
  &:hover {
    filter: brightness(${(props) => (props.nowPath ? 1 : 0.9)});
  }
  & + & {
    margin-left: 20px;
  }
  @media screen and (max-width: 576px) {
    width: 80px;
  }
  @media screen and (max-width: 480px) {
    font-size: ${(props) => props.theme.fz5};
    width: 60px;
    & + & {
      margin-left: 10px;
    }
  }
`;
const PageLink = styled(Link)`
  justify-content: center;
  display: inline-block;
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  text-decoration: none;
  color: ${(props) => props.theme.black};
`;
interface MesBoxProps {
  isOpen?: boolean;
  notice?: number;
}
const NoticeBox = styled.div<MesBoxProps>`
  position: absolute;
  top: calc(100% + 11px);
  height: ${(props) => (props.isOpen ? `${props.notice! * 250}px` : "0px")};
  min-height: ${(props) => (props.isOpen ? "30px" : "0px")};
  right: -15px;
  border-radius: 0 0 10px 10px;
  overflow: auto;
  z-index: 10;
  background-color: ${(props) => props.theme.white};
  box-shadow: 0px 2px 10px #00000030;
  transition: height 0.2s;
  color: ${(props) => props.theme.black};
`;
const MesImg = styled(Image)`
  opacity: 0.7;
  cursor: pointer;
  &:hover ${NoticeBox} {
    right: -28px;
  }
`;

const ProfileUl = styled.ul`
  background-color: ${(props) => props.theme.white};
  position: absolute;
  border-radius: 0 0 10px 10px;
  box-shadow: 0px 2px 10px #00000030;
  top: 100%;
  right: 0;
  width: 150px;
  overflow: hidden;
`;
const ProfileLink = styled(Link)``;

interface ProfileLiProps {
  nowPath?: boolean;
}
const ProfileLi = styled.li<ProfileLiProps>`
  padding: 0 10px;
  width: 100%;
  display: flex;
  align-items: center;
  text-align: right;
  cursor: pointer;
  height: 0;
  font-size: ${(props) => props.theme.fz4};
  opacity: 0;
  border-bottom: 1px solid ${(props) => props.theme.grey};
  transition: 0.3s;
  color: ${(props) => props.theme.black};
  background-color: ${(props) =>
    props.nowPath ? props.theme.darkYellow : "transparent"};
  &:hover {
    background-color: ${(props) => props.theme.darkYellow};
  }
  & > ${ProfileLink} {
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    color: ${(props) => props.theme.black};
  }
`;
const ProfileBox = styled.div`
  position: relative;
  height: 100%;
  z-index: 5;
  margin-left: auto;
  margin-right: 20px;
  overflow: hidden;
  &:hover {
    overflow: visible;
  }
  &:hover ${ProfileLi} {
    height: 50px;
    transition: 0.2s;
    opacity: 1;
  }
`;

const ProfileImgWrap = styled.div``;
const ProfileImgImage = styled(Image)`
  opacity: 0.7;
  height: 100%;
  display: inline-block;
  padding-top: 10px;
`;

function NoticeComponent() {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [notices, setNotice] = useState<NoticeData[]>([]);
  const [friendRequest, setFriendRequest] = useState<MemberInfo[]>([]);
  const [openMsg, setOpenMsg] = useState(false);
  const [allNotice, setAllNotice] = useState<(NoticeData | MemberInfo)[]>([]);
  useEffect(() => {
    let allNotices: (NoticeData | MemberInfo)[] = [];
    const unSubscriptFriendRequest = onSnapshot(
      query(
        friendRequestRef,
        where("receiver", "==", userInfo.uid),
        where("state", "==", "pending")
      ),
      async (querySnapshot) => {
        const inviters = querySnapshot.docs.map((doc) => doc.data().invitor);
        const newInviterData = inviters.map(
          async (inviter) => await getMemberData(inviter)
        );
        const inviterData = (await Promise.all(newInviterData)) as MemberInfo[];
        allNotices.push(...inviterData);
        setFriendRequest(inviterData);
      }
    );
    const unSubscriptNotification = onSnapshot(
      query(noticeRef, where("reciver", "==", userInfo.uid)),
      async (querySnapshot) => {
        const notices = querySnapshot.docs.map((doc) => doc.data());
        const members = notices.map(
          async (notice) => await getMemberData(notice.poster)
        );
        const memberData = (await Promise.all(members)) as MemberInfo[];
        const newNotices = notices.map(
          (notice, index) =>
            ({
              ...notice,
              posterInfo: memberData[index],
            } as NoticeData)
        );
        allNotices.push(...newNotices);
        setNotice(newNotices);
      }
    );
    return () => {
      unSubscriptFriendRequest();
      unSubscriptNotification();
    };
  }, [userInfo.uid]);

  useEffect(() => {
    setAllNotice([...notices, ...friendRequest]);
  }, [notices, friendRequest]);

  const onRemoveNotice = (data: NoticeData) => {
    removeNotice(data);
  };

  const onAcceptFriendRequest = (userInfo: MemberInfo, data: MemberInfo) => {
    if (userInfo.uid && data.uid) acceptFriendRequest(userInfo.uid, data.uid);
  };
  const onRejectFriendRequest = (userInfo: MemberInfo, data: MemberInfo) => {
    if (userInfo.uid && data.uid) rejectFriendRequest(userInfo.uid, data.uid);
  };

  return (
    <>
      {userInfo.isSignIn && (
        <MesBox
          mesCount={allNotice.length}
          onMouseEnter={() => {
            setOpenMsg(true);
          }}
          onMouseLeave={() => {
            setOpenMsg(false);
          }}
        >
          <MesImg src={bell} alt="Message" width={27} height={27} />
          {allNotice.length > 0 ? (
            <NoticeBox isOpen={openMsg} notice={allNotice.length > 0 ? 1 : 0}>
              {allNotice.map((data) =>
                "noticeid" in data ? (
                  <CommentNoticeComponent
                    key={data.noticeid}
                    onRemoveNotice={onRemoveNotice}
                    data={data}
                  />
                ) : (
                  <FriendRequestComponent
                    key={data.uid}
                    data={data}
                    onAcceptFriendRequest={onAcceptFriendRequest}
                    onRejectFriendRequest={onRejectFriendRequest}
                  />
                )
              )}
            </NoticeBox>
          ) : (
            <NoticeBox isOpen={openMsg}>
              <NoNoticeContent>目前沒有通知喔！</NoNoticeContent>
            </NoticeBox>
          )}
        </MesBox>
      )}
    </>
  );
}

function MemberComponent() {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const dispatch = useDispatch();
  const router = useRouter();
  return (
    <ProfileBox>
      <ProfileImgWrap>
        <ProfileImgImage src={menu} width={27} height={27} alt="MemberAvatar" />
        <ProfileUl>
          <ProfileLi nowPath={router.asPath === "/profile"}>
            <ProfileLink href="/profile">
              {userInfo.isSignIn ? "個人頁面" : "登入"}
            </ProfileLink>
          </ProfileLi>
          {userInfo.isSignIn && (
            <ProfileLi
              onClick={() => {
                Swal.fire({
                  title: "確定登出嗎？",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#3085d6",
                  cancelButtonColor: "#d33",
                  confirmButtonText: "確認登出",
                  cancelButtonText: "取消",
                }).then((result) => {
                  if (result.isConfirmed) {
                    Swal.fire({
                      icon: "success",
                      title: "登出成功！",
                      text: "成功刪除評價 / 評論。",
                      showConfirmButton: false,
                      timer: 1500,
                    });
                    signout();
                    dispatch(
                      userSignOut({
                        uid: "",
                        name: "",
                        email: "",
                        intro: "",
                      })
                    );
                  }
                });
              }}
            >
              登出
            </ProfileLi>
          )}
        </ProfileUl>
      </ProfileImgWrap>
    </ProfileBox>
  );
}

export function HeaderComponent() {
  const dispatch = useDispatch();
  const router = useRouter();
  const path = router.pathname;
  const userInfo = useSelector((state: RootState) => state.userInfo);

  useEffect(() => {
    const auth = getAuth();
    const unSubscriptAuthState = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const uid = user.uid;
        const userData = await getMemberData(uid);
        userData && dispatch(userSignIn(userData));
      }
    });
    return () => {
      unSubscriptAuthState();
    };
  }, [dispatch]);
  return (
    <Header>
      <Ul>
        <Li nowPath={path === "/"}>
          <PageLink href="/">首頁</PageLink>
        </Li>
        <Li nowPath={path === "/books"}>
          <PageLink href="/books">書籍</PageLink>
        </Li>
      </Ul>
      <MemberComponent />
      {userInfo.isSignIn && (
        <>
          <FriendsListComponent />
          <NoticeComponent />
        </>
      )}
    </Header>
  );
}
