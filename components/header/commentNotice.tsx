import Image from "next/image";
import Link from "next/link";

import styled from "styled-components";

import { NoticeData, removeNotice } from "../../utils/firebaseFuncs";
import { male, rejectImg, newLinkImg } from "../../utils/imgs";

const Notice = styled.div`
  padding: 0 10px;
  display: flex;
  justify-content: start;
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
export const ResImg2 = styled(ResImg1)`
  margin-left: 10px;
  background-color: ${(props) => props.theme.red};
  cursor: pointer;
  &:hover {
    background-color: ${(props) => props.theme.red};
  }
`;
const ResImg3 = styled(ResImg1)`
  background-color: ${(props) => props.theme.yellow};
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

export default function CommentNoticeComponent({ data }: { data: NoticeData }) {
  return (
    <Notice>
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
    </Notice>
  );
}
