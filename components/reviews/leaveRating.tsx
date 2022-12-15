import { useEffect, useState } from "react";
import Link from "next/link";

import "react-quill/dist/quill.bubble.css";
import { useSelector } from "react-redux";
import styled from "styled-components";
import Swal from "sweetalert2";

import { RootState } from "../../store";
import {
  BookReview,
  bookRating,
  removeBookRating,
} from "../../utils/firebaseFuncs";

const LeaveRatingBox = styled.div`
  display: flex;
  align-items: center;
  padding-top: 20px;
  margin-top: 50px;
  margin-bottom: 20px;
`;
interface RatingProps {
  index: number;
  hover: number;
  rating: number;
}
const LeaveRatingButton = styled.button<RatingProps>`
  color: ${(props) =>
    props.index <= (props.hover || props.rating)
      ? props.theme.starYellow
      : props.theme.black};
  font-size: ${(props) => props.theme.fz5};
  background-color: transparent;
  border: none;
  outline: none;
  cursor: pointer;
  & + & {
    margin-left: 5px;
  }
`;
const LeaveRatingStar = styled.span``;
const RemoveRatingButton = styled.button`
  cursor: pointer;
  margin: 0 30px;
  padding: 5px 10px;
  border-radius: 5px;
  background-color: ${(props) => props.theme.yellow};
  &:hover {
    color: ${(props) => props.theme.white};
    background-color: ${(props) => props.theme.red};
  }
  & + & {
    margin: 0px;
  }
  @media screen and (max-width: 480px) {
    margin: 0 10px;
  }
`;
const SignMessage = styled.h2`
  font-size: ${(props) => props.theme.fz4};
`;
const SignButton = styled(Link)`
  display: inline-block;
  cursor: pointer;
  font-size: ${(props) => props.theme.fz5};
  padding: 5px 10px;
  margin-left: 20px;
  border-radius: 5px;
  color: ${(props) => props.theme.black};
  background-color: ${(props) => props.theme.darkYellow};
`;
const MemberReviewTitle = styled.h3`
  min-width: 100px;
  font-size: ${(props) => props.theme.fz4};
  line-height: ${(props) => props.theme.fz4};
  font-weight: 700;
  color: ${(props) => props.theme.black};
  @media screen and (max-width: 480px) {
    min-width: 70px;
  }
`;

export default function LeaveRatingComponent({
  bookIsbn,
  memberReview,
  setMemberReview,
}: {
  bookIsbn: string;
  memberReview: BookReview | undefined;
  setMemberReview: React.Dispatch<React.SetStateAction<BookReview | undefined>>;
}) {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  useEffect(() => {
    memberReview?.rating && setRating(+memberReview.rating);
  }, [memberReview]);
  return userInfo.isSignIn ? (
    <LeaveRatingBox>
      <MemberReviewTitle>您的評價</MemberReviewTitle>
      {[...Array(5)].map((_, index) => {
        index += 1;
        return (
          <LeaveRatingButton
            type="button"
            key={`start-${index}`}
            index={index}
            hover={hover}
            rating={rating}
            onClick={() => {
              setRating(index);
              bookRating(userInfo.uid!, bookIsbn, index);
            }}
            onMouseEnter={() => setHover(index)}
            onMouseLeave={() => setHover(rating)}
          >
            <LeaveRatingStar>&#9733;</LeaveRatingStar>
          </LeaveRatingButton>
        );
      })}

      {rating > 0 && (
        <RemoveRatingButton
          onClick={() => {
            Swal.fire({
              title: "確定要刪除嗎？",
              text: "評價 / 評論會一起刪除喔！",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              confirmButtonText: "確認刪除",
              cancelButtonText: "取消",
            }).then((result) => {
              if (result.isConfirmed) {
                Swal.fire({
                  icon: "success",
                  title: "刪除成功！",
                  text: "成功刪除評價 / 評論。",
                  showConfirmButton: false,
                  timer: 1500,
                });
                if (userInfo.uid && memberReview) {
                  removeBookRating(userInfo.uid, bookIsbn);
                  setRating(0);
                  setHover(0);
                  setMemberReview(undefined);
                }
              }
            });
          }}
        >
          刪除評論
        </RemoveRatingButton>
      )}
    </LeaveRatingBox>
  ) : (
    <LeaveRatingBox>
      <SignMessage>加入會員分享你的想法！</SignMessage>
      <SignButton href="/profile">加入會員</SignButton>
    </LeaveRatingBox>
  );
}
