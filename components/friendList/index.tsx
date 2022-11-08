import Link from "next/link";
import Image from "next/image";
import styled from "styled-components";
import male from "/public/img/reading-male.png";
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
import { useSelector } from "react-redux";
import { userSignIn } from "../../slices/userInfoSlice";
import { doc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { RootState } from "../../store";
import router from "next/router";

const FriendBox = styled.div``;
const Friend = styled.div`
  display: flex;
  align-items: center;
`;
const FriendName = styled.h3`
  display: inline-block;
`;
const FriendImg = styled(Image)``;
const Gotomember = styled.div`
  display: inline-block;
  cursor: pointer;
`;

export default function FriendsListComponent() {
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
          FRIEND!
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
                <FriendImg src={male} alt={"user Img"} width={25} height={25} />
              </Gotomember>
              <FriendName>{member.name}</FriendName>
            </Friend>
          ))}
        </>
      ) : (
        ""
      )}
    </FriendBox>
  );
}
