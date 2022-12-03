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
import acceptImg from "../../public/img/accept.svg";
import rejectImg from "../../public/img/reject.svg";
import linkImg from "../../public/img/new-link.svg";
import menu from "../../public/img/user.png";
import bell from "/public/img/bell.png";
import Swal from "sweetalert2";

interface MesProps {
  mesCount?: number;
}
interface MesBoxProps {
  isOpen?: boolean;
  notice?: number;
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
const Li = styled.li<LiProps>`
  list-style: none;
  display: inline-block;
  height: 100%;
  width: 150px;
  letter-spacing: 10px;
  text-indent: 10px;
  font-weight: 500;
  background-color: ${(props) =>
    props.nowpath ? props.theme.greyBlue : props.theme.grey};
  display: flex;
  align-items: center;
  border-radius: 10px 10px 0 0;
  font-size: ${(props) => props.theme.fz4};
  &:hover {
    background-color: ${(props) => props.theme.greyBlue};
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

const NoticeBox = styled.div<MesBoxProps>`
  position: absolute;
  top: calc(100% + 8px);
  height: ${(props) => (props.isOpen ? `${props.notice! * 150}px` : "0px")};
  min-height: ${(props) => (props.isOpen ? "30px" : "0px")};
  right: -15px;
  border-radius: 0 0 10px 10px;
  overflow: auto;
  z-index: 10;
  background-color: ${(props) => props.theme.white};
  box-shadow: 5px 5px 5px ${(props) => props.theme.black};
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
const NoticeContent = styled.div`
  white-space: nowrap;
  display: flex;
  flex-direction: column;
`;
const NoNoticeContent = styled(NoticeContent)`
  padding: 10px 10px;
`;
const ResImgs = styled.div`
  margin-left: auto;
  display: flex;
  width: 60px;
`;
const ResImg1 = styled(Image)`
  background-color: ${(props) => props.theme.yellow};
  cursor: pointer;
  border-radius: 5px;
  &:hover {
    background-color: ${(props) => props.theme.greyBlue};
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
  font-size: ${(props) => props.theme.fz3};
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
  border-top: 1px solid ${(props) => props.theme.grey};
  background-color: ${(props) => props.theme.white};
  position: absolute;
  border-radius: 0 0 10px 10px;
  box-shadow: 5px 5px 5px ${(props) => props.theme.black};
  top: 100%;
  right: 0;
  width: 150px;
  overflow: hidden;
`;
const ProfileLink = styled(Link)``;

interface ProfileLiProps {
  nowpath?: boolean;
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
  border-top: 1px solid ${(props) => props.theme.grey};
  background-color: ${(props) =>
    props.nowpath ? props.theme.yellow : "transparent"};

  &:hover {
    background-color: ${(props) => props.theme.yellow};
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
            src={data && data?.img ? data?.img : male}
            alt={data && data?.name ? data.name : "user Img"}
            width={40}
            height={40}
          />
        </Link>
      )}
      <NoticeContent>
        <MemberName>{data.name}</MemberName>
        <NoticeMessage>向您發出好友邀請</NoticeMessage>
      </NoticeContent>
      <ResImgs>
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
      </ResImgs>
    </>
  );
}

function CommentNoticeComponent({ data }: { data: NoticeData }) {
  return (
    <>
      <Link href={`/member/id:${data.poster}`}>
        <MemberImg
          src={
            data?.posterInfo && data?.posterInfo?.img
              ? data?.posterInfo?.img
              : male
          }
          alt={
            data?.posterInfo && data?.posterInfo?.name
              ? data?.posterInfo.name
              : "user Img"
          }
          width={40}
          height={40}
        ></MemberImg>
      </Link>
      <NoticeContent>
        <MemberName>{data?.posterInfo?.name}</MemberName>
        <NoticeMessage>回應了您的評論</NoticeMessage>
      </NoticeContent>
      <ResImgs>
        <Link href={data?.postUrl}>
          <ResImg3 src={linkImg} alt="delete" width={25} height={25} />
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
      </ResImgs>
    </>
  );
}

function NoticeComponent() {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [notices, setNotice] = useState<NoticeData[]>([]);
  const [friendRequest, setFriendRequest] = useState<MemberInfo[]>([]);
  const [openMsg, setOpenMsg] = useState(false);
  const [allnotice, setAllnotice] = useState<(NoticeData | MemberInfo)[]>([]);
  useEffect(() => {
    let unsub1: Function;
    let unsub2: Function;

    const getAllNotice = async () => {
      let allNotices: (NoticeData | MemberInfo)[] = [];
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
          allNotices.push(...invitorData);
          setFriendRequest(invitorData);
        }
      );
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
          allNotices.push(...newNotices);
          setNotice(newNotices);
        }
      );
    };
    getAllNotice();
    console.log("effect");
    return () => {
      if (unsub1) {
        unsub1();
      }
      if (unsub2) {
        unsub2();
      }
    };
  }, [userInfo.uid]);

  useEffect(() => {
    setAllnotice([...notices, ...friendRequest]);
  }, [notices, friendRequest]);
  return (
    <>
      {userInfo.isSignIn && (
        <MesBox
          mesCount={notices.length + friendRequest.length}
          onMouseEnter={() => {
            setOpenMsg(true);
          }}
          onMouseLeave={() => {
            setOpenMsg(false);
          }}
        >
          <MesImg src={bell} alt="Message" width={27} height={27} />
          {notices.length + friendRequest.length > 0 ? (
            <NoticeBox
              isOpen={openMsg}
              notice={
                (notices.length > 0 ? 1 : 0) +
                (friendRequest.length > 0 ? 1 : 0)
              }
            >
              {allnotice.map((data) =>
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

  return (
    <ProfileBox>
      <ProfileImgWrap>
        <ProfileImgImage src={menu} width={27} height={27} alt="MemberAvatar" />
        <ProfileUl>
          <ProfileLi nowpath={router.asPath === "/profile"}>
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
      <Ul>
        <Li nowpath={path === "/"}>
          <PageLink href="/">首頁</PageLink>
        </Li>
        <Li nowpath={path === "/books"}>
          <PageLink href="/books">書籍</PageLink>
        </Li>
      </Ul>
      <MemberComponent />
      <NoticeComponent />
    </Header>
  );
}
