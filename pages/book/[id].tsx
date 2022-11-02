import styled from "styled-components";
import { doc, onSnapshot } from "firebase/firestore";
import {
  getBookInfo,
  BookInfo,
  getMemberReviews,
  BookReview,
  db,
} from "../../utils/firebaseFuncs";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import noimg from "/public/img/noImg.png";

import {
  ReviewsComponent,
  LeaveCommentComponent,
  LeaveRatingComponent,
} from "../../components/reviews";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

const BookBox = styled.div`
  display: flex;
  align-items: center;
`;
const BookDetail = styled.div``;
const BookTitle = styled.h2``;
const BookSubTitle = styled.h3``;
const BookIsbn = styled.p``;
const BookPublisher = styled.p``;
const BookPublishedDate = styled.p``;
const BookDescription = styled.p``;
const BookAuthor = styled.h4``;
const Categories = styled.p``;
function BookComponent({ data }: { data: BookInfo }) {
  return data ? (
    <BookBox>
      <Image
        src={data.smallThumbnail ? data.smallThumbnail : noimg}
        alt={`${data.title}`}
        width={128}
        height={193}
        priority
      />
      <BookDetail>
        <BookTitle>書名：{data.title}</BookTitle>
        {data.subtitle && <BookSubTitle>{data.subtitle}</BookSubTitle>}
        {data.authors?.map((author: string) => (
          <BookAuthor key={author}>作者:{author}</BookAuthor>
        ))}
        {data.categories?.map((category: string) => (
          <Categories key={category}>分類：{category}</Categories>
        ))}
        <BookPublisher>出版社：{data.publisher}</BookPublisher>
        <BookPublishedDate>出版日期：{data.publishedDate}</BookPublishedDate>
        <BookIsbn>ISBN：{data.isbn}</BookIsbn>
        <BookDescription>簡介：{data.description}</BookDescription>
      </BookDetail>
    </BookBox>
  ) : (
    <BookBox>
      <BookTitle>查無書籍資料</BookTitle>
    </BookBox>
  );
}

export default function Post() {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [bookData, setBookData] = useState<BookInfo>({});
  const [memberReviews, setMemberReviews] = useState<BookReview>({});
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (typeof id === "string") {
      getBookInfo(id.replace("id:", "")).then(
        (data: BookInfo | undefined) => data && setBookData(data)
      );
    }

    if (userInfo.isSignIn && userInfo.uid && typeof id === "string") {
      getMemberReviews(userInfo.uid, id.replace("id:", "")).then((res) => {
        setMemberReviews(res);
      });
    }
  }, [id, userInfo.isSignIn, userInfo.uid]);

  return (
    <>
      <BookComponent data={bookData} />
      <LeaveRatingComponent
        memberReview={memberReviews}
        bookIsbn={typeof id === "string" ? id.replace("id:", "") : ""}
      />

      <ReviewsComponent
        bookIsbn={typeof id === "string" ? id.replace("id:", "") : ""}
      />
    </>
  );
}
