import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { loadBooks, BookInfo } from "../../utils/firebaseFuncs";
import bookcover from "/public/img/bookcover.jpeg";
import next from "/public/img/next-icon.svg";

const BooksPage = styled.div`
  padding: 50px 30px;
  background-color: ${(props) => props.theme.white};
`;

const Books = styled.div`
  display: flex;
  flex-wrap: wrap;
`;
const BookData = styled.div`
  width: 25%;
  @media screen and (max-width: 922px) {
    width: 50%;
  }
  @media screen and (max-width: 480px) {
    width: 100%;
  }
`;
const BookTitle = styled.h2`
  margin-bottom: 10px;
  font-size: ${(props) => props.theme.fz * 1.5}px;
`;
const BookAuthor = styled.h4`
  margin-bottom: 10px;
  font-size: ${(props) => props.theme.fz}px;
`;
const BookTextSnippet = styled.p`
  display: inline-block;
  width: 200px;
  font-size: ${(props) => props.theme.fz}px;
  line-height: ${(props) => props.theme.fz * 1.2}px;
`;
const ButtonBox = styled.div`
  display: flex;
  align-items: center;
  margin: 20px auto;
  justify-content: center;
`;
const NextPage = styled.div`
  width: 30px;
  height: 24px;
  border-radius: 30px;
  line-height: ${(props) => props.theme.fz * 2}px;
  font-size: ${(props) => props.theme.fz * 1.5}px;
  text-align: center;
  border: 1px solid ${(props) => props.theme.grey};
  color: ${(props) => props.theme.black};
  cursor: pointer;
  &:hover {
    background-color: ${(props) => props.theme.greyBlue};
  }
`;
interface PrevProps {
  hasPrev: boolean;
}
const PrevPage = styled(NextPage)<PrevProps>`
  color: ${(props) => (props.hasPrev ? props.theme.grey : "")};
  cursor: ${(props) => (props.hasPrev ? "not-allowed" : "pointer")};
  &:hover {
    background-color: ${(props) =>
      props.hasPrev ? "transparent" : props.theme.greyBlue};
  }
`;
const PageNumber = styled.p`
  font-size: ${(props) => props.theme.fz * 2}px;
  margin: 0 20px;
`;
const Book = styled.div`
  padding: 40px 0;
  height: 100%;
  text-align: center;
  position: relative;
  border-bottom: 1px solid ${(props) => props.theme.greyBlue};
`;
const BookLink = styled(Link)`
  display: inline-block;
  position: relative;
`;
const BookImg = styled(Image)`
  box-shadow: 0px 0px 15px ${(props) => props.theme.black}; ;
`;
const BookDetail = styled.div`
  margin: 10px auto;
  max-width: 280px;
`;

const NoimgTitle = styled.h2`
  position: absolute;
  color: #fff;
  font-size: 16px;
  width: 128px;
  height: 193px;
  overflow: hidden;
  padding: 20px 10px;
  text-align: center;
  letter-spacing: 2px;
  top: 0;
  left: 0;
  pointer-events: none;
`;

function BookComponent({ data }: { data: BookInfo }) {
  return (
    <Book>
      <BookLink href={`/book/id:${data.isbn}`}>
        <BookImg
          src={data.smallThumbnail ? data.smallThumbnail : bookcover}
          alt={`${data.title}`}
          width={128}
          height={193}
        />
        {!data.smallThumbnail && <NoimgTitle>{data.title}</NoimgTitle>}
      </BookLink>
      <BookDetail>
        <BookTitle>{data.title}</BookTitle>
        {data.authors && <BookAuthor>{data.authors[0]}</BookAuthor>}
        <BookTextSnippet>{data.textSnippet}</BookTextSnippet>
      </BookDetail>
    </Book>
  );
}

export default function BooksComponent() {
  const [bookDatas, setBookDatas] = useState<BookInfo[]>([]);
  const [page, setPage] = useState<number>(0);
  const pageRef = useRef<QueryDocumentSnapshot<DocumentData>>();
  useEffect(() => {
    if (page + 1 > bookDatas.length / 8) {
      loadBooks(page, pageRef.current).then(({ booksData, lastVisible }) => {
        setBookDatas([...bookDatas, ...booksData]);
        pageRef.current = lastVisible;
      });
    }
  }, [bookDatas, page]);

  return (
    <BooksPage>
      <Books>
        {bookDatas.map((book, index) => {
          if (index >= page * 8 && index < page * 8 + 8) {
            return (
              <BookData key={book.isbn}>
                <BookComponent data={book} />
              </BookData>
            );
          }
        })}
      </Books>
      <ButtonBox>
        <PrevPage
          onClick={() => {
            setPage((prev) => (prev <= 0 ? 0 : prev - 1));
          }}
          hasPrev={page === 0}
        >
          ◀︎
        </PrevPage>
        <PageNumber>{page + 1}</PageNumber>
        <NextPage
          onClick={() => {
            setPage((prev) => prev + 1);
          }}
        >
          ▶︎
        </NextPage>
      </ButtonBox>
    </BooksPage>
  );
}
