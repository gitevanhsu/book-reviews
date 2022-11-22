import Image from "next/image";
import styled from "styled-components";
import male from "/public/img/reading-male.png";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { getMemberData, db, MemberInfo } from "../../utils/firebaseFuncs";
import { useSelector } from "react-redux";
import { doc, onSnapshot } from "firebase/firestore";
import { RootState } from "../../store";
import router from "next/router";

const FriendBox = styled.div`
  text-align: center;
  position: absolute;
  padding-bottom: 10px;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  max-height: 300px;
  background-color: ${(props) => props.theme.grey};
  z-index: 5;
  border-radius: 20px;
  overflow: hidden;
  overflow: auto;
  ::-webkit-scrollbar {
    display: none;
  }
`;
const FriendTitle = styled.div`
  text-align: center;
  top: 0;
  position: sticky;
  color: ${(props) => props.theme.black};
  background-color: ${(props) => props.theme.yellow};
  font-size: ${(props) => props.theme.fz * 2}px;
  letter-spacing: 2px;
  padding: 10px;
  box-shadow: 2px 0px 5px ${(props) => props.theme.black};
  @media screen and (max-width: 480px) {
    font-size: ${(props) => props.theme.fz * 1.5}px;
  }
`;
const Friend = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 20px;
  border-bottom: 1px solid ${(props) => props.theme.greyblue};
`;
const FriendName = styled.h3`
  display: inline-block;
  font-size: ${(props) => props.theme.fz * 2}px;
  color: ${(props) => props.theme.black};
  margin-left: 20px;
  @media screen and (max-width: 480px) {
    font-size: ${(props) => props.theme.fz * 1.5}px;
  }
`;
const FriendImg = styled(Image)``;
const Gotomember = styled.div`
  display: inline-block;
  cursor: pointer;
`;
const CloseBtn = styled.button`
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 20px;
  margin: 20px auto;
  color: ${(props) => props.theme.black};
  background-color: ${(props) => props.theme.yellow};
  font-size: ${(props) => props.theme.fz * 1.5}px;
  @media screen and (max-width: 480px) {
    font-size: ${(props) => props.theme.fz * 1.2}px;
  }
  &:hover {
    background-color: ${(props) => props.theme.greyBlue};
  }
`;
export default function FriendsListComponent({
  setShowFriend,
}: {
  setShowFriend: Dispatch<SetStateAction<boolean>>;
}) {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [friendList, setFriendList] = useState<MemberInfo[]>();
  useEffect(() => {
    let unSubscription: Function;
    const getFriendList = async () => {
      if (userInfo.uid)
        unSubscription = onSnapshot(
          doc(db, "members", userInfo.uid),
          async (doc) => {
            const members: MemberInfo[] = [];
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
    };
    getFriendList();
    return () => {
      if (unSubscription) {
        unSubscription();
      }
    };
  }, [userInfo.uid]);
  const gotoMemberPage = (memberdata: MemberInfo, uid: string) => {
    router.push(`/member/id:${memberdata.uid}`);
  };
  return (
    <FriendBox>
      {friendList && friendList.length > 0 ? (
        <>
          <FriendTitle>FRIENDS</FriendTitle>
          <br />
          {friendList.map((member) => (
            <Friend key={member.uid}>
              <Gotomember
                onClick={() => {
                  member &&
                    userInfo.uid &&
                    gotoMemberPage(member, userInfo.uid);
                }}
              >
                <FriendImg src={male} alt={"user Img"} width={40} height={40} />
              </Gotomember>
              <FriendName>{member.name}</FriendName>
            </Friend>
          ))}
        </>
      ) : (
        ""
      )}
      <CloseBtn
        onClick={() => {
          setShowFriend(false);
        }}
      >
        關閉
      </CloseBtn>
    </FriendBox>
  );
}
