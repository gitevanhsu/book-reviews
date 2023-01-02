import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

import { useSelector } from "react-redux";
import styled from "styled-components";
import { doc, onSnapshot } from "firebase/firestore";

import { RootState } from "../../store";
import { getMemberData, MemberInfo, db } from "../../utils/firebaseFuncs";
import { friends } from "../../utils/imgs";

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

export default function FriendsListComponent() {
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
            <FriendsLi
              onClick={() => {
                gotoMemberPage("");
              }}
            >
              <NoFriends>去討論區認識新朋友吧！</NoFriends>
            </FriendsLi>
          )}
        </FriendsUl>
      </FriendsWrap>
    </FriendsBox>
  );
}
