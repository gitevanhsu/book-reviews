import { useState } from "react";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.bubble.css";
import styled from "styled-components";
import parse from "html-react-parser";
import Swal from "sweetalert2";

import { BookReview, editReview } from "../../utils/firebaseFuncs";

const MemberReviewBox = styled.div`
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.3);
`;
const Title = styled.p`
  font-size: ${(props) => props.theme.fz4};
  width: 60px;
`;
const TitleContent = styled.h3`
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  font-size: ${(props) => props.theme.fz3};
  font-weight: 600;
`;
interface ContentProps {
  showMore: boolean;
}
const Content = styled.div<ContentProps>`
  letter-spacing: 2px;
  width: 100%;
  font-size: ${(props) => props.theme.fz4};
  line-height: ${(props) => props.theme.fz4};
  max-height: ${(props) => (props.showMore ? "auto" : "150px")};
  overflow: hidden;
  & > p {
    margin-top: 5px;
  }
`;
const MemberReviewTitleBox = styled.div`
  display: flex;
`;

const MemberReviewContentBox = styled.div`
  margin-top: 20px;
  display: flex;
`;
const EditReviewButton = styled.button`
  cursor: pointer;
  margin: 10px 20px 10px 0;
  font-size: ${(props) => props.theme.fz5};
  padding: 5px 10px;
  border-radius: 5px;
  color: ${(props) => props.theme.black};
  background-color: ${(props) => props.theme.darkYellow};
  & + & {
    margin-left: 20px;
  }
`;
const LeaveReviewTitle = styled.h3`
  min-width: 55px;
  font-size: ${(props) => props.theme.fz4};

  @media screen and (max-width: 576px) {
    margin-bottom: 10px;
  }
`;
const EditTitle = styled(ReactQuill)`
  width: 100%;
  border: solid 1px ${(props) => props.theme.black};
  border-radius: 5px;
`;
const EditContent = styled(ReactQuill)`
  width: 100%;
  height: 100px;
  border: solid 1px ${(props) => props.theme.black};
  border-radius: 5px;
`;
const SeeMoreBtn = styled.button`
  font-size: ${(props) => props.theme.fz5};
  padding: 5px 10px;
  margin-right: 20px;
  border-radius: 5px;
  color: ${(props) => props.theme.black};
  background-color: ${(props) => props.theme.yellow};
  cursor: pointer;
  margin-top: 20px;
`;

export default function MemberReviewComponent({
  memberReview,
}: {
  memberReview: BookReview;
}) {
  const [isEdit, setIsEdit] = useState(false);
  const [titleValue, setTitleValue] = useState(memberReview.title);
  const [contentValue, setContentValue] = useState(memberReview.content);
  const [showMore, setShowMore] = useState(false);

  return isEdit ? (
    <MemberReviewBox>
      <MemberReviewTitleBox>
        <Title>標題</Title>
        <EditTitle theme="bubble" value={titleValue} onChange={setTitleValue} />
      </MemberReviewTitleBox>
      <MemberReviewContentBox>
        <LeaveReviewTitle>內容</LeaveReviewTitle>
        <EditContent
          theme="bubble"
          value={contentValue}
          onChange={setContentValue}
        />
      </MemberReviewContentBox>
      <EditReviewButton
        onClick={() => {
          if (
            memberReview.title === titleValue &&
            contentValue === memberReview.content
          ) {
            setIsEdit(false);
          } else if (
            titleValue!.replace(/<(.|\n)*?>/g, "").trim().length > 0 &&
            contentValue!.replace(/<(.|\n)*?>/g, "").trim().length > 0
          ) {
            editReview(memberReview, titleValue!, contentValue!);
            Swal.fire({
              title: "感謝您的評論",
              icon: "success",
              timer: 1000,
              showConfirmButton: false,
            });
            setIsEdit(false);
          } else {
            Swal.fire({
              title: "請勿留下空白內容！",
              icon: "warning",
              timer: 1000,
              showConfirmButton: false,
            });
          }
        }}
      >
        送出
      </EditReviewButton>
      <EditReviewButton
        onClick={() => {
          setIsEdit(false);
        }}
      >
        取消
      </EditReviewButton>
    </MemberReviewBox>
  ) : (
    <MemberReviewBox>
      <MemberReviewTitleBox>
        <TitleContent>{parse(memberReview.title!)}</TitleContent>
      </MemberReviewTitleBox>
      <MemberReviewContentBox>
        <Content showMore={showMore}>{parse(memberReview?.content!)}</Content>
      </MemberReviewContentBox>
      <EditReviewButton
        onClick={() => {
          setIsEdit(true);
        }}
      >
        編輯
      </EditReviewButton>
      {memberReview?.content!.split("<p>").length > 8 && (
        <SeeMoreBtn
          onClick={() => {
            setShowMore((prev) => !prev);
          }}
        >
          {showMore ? "Show less" : "Show more"}
        </SeeMoreBtn>
      )}
    </MemberReviewBox>
  );
}
