import Image from "next/image";
import Link from "next/link";

import { useSelector } from "react-redux";
import styled from "styled-components";

import { RootState } from "../../store";
import { MemberInfo } from "../../utils/firebaseFuncs";
import { male, acceptImg, rejectImg } from "../../utils/imgs";

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

export default function FriendRequestComponent({
  data,
  onAcceptFriendRequest,
  onRejectFriendRequest,
}: {
  data: MemberInfo;
  onAcceptFriendRequest: (userInfo: MemberInfo, data: MemberInfo) => void;
  onRejectFriendRequest: (userInfo: MemberInfo, data: MemberInfo) => void;
}) {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  return (
    <FriendRequestBox>
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
          onClick={() => onAcceptFriendRequest(userInfo, data)}
        />
        <ResImg2
          src={rejectImg}
          alt="rejectImg"
          width={25}
          height={25}
          onClick={() => onRejectFriendRequest(userInfo, data)}
        />
      </ResponseImages>
    </FriendRequestBox>
  );
}
