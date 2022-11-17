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
import { onSnapshot, query, where } from "firebase/firestore";
import { RootState } from "../../store";
import { useRouter } from "next/router";
import logo from "../../public/img/book-shelf-books-education-learning-school-study-svgrepo-com.svg";
import message from "../../public/img/message.svg";
import acceptImg from "../../public/img/accept.svg";
import rejectImg from "../../public/img/reject.svg";
import linkImg from "../../public/img/new-link.svg";
import menu from "../../public/img/menu.svg";

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
    font-size: ${(props) => props.theme.fz}px;
    display: inline-block;
    background-color: #f00;
    color: ${(props) => props.theme.white};
    position: absolute;
    text-align: center;
    line-height: 15px;
    width: 15px;
    height: 15px;
    bottom: 3px;
    right: -4px;
    border-radius: 50%;
  }
`;

const Header = styled.header`
  padding-top: 10px;
  width: 100%;
  border-bottom: solid 1px ${(props) => props.theme.greyGreen};
  height: 60px;
  position: relative;
  display: flex;
  align-items: center;
  background: ${(props) => props.theme.white};
`;
const Ul = styled.ul`
  display: flex;
  align-items: center;
  margin-left: 30px;
  padding: 0 20px;
  height: 100%;
  overflow: hidden;
  @media screen and (max-width: 576px) {
    display: none;
  }
`;

const Li = styled.li<LiProps>`
  list-style: none;
  display: inline-block;
  height: 100%;
  width: 100%;
  padding: 0 10px;
  margin: 0;
  background-color: ${(props) =>
    props.nowpath ? props.theme.greyBlue : props.theme.white};
  display: flex;
  align-items: center;
  transform: ${(props) =>
    props.nowpath ? "translateY(0%)" : "translateY(10%)"};
  border-radius: 10px 10px 0 0;
  font-size: 20px;
  transition: 0.2s;
  &:hover {
    transform: translateY(0%);
    background-color: ${(props) => props.theme.greyBlue};
  }
  & + & {
    margin-left: 20px;
  }
`;
const PageLink = styled(Link)`
  display: inline-block;
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  text-decoration: none;
  color: ${(props) => props.theme.black};
`;
const NoticeBox = styled.div<MesBoxProps>`
  position: absolute;
  top: calc(100% - 1px);
  right: 0;
  width: 0px;
  width: ${(props) => (props.isOpen ? "300px" : "0px")};
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
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
`;
const NoticeContent = styled.div`
  white-space: nowrap;
  display: flex;
  flex-direction: column;
`;
const ResImgs = styled.div`
  align-self: center;
  display: flex;
  justify-content: space-around;
  width: 60px;
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
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
`;
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
  border-top: 1px solid transparent;
  background-color: ${(props) => props.theme.greyGreen};
  position: absolute;
  top: 100%;
  right: 0;
  width: 150px;
  overflow: hidden;
`;
const ProfileLink = styled(Link)``;
const ProfileLi = styled.li`
  padding: 0 10px;
  width: 100%;
  display: flex;
  align-items: center;
  text-align: right;
  cursor: pointer;
  height: 0;
  font-size: ${(props) => props.theme.fz * 1.5}px;
  opacity: 0;
  border-bottom: 1px solid ${(props) => props.theme.greyBlue};
  border-top: 1px solid transparent;
  transition: 0.3s;
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
    transition: 0.3s;
    opacity: 1;
  }
  @media screen and (max-width: 576px) {
    margin-left: 0;
    display: none;
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
              width={40}
              height={40}
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

  return (
    <ProfileBox>
      <ProfileImgWrap>
        <ProfileImgImage src={male} width={40} height={40} alt="MemberAvatar" />
        <ProfileUl>
          <ProfileLi>
            <ProfileLink href="/profile">
              {userInfo.isSignIn ? "Profile" : "SignIn"}
            </ProfileLink>
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
const MobileUl = styled.ul`
  background-color: ${(props) => props.theme.greyGreen};
  position: absolute;
  top: 100%;
  right: -10px;
  width: 140px;
  z-index: 4;
  height: 0;
  overflow: hidden;
  transition: 0.3s;
`;
const MobileMenuBox = styled.div`
  position: relative;
  display: none;
  align-items: center;
  margin: 0 15px;
  margin-left: auto;
  height: 100%;
  &:hover ${MobileUl} {
    height: 250px;
    transition: 0.3s;
  }
  @media screen and (max-width: 576px) {
    display: flex;
  }
`;
const MobileMenuImg = styled(Image)``;

const MobileLi = styled.li`
  cursor: pointer;
  width: 100%;
  height: 50px;
  padding: 0 10px;
  border-bottom: 1px solid ${(props) => props.theme.greyBlue};
  font-size: ${(props) => props.theme.fz * 1.5}px;
  & > ${PageLink} {
    color: ${(props) => props.theme.black};
  }
`;

function MobileSlideComponent() {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const dispatch = useDispatch();
  const router = useRouter();
  return (
    <MobileMenuBox>
      <MobileMenuImg src={menu} alt="mobile icon" width={30} height={30} />
      <MobileUl>
        <MobileLi>
          <PageLink href="/">Home</PageLink>
        </MobileLi>
        <MobileLi>
          <PageLink href="/books">Books</PageLink>
        </MobileLi>
        <MobileLi>
          <PageLink href="/search">Search</PageLink>
        </MobileLi>
        <MobileLi>
          <PageLink href="/profile">
            {userInfo.isSignIn ? "Profile" : "SignIn"}
          </PageLink>
        </MobileLi>
        {userInfo.isSignIn && (
          <MobileLi>
            <PageLink
              href=""
              onClick={() => {
                dispatch(
                  userSignOut({ uid: "", name: "", email: "", intro: "" })
                );
                signout();
              }}
            >
              SignOut
            </PageLink>
          </MobileLi>
        )}
      </MobileUl>
    </MobileMenuBox>
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
          <PageLink href="/">Home</PageLink>
        </Li>
        <Li nowpath={path === "/books"}>
          <PageLink href="/books">Books</PageLink>
        </Li>
        <Li nowpath={path === "/search"}>
          <PageLink href="/search">Search</PageLink>
        </Li>
      </Ul>
      <MobileSlideComponent />
      <MemberComponent />
      <NoticeComponent />
    </Header>
  );
}
