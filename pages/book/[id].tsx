import styled from "styled-components";
import { getBookInfo, BookInfo } from "../../utils/firebaseFuncs";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import noimg from "/public/img/noImg.png";

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
  return (
    <>
      <Image
        src={data.smallThumbnail ? data.smallThumbnail : noimg}
        alt={`${data.title}`}
        width={128}
        height={193}
      />
      <BookDetail>
        <BookTitle>書名：{data.title}</BookTitle>
        {data.subtitle && <BookSubTitle>{data.subtitle}</BookSubTitle>}
        {data.authors?.map((author) => (
          <BookAuthor key={author}>作者:{author}</BookAuthor>
        ))}
        {data.categories?.map((category) => (
          <Categories key={category}>分類：{category}</Categories>
        ))}
        <BookPublisher>出版社：{data.publisher}</BookPublisher>
        <BookPublishedDate>出版日期：{data.publishedDate}</BookPublishedDate>
        <BookIsbn>ISBN：{data.isbn}</BookIsbn>
        <BookDescription>簡介：{data.description}</BookDescription>
      </BookDetail>
    </>
  );
}

export default function Post() {
  const [bookData, setBookData] = useState<BookInfo>({});
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (typeof id === "string") {
      getBookInfo(id.replace("id:", ""), setBookData);
    }
  }, [id]);

  return (
    <BookBox>
      <BookComponent data={bookData} />
    </BookBox>
  );
}
