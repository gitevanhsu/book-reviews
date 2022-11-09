import styled from "styled-components";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  getMemberData,
  MemberInfo,
  sentFriendRequest,
} from "../../utils/firebaseFuncs";
import Image from "next/image";
import male from "/public/img/reading-male.png";
import { RootState } from "../../store";
import { useSelector } from "react-redux";

const Friend = styled.div`
  display: inline-block;
  padding: 5px 10px;
  border: solid 1px;
`;
const AddFriendButton = styled.button`
  padding: 5px 10px;
  border: solid 1px;
  cursor: pointer;
`;

export default function MemberPageComponent() {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [member, setMember] = useState<MemberInfo>({});
  const router = useRouter();
  const { id } = router.query;
  useEffect(() => {
    const memberData = async () => {
      if (typeof id === "string") {
        const data = (await getMemberData(id.replace("id:", ""))) as MemberInfo;
        setMember(data);
      }
    };
    memberData();
  }, [id]);

  return (
    <>
      <Image
        src={member && member.img ? member.img : male}
        alt={member && member.name ? member.name : "user Img"}
        width={50}
        height={50}
      ></Image>
      <p>{member.uid}</p>
      <p>{member.name}</p>
      <p>{member.email}</p>
      <p>{member.intro ? member.intro : "這個人沒有填寫自我介紹 :("}</p>
      {userInfo.uid &&
      member.friends &&
      member.friends.includes(userInfo.uid) ? (
        <Friend>Friend</Friend>
      ) : (
        <AddFriendButton
          onClick={() => {
            if (userInfo.uid && member.uid) {
              sentFriendRequest(userInfo.uid, member.uid);
            }
          }}
        >
          Add Friend
        </AddFriendButton>
      )}
    </>
  );
}
