import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import "react-quill/dist/quill.bubble.css";
import { useSelector } from "react-redux";
import styled from "styled-components";
import parse from "html-react-parser";
import Swal from "sweetalert2";

import { RootState } from "../../store";
import { male } from "../../utils/imgs";
import {
  BookReview,
  upperReview,
  lowerReview,
} from "../../utils/firebaseFuncs";
import SubReviewComponent from "./subReview";

const BookReviewWrap = styled.div`
  width: 100%;
  padding: 15px 0;
  margin-bottom: 15px;
  border-bottom: 1px solid ${(props) => props.theme.grey};
`;
const BookReviewHead = styled.div`
  display: flex;
  align-items: center;
`;
const BookReviewMemberWrap = styled.div`
  position: relative;
  width: 100%;
`;
const BookReviewMemberImgWrap = styled.div``;
const BookReviewMemberImg = styled(Image)`
  border-radius: 50%;
  width: 80px;
  height: 80px;
  @media screen and (max-width: 576px) {
    width: 50px;
    height: 50px;
  }
`;
const BookReviewMemberLink = styled(Link)`
  padding: 0 10px;
`;
const BookReviewMemberName = styled.h4`
  display: inline-block;
  margin-right: 20px;
  font-size: ${(props) => props.theme.fz3};
  font-weight: 600;
  @media screen and (max-width: 480px) {
    font-size: ${(props) => props.theme.fz4};
  }
`;
const BookReviewMemberRate = styled.div`
  display: inline-block;
  font-size: ${(props) => props.theme.fz4};
  @media screen and (max-width: 480px) {
    font-size: ${(props) => props.theme.fz5};
  }
`;
const BookReviewMemberRateStart = styled.span`
  display: inline-block;
  font-size: ${(props) => props.theme.fz4};
  color: ${(props) => props.theme.starYellow};
  @media screen and (max-width: 480px) {
    font-size: ${(props) => props.theme.fz5};
  }
`;
const BookReviewMemberDate = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  display: block;
  margin-left: auto;
  font-size: ${(props) => props.theme.fz5};
  @media screen and (max-width: 480px) {
    display: none;
  }
`;
const BookReviewTitle = styled.div`
  word-break: break-all;
  font-size: ${(props) => props.theme.fz4};
  margin-top: 30px;
  @media screen and (max-width: 576px) {
    font-size: ${(props) => props.theme.fz4};
  }
`;
interface BookReviewContentProps {
  showMore: boolean;
}
const BookReviewContent = styled.div<BookReviewContentProps>`
  word-break: break-all;
  max-height: ${(props) => (props.showMore ? "auto" : "160px")};
  overflow: hidden;
  padding: 20px 0 0 60px;
  font-size: ${(props) => props.theme.fz4};
  @media screen and (max-width: 576px) {
    font-size: ${(props) => props.theme.fz4};
    padding-left: 50px;
  }
  & > p {
    line-height: 20px;
  }
`;
const BookReviewRatingWrap = styled.div`
  width: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const BookReviewRatingUpper = styled.div`
  clip-path: polygon(50% 40%, 0% 100%, 100% 100%);
  cursor: pointer;
  display: inline-block;
  height: 30px;
  width: 40px;
  background-color: ${(props) => props.theme.darkYellow};
  &:hover {
    background-color: ${(props) => props.theme.starYellow};
  }
`;
const BookReviewRatingLower = styled(BookReviewRatingUpper)`
  clip-path: polygon(0 0, 50% 60%, 100% 0);
`;
const BookReviewRatingNumber = styled.p`
  padding: 10px 0;
  font-size: ${(props) => props.theme.fz3};
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
  &:hover {
    background-color: ${(props) => props.theme.starYellow};
  }
`;

const ButtonsWrap = styled.div`
  margin-left: 60px;
  @media screen and (max-width: 576px) {
    font-size: ${(props) => props.theme.fz4};
    margin-left: 50px;
  }
`;

interface ReviewProps {
  review: BookReview;
  year: number;
  month: number;
  date: number;
}

export default function ReviewComponent({
  review,
  year,
  month,
  date,
}: ReviewProps) {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [showMore, setShowMore] = useState(false);
  const router = useRouter();
  return (
    <BookReviewWrap key={review.reviewId}>
      <BookReviewHead>
        <BookReviewRatingWrap>
          <BookReviewRatingUpper
            onClick={() => {
              if (userInfo && !userInfo.isSignIn) {
                Swal.fire({
                  icon: "info",
                  title: "請先登入喔！",
                  confirmButtonText: "前往登入",
                }).then((result) => {
                  result.isConfirmed && router.push("/profile");
                });
              } else if (
                review.liked?.includes(userInfo.uid!) ||
                review.disliked?.includes(userInfo.uid!)
              ) {
                Swal.fire({
                  icon: "warning",
                  title: "已經評分過了喔！",
                  showConfirmButton: false,
                  timer: 1000,
                });
              } else if (userInfo.uid && review) {
                Swal.fire({
                  icon: "success",
                  title: "成功評分！",
                  showConfirmButton: false,
                  timer: 1000,
                });
                upperReview(userInfo.uid, review);
              }
            }}
          />
          <BookReviewRatingNumber>{review.reviewRating}</BookReviewRatingNumber>
          <BookReviewRatingLower
            onClick={() => {
              if (userInfo && !userInfo.isSignIn) {
                Swal.fire({
                  icon: "info",
                  title: "請先登入喔！",
                  confirmButtonText: "前往登入",
                }).then((result) => {
                  result.isConfirmed && router.push("/profile");
                });
              } else if (
                review.liked?.includes(userInfo.uid!) ||
                review.disliked?.includes(userInfo.uid!)
              ) {
                Swal.fire({
                  icon: "warning",
                  title: "已經評分過了喔！",
                  showConfirmButton: false,
                  timer: 1000,
                });
              } else if (userInfo.uid && review) {
                Swal.fire({
                  icon: "success",
                  title: "成功評分！",
                  showConfirmButton: false,
                  timer: 1000,
                });
                lowerReview(userInfo.uid, review);
              }
            }}
          />
        </BookReviewRatingWrap>
        <BookReviewMemberImgWrap>
          <BookReviewMemberLink
            href={
              review.memberId! === userInfo.uid!
                ? "/profile"
                : `/member/id:${review.memberId}`
            }
          >
            <BookReviewMemberImg
              src={review.memberData?.img || male}
              alt="Member Img"
              width={80}
              height={80}
            />
          </BookReviewMemberLink>
        </BookReviewMemberImgWrap>
        <BookReviewMemberWrap>
          <BookReviewMemberName>
            {review.memberData && review.memberData.name}
          </BookReviewMemberName>
          <BookReviewMemberRate>
            <BookReviewMemberRateStart>&#9733;</BookReviewMemberRateStart>
            {review.rating}
          </BookReviewMemberRate>
          <BookReviewMemberDate>
            {`${year}-${month}-${date}`}
          </BookReviewMemberDate>
          <BookReviewTitle>{parse(review.title!)}</BookReviewTitle>
        </BookReviewMemberWrap>
      </BookReviewHead>
      <BookReviewContent showMore={showMore}>
        {parse(review.content!)}
      </BookReviewContent>
      <ButtonsWrap>
        {review.content!.split("<p>").length > 5 && (
          <SeeMoreBtn
            onClick={() => {
              setShowMore((prev) => !prev);
            }}
          >
            {showMore ? "顯示較少" : "顯示全部"}
          </SeeMoreBtn>
        )}
        <SubReviewComponent review={review} />
      </ButtonsWrap>
    </BookReviewWrap>
  );
}
