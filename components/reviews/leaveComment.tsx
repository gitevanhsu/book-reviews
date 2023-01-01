import { useState } from "react";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.bubble.css";
import { useSelector } from "react-redux";
import styled from "styled-components";
import Swal from "sweetalert2";

import { RootState } from "../../store";
import { addBookReview } from "../../utils/firebaseFuncs";
import { removeBr } from "./index";

const LeaveReviewBox = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.3);
`;
const LeaveInputBox = styled.div`
  width: 100%;
  display: flex;
  align-items: start;
  margin: 10px 0;
  @media screen and (max-width: 576px) {
    flex-direction: column;
  }
`;
const LeaveReviewTitle = styled.h3`
  min-width: 55px;
  font-size: ${(props) => props.theme.fz4};

  @media screen and (max-width: 576px) {
    margin-bottom: 10px;
  }
`;
const LeaveReviewContentTitle = styled(ReactQuill)`
  width: 100%;
  border: 1px solid ${(props) => props.theme.black};
  border-radius: 5px;
`;
const LeaveReviewTextContent = styled(ReactQuill)`
  width: 100%;
  height: 100px;
  border: 1px solid ${(props) => props.theme.black};
  border-radius: 5px;
`;
const SubmitReviewBtn = styled.button`
  margin-top: 10px;
  align-self: end;
  cursor: pointer;
  border: solid 1px ${(props) => props.theme.grey};
  padding: 5px 10px;
  text-align: center;
  border-radius: 5px;
  color: ${(props) => props.theme.black};
  background-color: ${(props) => props.theme.darkYellow};
`;

export default function LeaveCommentComponent({
  bookIsbn,
}: {
  bookIsbn: string;
}) {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [titleValue, setTitleValue] = useState("");
  const [contentValue, setContentValue] = useState("");

  return userInfo.isSignIn ? (
    <LeaveReviewBox>
      <LeaveInputBox>
        <LeaveReviewTitle>標題</LeaveReviewTitle>
        <LeaveReviewContentTitle
          theme="bubble"
          value={titleValue}
          onChange={setTitleValue}
        />
      </LeaveInputBox>
      <LeaveInputBox>
        <LeaveReviewTitle>內容</LeaveReviewTitle>
        <LeaveReviewTextContent
          theme="bubble"
          value={contentValue}
          onChange={setContentValue}
        />
      </LeaveInputBox>
      <SubmitReviewBtn
        onClick={() => {
          if (
            titleValue.replace(/<(.|\n)*?>/g, "").trim().length > 0 &&
            contentValue.replace(/<(.|\n)*?>/g, "").trim().length > 0 &&
            userInfo.uid
          ) {
            const newTitle = removeBr(titleValue);
            const newContent = removeBr(contentValue);
            addBookReview(
              userInfo.uid,
              bookIsbn,
              newTitle.trim(),
              newContent.trim()
            );
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
      </SubmitReviewBtn>
    </LeaveReviewBox>
  ) : null;
}
