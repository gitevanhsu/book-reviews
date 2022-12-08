import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";

import { useDispatch, useSelector } from "react-redux";
import { doc, onSnapshot, query, where } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import styled from "styled-components";
import Swal from "sweetalert2";

import { userSignIn, userSignOut } from "../../slices/userInfoSlice";
import { RootState } from "../../store";
import {
  getMemberData,
  friendRequestRef,
  acceptFriendRequest,
  rejectFriendRequest,
  MemberInfo,
  noticeRef,
  NoticeData,
  removeNotice,
  signout,
  db,
} from "../../utils/firebaseFuncs";
import {
  male,
  acceptImg,
  rejectImg,
  newLinkImg,
  menu,
  bell,
  friends,
} from "../../utils/imgs";

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

const FriendRequestBox = styled.div`
  padding: 0 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
`;

const ResponseImages = styled.div`
  margin-left: auto;
  display: flex;
  width: 60px;
`;
const ResImg1 = styled(Image)`
  background-color: ${(props) => props.theme.yellow};
  cursor: pointer;
  border-radius: 5px;
  &:hover {
    background-color: ${(props) => props.theme.darkYellow};
  }
`;
const ResImg2 = styled(ResImg1)`
  margin-left: 10px;
  background-color: ${(props) => props.theme.red};
  &:hover {
    background-color: ${(props) => props.theme.red};
  }
`;
const ResImg3 = styled(ResImg1)`
  background-color: ${(props) => props.theme.yellow};
`;

const Notice = styled.div`
  padding: 0 10px;
  display: flex;
  justify-content: start;
  align-items: center;
  margin: 20px 0;
`;
const MemberName = styled.h3`
  letter-spacing: 2px;
  margin-bottom: 10px;
  font-size: ${(props) => props.theme.fz3};
  @media screen and (max-width: 768px) {
    font-size: ${(props) => props.theme.fz4};
  }
`;
const MemberImg = styled(Image)`
  margin-right: 20px;
  border-radius: 50%;
`;
const NoticeMessage = styled.p`
  font-size: ${(props) => props.theme.fz5};
  letter-spacing: 2px;
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

function FriendRequestComponent({ data }: { data: MemberInfo }) {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  return (
    <>
      {data.img && (
        <Link href={`/member/id:${data.uid}`}>
          <MemberImg
            src={data?.img || male}
            alt="number Img"
            width={40}
            height={40}
          />
        </Link>
      )}
      <NoticeContent>
        <MemberName>{data.name}</MemberName>
        <NoticeMessage>向您發出好友邀請</NoticeMessage>
      </NoticeContent>
      <ResponseImages>
        <ResImg1
          src={acceptImg}
          alt="acceptImg"
          width={25}
          height={25}
          onClick={() => {
            if (userInfo.uid && data.uid)
              acceptFriendRequest(userInfo.uid, data.uid);
          }}
        />
        <ResImg2
          src={rejectImg}
          alt="rejectImg"
          width={25}
          height={25}
          onClick={() => {
            if (userInfo.uid && data.uid) {
              rejectFriendRequest(userInfo.uid, data.uid);
            }
          }}
        />
      </ResponseImages>
    </>
  );
}

function CommentNoticeComponent({ data }: { data: NoticeData }) {
  return (
    <>
      <Link href={`/member/id:${data.poster}`}>
        <MemberImg
          src={data.posterInfo?.img! || male}
          alt="member Img"
          width={40}
          height={40}
        ></MemberImg>
      </Link>
      <NoticeContent>
        <MemberName>{data?.posterInfo?.name}</MemberName>
        <NoticeMessage>回應了您的評論</NoticeMessage>
      </NoticeContent>
      <ResponseImages>
        <Link href={data?.postUrl}>
          <ResImg3 src={newLinkImg} alt="delete" width={25} height={25} />
        </Link>
        <ResImg2
          src={rejectImg}
          alt="delete"
          width={25}
          height={25}
          onClick={() => {
            removeNotice(data);
          }}
        />
      </ResponseImages>
    </>
  );
}

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
                  <Notice key={data.noticeid}>
                    <CommentNoticeComponent data={data} />
                  </Notice>
                ) : (
                  <FriendRequestBox key={data.uid}>
                    <FriendRequestComponent data={data} />
                  </FriendRequestBox>
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

const FriendsImg = styled(Image)`
  height: 100%;
  display: inline-block;
  padding-top: 10px;
  border-radius: 50%;
`;
const FriendsName = styled.p`
  font-size: ${(props) => props.theme.fz3};
  margin-left: 10px;
  @media screen and (max-width: 768px) {
    font-size: ${(props) => props.theme.fz4};
  }
`;
const NoFriends = styled.p`
  font-size: ${(props) => props.theme.fz4};
  width: 100%;
  text-align: center;
`;
const FriendsUl = styled.ul`
  overflow: hidden;
  position: absolute;
  right: 0;
  top: 100%;
  background-color: ${(props) => props.theme.white};
  box-shadow: 0px 2px 10px #00000030;
  border-radius: 0 0 10px 10px;
  transition: height 0.2s;
  color: ${(props) => props.theme.black};
`;

const FriendsLi = styled.li`
  padding: 0px 10px;
  align-items: center;
  display: flex;
  width: 210px;
  font-size: ${(props) => props.theme.fz4};
  border-bottom: 1px solid ${(props) => props.theme.grey};
  color: ${(props) => props.theme.black};
  height: 0;
  opacity: 0;
  cursor: pointer;
  &:hover {
    background-color: ${(props) => props.theme.yellow};
  }
`;
const FriendsBox = styled.div`
  position: relative;
  height: 100%;
  z-index: 5;
  margin-right: 20px;
  overflow: hidden;
  &:hover {
    overflow: visible;
  }
  &:hover ${FriendsLi} {
    padding: 10px 10px;
    height: 70px;
    transition: 0.3s;
    opacity: 1;
  }
`;
const FriendsWrap = styled.div``;

function FriendsComponent() {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [friendList, setFriendList] = useState<MemberInfo[]>([]);
  const router = useRouter();
  useEffect(() => {
    const unSubscriptionFriendList = onSnapshot(
      doc(db, "members", userInfo.uid!),
      async (doc) => {
        const memberInfo = doc.data() as MemberInfo;
        if (memberInfo?.friends && memberInfo.friends.length > 0) {
          const request = memberInfo.friends.map(async (uids) => {
            const res = await getMemberData(uids);
            return res as MemberInfo;
          });
          const allMemberInfo = await Promise.all(request);
          setFriendList(allMemberInfo);
        }
      }
    );

    if (!userInfo.isSignIn) setFriendList([]);
    return () => {
      unSubscriptionFriendList();
    };
  }, [userInfo.isSignIn, userInfo.uid]);

  const gotoMemberPage = (uid: string) => {
    uid
      ? router.push(`/member/id:${uid}`)
      : router.push(`/book/id:9781473537804`);
  };
  return (
    <FriendsBox>
      <FriendsWrap>
        <FriendsImg src={friends} width={27} height={27} alt="MemberAvatar" />
        <FriendsUl>
          {friendList.length > 0 ? (
            friendList.map((friend) => {
              return (
                <FriendsLi
                  key={friend.uid}
                  onClick={() => {
                    gotoMemberPage(friend.uid!);
                  }}
                >
                  <FriendsImg
                    src={friend.img!}
                    alt="memberImg"
                    width={40}
                    height={40}
                  />
                  <FriendsName>{friend.name}</FriendsName>
                </FriendsLi>
              );
            })
          ) : (
            <FriendsLi>
              <NoFriends>去討論區認識新朋友吧！</NoFriends>
            </FriendsLi>
          )}
        </FriendsUl>
      </FriendsWrap>
    </FriendsBox>
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
          <FriendsComponent />
          <NoticeComponent />
        </>
      )}
    </Header>
  );
}
