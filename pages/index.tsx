import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";
import { BookInfo, getBooks } from "../utils/firebaseFuncs";
import bookcover from "/public/img/bookcover.jpeg";
import Portal from "../components/portal";
import SignupComponent from "../components/signup";

const PageTitle = styled.h1`
  font-size: 36px;
  padding: 20px 0;
  text-align: center;
`;
const BooksWrap = styled.div`
  display: flex;
  align-items: center;
  padding: 0 10px;
`;
const Books = styled.div`
  display: inline-block;
  width: calc(100vw - 200px);
  height: 300px;
  white-space: nowrap;
  overflow: hidden;
`;
interface PageProps {
  page: number;
}
interface ColorProps {
  arrcolor: boolean;
}
const BookWarp = styled.div<PageProps>`
  transform: ${(props) => `translateX(${props.page * -100}%)`};
  display: inline-block;
  position: relative;
  width: 25%;
  height: 100%;
  border: solid 1px;
  vertical-align: middle;
  text-align: center;
  padding: 20px 0;
  transition: 0.2s;
`;
const Book = styled.div`
  position: relative;
`;
const ButtonRight = styled.div<ColorProps>`
  clip-path: polygon(33% 0, 100% 50%, 33% 100%);
  width: 100px;
  height: 100px;
  display: inline-block;
  cursor: pointer;
  background-color: ${(props) => (props.arrcolor ? "#ccc" : "#e5a800")};
  border: solid 1px;
  opacity: 0.7;
  &:hover {
    opacity: 1;
  }
`;
const Buttonleft = styled(ButtonRight)<ColorProps>`
  background-color: ${(props) => (props.arrcolor ? "#ccc" : "#e5a800")};
  clip-path: polygon(67% 0, 0 50%, 67% 100%);
`;

const BookTitle = styled.h2`
  margin-top: 20px;
  white-space: pre-wrap;
`;

const BookAuthor = styled.p`
  margin-top: 20px;
`;
const NoimgTitle = styled.h2`
  position: absolute;
  color: #fff;
  font-size: 12px;
  width: 100px;
  height: 150px;
  overflow: hidden;
  padding: 20px 10px;
  text-align: center;
  letter-spacing: 2px;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  white-space: pre-wrap;
  pointer-events: none;
`;
export default function Home() {
  const [books, setBooks] = useState<BookInfo[]>();
  const [page, setPage] = useState<number>(0);

  useEffect(() => {
    const homepageBooks = async () => {
      const result = await getBooks();
      setBooks(result);
    };
    homepageBooks();
  }, []);
  return (
    <>
      <PageTitle>Book Reviews</PageTitle>
      <BooksWrap>
        <Buttonleft
          arrcolor={0 === page}
          onClick={() => {
            setPage((prev) => (prev === 0 ? 0 : prev - 1));
          }}
        />
        <Books>
          {books &&
            books.map((book) => {
              return (
                <BookWarp key={book.isbn} page={page}>
                  <Book>
                    <Link href={`/book/id:${book.isbn}`}>
                      <Image
                        src={
                          book.smallThumbnail ? book.smallThumbnail : bookcover
                        }
                        alt={`${book.title}`}
                        width={100}
                        height={150}
                      />
                    </Link>
                    {!book.smallThumbnail && (
                      <NoimgTitle>{book.title}</NoimgTitle>
                    )}
                    <BookTitle>書名{"\n\n" + book.title}</BookTitle>
                    {book.authors && book.authors[0]?.length > 0 && (
                      <BookAuthor>作者：{book.authors[0]}</BookAuthor>
                    )}
                  </Book>
                </BookWarp>
              );
            })}
        </Books>
        {books && (
          <ButtonRight
            arrcolor={books?.length - 4 === page}
            onClick={() => {
              setPage((prev) =>
                prev === books!.length - 4 ? books!.length - 4 : prev + 1
              );
            }}
          />
        )}
      </BooksWrap>
    </>
  );
}
