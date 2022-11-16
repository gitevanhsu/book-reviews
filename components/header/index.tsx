import male from "/public/img/reading-male.png";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
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
} from "../../utils/firebaseFuncs";
import { useDispatch, useSelector } from "react-redux";
import { userSignIn, userSignOut } from "../../slices/userInfoSlice";
import { doc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { RootState } from "../../store";
import { useRouter } from "next/router";
import logo from "../../public/img/book-shelf-books-education-learning-school-study-svgrepo-com.svg";
import message from "../../public/img/message.svg";
import acceptImg from "../../public/img/accept.svg";
import rejectImg from "../../public/img/reject.svg";
import linkImg from "../../public/img/new-link.svg";

const LogoImg = styled(Image)``;
interface MesProps {
  mesCount?: number;
}
interface MesBoxProps {
  isOpen?: boolean;
}
interface LiProps {
  nowpath: boolean;
}
const MesBox = styled.div<MesProps>`
  margin-right: 20px;
  position: relative;
  &::after {
    content: ${(props) =>
      props.mesCount !== 0 ? `'` + `${props.mesCount}` + `'` : null};
    font-size: 15px;
    display: inline-block;
    background-color: #f00;
    position: absolute;
    text-align: center;
    line-height: 20px;
    width: 20px;
    height: 20px;
    bottom: 5px;
    right: -5px;
    border-radius: 50%;
  }
`;

const Header = styled.header`
  width: 100%;
  border-bottom: solid 2px rgba(0, 0, 0, 0.5);
  height: 50px;
  position: relative;
  display: flex;
  align-items: center;
  background: linear-gradient(45deg, #fff496, #ffe500);
`;
const Ul = styled.ul`
  display: flex;
  align-items: center;
  margin-left: 30px;
  padding: 0 20px;
  height: 100%;
  overflow: hidden;
`;

const Li = styled.li<LiProps>`
  list-style: none;
  display: inline-block;
  height: 100%;
  width: 100%;
  padding: 0 10px;
  margin: 0;
  background-color: rgba(255, 255, 61, 0.3);
  display: flex;
  align-items: center;
  transform: ${(props) =>
    props.nowpath ? "translateY(10%)" : "translateY(30%)"};
  border-radius: 5px;
  font-size: 20px;
  transition: 0.2s;
  box-shadow: 2px 2px 2px 1px rgba(0, 0, 0, 0.5);
  &:hover {
    transform: translateY(10%);
    background-color: rgba(255, 187, 61, 1);
  }
  & + & {
    margin-left: 20px;
  }
  &:nth-child(1) {
    background-color: #098b00;
  }
  &:nth-child(2) {
    background-color: #f64;
  }
  &:nth-child(3) {
    background-color: #aac;
  }
  &:nth-child(4) {
    background-color: #ccc;
  }
`;
const NoticeBox = styled.div<MesBoxProps>`
  position: absolute;
  top: calc(100% - 1px);
  right: 0;
  width: 400px;
  width: ${(props) => (props.isOpen ? "400px" : "0px")};
  overflow: hidden;
  z-index: 10;
  background: #ffe;
  padding: ${(props) => (props.isOpen ? "5px 20px" : "0px")};
  transition: 0.2s;
  border-radius: 10px;
  box-shadow: 5px 5px 10px #bbb;
`;
const MesImg = styled(Image)`
  cursor: pointer;
  &:hover ${NoticeBox} {
    right: -28px;
  }
`;
const FriendRequests = styled.div`
  max-height: 200px;
  overflow: auto;
  border-bottom: 1px solid #000;
  ::-webkit-scrollbar {
    display: none;
  }
`;
const FriendRequestBox = styled.div`
  display: flex;
  align-items: center;
  margin: 20px 0;
`;
const NoticeContent = styled.div`
  display: flex;
  flex-direction: column;
`;
const ResImgs = styled.div`
  align-self: center;
  display: flex;
  justify-content: space-around;
  width: 100px;
  justify-items: end;
`;
const ResImg1 = styled(Image)`
  background-color: #acff7f;
  cursor: pointer;
  border-radius: 5px;
`;
const ResImg2 = styled(ResImg1)`
  background-color: #ff7f7f;
`;
const ResImg3 = styled(ResImg1)`
  background-color: #7fdfff;
`;
const Notices = styled.div`
  max-height: 200px;
  overflow: auto;
  ::-webkit-scrollbar {
    display: none;
  }
`;
const Notice = styled.div`
  display: flex;
  align-items: center;
  margin: 20px 0;
`;
const PosterData = styled.div``;
const MemberName = styled.h3`
  letter-spacing: 2px;
  font-size: 22px;
`;
const MemberImg = styled(Image)`
  margin-right: 20px;
`;
const NoticeMessage = styled.p`
  font-size: 14px;
  letter-spacing: 2px;
`;
interface OverLayProps {
  isOpen: boolean;
}
const OverLay = styled.div<OverLayProps>`
  display: ${(props) => (props.isOpen ? "block" : "none")};
  position: absolute;
  z-index: 9;
  width: 100vw;
  height: 100vh;
  top: 0;
  right: 0;
  background-color: #000;
  opacity: 0.3;
`;
const ProfileUl = styled.ul`
  border-top: 2px solid #7f7311;
  background-color: #eee;
  position: absolute;
  top: 100%;
  right: 0;
  width: 150px;
  overflow: hidden;
`;
const ProfileLi = styled.li`
  padding: 0 10px;
  width: 100%;
  display: flex;
  align-items: center;
  text-align: right;
  cursor: pointer;
  height: 0px;
  opacity: 0;
  border: 1px solid #000;
  border-top: none;
`;
const ProfileBox = styled.div`
  position: relative;
  cursor: pointer;
  height: 100%;
  z-index: 5;
  margin-left: auto;
  margin-right: 20px;
  &:hover ${ProfileLi} {
    height: 40px;
    transition: 0.3s;
    opacity: 1;
  }
`;

const ProfileImgWrap = styled.div``;
const ProfileImgImage = styled(Image)``;
function NoticeComponent() {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [notices, setNotice] = useState<NoticeData[]>([]);
  const [friendRequest, setFriendRequest] = useState<MemberInfo[]>([]);
  const [openMsg, setOpenMsg] = useState(false);

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
    <>
      {userInfo.isSignIn && (
        <>
          <OverLay
            isOpen={openMsg}
            onClick={() => {
              setOpenMsg((prev) => !prev);
            }}
          />
          <MesBox mesCount={notices.length + friendRequest.length}>
            <MesImg
              src={message}
              alt="Message"
              width={50}
              height={50}
              onClick={() => {
                setOpenMsg((prev) => !prev);
              }}
            />
            {notices.length + friendRequest.length > 0 ? (
              <NoticeBox isOpen={openMsg}>
                <FriendRequests>
                  {friendRequest &&
                    friendRequest.map((invitor) => {
                      return (
                        <FriendRequestBox key={invitor && invitor.uid}>
                          {invitor.img && (
                            <Link href={`/member/id:${invitor.uid}`}>
                              <MemberImg
                                src={
                                  invitor && invitor?.img ? invitor?.img : male
                                }
                                alt={
                                  invitor && invitor?.name
                                    ? invitor.name
                                    : "user Img"
                                }
                                width={50}
                                height={50}
                              />
                            </Link>
                          )}
                          <NoticeContent>
                            <MemberName>{invitor.name}</MemberName>
                            <NoticeMessage>向您發出好友邀請</NoticeMessage>
                          </NoticeContent>
                          <ResImgs>
                            <ResImg1
                              src={acceptImg}
                              alt="acceptImg"
                              width={25}
                              height={25}
                              onClick={() => {
                                if (userInfo.uid && invitor.uid)
                                  acceptFriendRequest(
                                    userInfo.uid,
                                    invitor.uid
                                  );
                              }}
                            />
                            <ResImg2
                              src={rejectImg}
                              alt="rejectImg"
                              width={25}
                              height={25}
                              onClick={() => {
                                if (userInfo.uid && invitor.uid) {
                                  rejectFriendRequest(
                                    userInfo.uid,
                                    invitor.uid
                                  );
                                }
                              }}
                            />
                          </ResImgs>
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
                              <MemberImg
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
                                width={50}
                                height={50}
                              ></MemberImg>
                            </Link>
                          </PosterData>
                          <NoticeContent>
                            <MemberName>{notice?.posterInfo?.name}</MemberName>
                            <NoticeMessage>回應了您的評論</NoticeMessage>
                          </NoticeContent>
                          <ResImgs>
                            <Link href={notice?.postUrl}>
                              <ResImg3
                                src={linkImg}
                                alt="delete"
                                width={25}
                                height={25}
                              />
                            </Link>
                            <ResImg2
                              src={rejectImg}
                              alt="delete"
                              width={25}
                              height={25}
                              onClick={() => {
                                removeNotice(notice);
                              }}
                            />
                          </ResImgs>
                        </Notice>
                      );
                    })}
                </Notices>
              </NoticeBox>
            ) : (
              <NoticeBox isOpen={openMsg}>
                <NoticeContent>目前沒有訊息喔！</NoticeContent>
              </NoticeBox>
            )}
          </MesBox>
        </>
      )}
    </>
  );
}

function MemberComponent() {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const dispatch = useDispatch();
  const router = useRouter();
  const path = router.pathname;

  return (
    <ProfileBox>
      <ProfileImgWrap>
        <ProfileImgImage src={male} width={50} height={50} alt="MemberAvatar" />
        <ProfileUl>
          <ProfileLi>
            <Link href="/profile">
              {userInfo.isSignIn ? "Profile" : "SignIn"}
            </Link>
          </ProfileLi>
          {userInfo.isSignIn && (
            <ProfileLi
              onClick={() => {
                dispatch(
                  userSignOut({ uid: "", name: "", email: "", intro: "" })
                );
                signout();
              }}
            >
              SignOut
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Header>
      <Link href="/">
        <LogoImg src={logo} alt="logo" width={70} height={70} />
      </Link>
      <Ul>
        <Li nowpath={path === "/"}>
          <Link href="/">Home</Link>
        </Li>
        <Li nowpath={path === "/books"}>
          <Link href="/books">Books</Link>
        </Li>
        <Li nowpath={path === "/search"}>
          <Link href="/search">Search</Link>
        </Li>
      </Ul>
      <MemberComponent />
      <NoticeComponent />
    </Header>
  );
}
