import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { loadBooks, BookInfo } from "../../utils/firebaseFuncs";

const Books = styled.div`
  display: flex;
  flex-wrap: wrap;
`;
const BookData = styled.div`
  width: 25%;
`;
const BookTitle = styled.h2``;
const BookSubTitle = styled.h3``;
const BookIsbn = styled.p``;
const BookPublisher = styled.p``;
const BookPublishedDate = styled.p``;
const BookTextSnippet = styled.p``;
const BookAuthor = styled.h4``;
const Categories = styled.p``;
const ButtonBox = styled.div`
  display: flex;
  align-items: center;
  margin: 0 auto;
  justify-content: center;
`;
const PageButton = styled.button`
  border: solid 1px;
  padding: 10px 20px;
  cursor: pointer;
`;
const PageNumber = styled.p`
  margin: 0 10px;
`;

function BookComponent({ data }: { data: BookInfo }) {
  return (
    <>
      <Link href={`/book/id:${data.isbn}`}>
        <Image
          src={data.smallThumbnail ? data.smallThumbnail : ""}
          alt={`${data.title}`}
          width={128}
          height={193}
        />
      </Link>
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
      <BookTextSnippet>簡介：{data.textSnippet}</BookTextSnippet>
    </>
  );
}

export default function BooksComponent() {
  const [bookDatas, setBookDatas] = useState<BookInfo[]>([]);
  const [page, setPage] = useState<number>(0);
  const pageRef = useRef<QueryDocumentSnapshot<DocumentData>>();
  // console.log(pageRef.current);
  useEffect(() => {
    if (page + 1 > bookDatas.length / 10) {
      loadBooks(page, pageRef.current).then(({ booksData, lastVisible }) => {
        setBookDatas([...bookDatas, ...booksData]);
        pageRef.current = lastVisible;
      });
    }
  });

  return (
    <>
      <Books>
        {bookDatas.map((book, index) => {
          if (index >= page * 10 && index < page * 10 + 10) {
            return (
              <BookData key={book.isbn}>
                <BookComponent data={book} />
              </BookData>
            );
          }
        })}
      </Books>
      <ButtonBox>
        <PageButton
          onClick={() => {
            setPage((prev) => (prev <= 0 ? 0 : prev - 1));
          }}
        >
          -
        </PageButton>
        <PageNumber>{page + 1}</PageNumber>
        <PageButton
          onClick={() => {
            setPage((prev) => prev + 1);
          }}
        >
          +
        </PageButton>
      </ButtonBox>
    </>
  );
}
