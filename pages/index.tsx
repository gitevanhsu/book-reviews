import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";
import { BookInfo, getBooks } from "../utils/firebaseFuncs";
import bookcover from "/public/img/bookcover.jpeg";
import Portal from "../components/portal";
import SignupComponent from "../components/signup";
import bookImg from "../public/img/book.jpg";

const HomeWelcome = styled.div`
  height: 60vh;
  background-color: ${(props) => props.theme.grey};
  overflow: hidden;
  position: relative;
`;
const WelcomeImage = styled(Image)`
  opacity: 0.5;
  width: 100%;
  height: auto;
  top: 50%;
  left: 50%;
  position: relative;
  transform: translate(-50%, -50%);
  @media screen and (max-width: 768px) {
    height: 100%;
  }
`;
const WelcomeText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
`;

const HomeMain = styled.main`
  background-color: ${(props) => props.theme.lightWhite};
  padding: 120px 0;
`;

const Texts = styled.div`
  display: flex;
  flex-direction: column;
  & + & {
    margin-top: 100px;
  }
`;
const Quote = styled.q`
  font-size: ${(props) => props.theme.fz * 3}px;
  @media screen and (max-width: 992px) {
    font-size: ${(props) => props.theme.fz * 3}px;
  }
  @media screen and (max-width: 768px) {
    font-size: ${(props) => props.theme.fz * 3}px;
  }
  @media screen and (max-width: 480px) {
    font-size: ${(props) => props.theme.fz * 2}px;
  }
`;
const Person = styled.p`
  font-size: ${(props) => props.theme.fz * 2}px;
  margin-top: 30px;
  align-self: end;
  /* @media screen and (max-width: 992px) {
    font-size: ${(props) => props.theme.fz * 2}px;
  }
  @media screen and (max-width: 768px) {
    font-size: ${(props) => props.theme.fz * 2}px;
  }
  @media screen and (max-width: 480px) {
    font-size: ${(props) => props.theme.fz * 2}px;
  } */
`;

const PageTitle = styled.h1`
  font-size: ${(props) => props.theme.fz * 3}px;
  padding: 20px 0;
  text-align: center;
  @media screen and (max-width: 480px) {
    font-size: ${(props) => props.theme.fz * 2}px;
  }
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
  @media screen and (max-width: 480px) {
    width: calc(100vw - 100px);
  }
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
  width: 20%;
  height: 100%;
  vertical-align: middle;
  text-align: center;
  padding: 20px 0;
  transition: 0.2s;
  @media screen and (max-width: 1280px) {
    width: 25%;
  }
  @media screen and (max-width: 992px) {
    width: 33.333333333%;
  }
  @media screen and (max-width: 768px) {
    width: 50%;
  }
  @media screen and (max-width: 480px) {
    width: 100%;
  }
`;
const Book = styled.div`
  position: relative;
`;
const BookImg = styled(Image)`
  box-shadow: 5px 5px 5px ${(props) => props.theme.black};
`;
const ButtonRight = styled.div<ColorProps>`
  clip-path: polygon(33% 0, 100% 50%, 33% 100%);
  width: 70px;
  height: 70px;
  display: inline-block;
  cursor: pointer;
  background-color: ${(props) =>
    props.arrcolor ? props.theme.grey : props.theme.greyBlue};
  opacity: 0.7;
  &:hover {
    opacity: 1;
  }
  @media screen and (max-width: 480px) {
    width: 50px;
  }
`;
const Buttonleft = styled(ButtonRight)<ColorProps>`
  background-color: ${(props) =>
    props.arrcolor ? props.theme.grey : props.theme.greyBlue};
  clip-path: polygon(67% 0, 0 50%, 67% 100%);
`;
const BookInfoTitle = styled.h3`
  font-size: ${(props) => props.theme.fz * 1}px;
  font-weight: 700;
  margin-top: 20px;
  margin-bottom: 10px;
`;
const BookTitle = styled.h2`
  font-size: ${(props) => props.theme.fz * 2}px;
  white-space: pre-wrap;
`;

const BookAuthor = styled.p`
  font-size: ${(props) => props.theme.fz * 1}px;
  white-space: pre-wrap;
`;
const NoimgTitle = styled.h2`
  position: absolute;
  color: #fff;
  font-size: ${(props) => props.theme.fz * 1}px;
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
      <HomeWelcome>
        <WelcomeImage src={bookImg} alt="book" />
        <WelcomeText>
          <Texts>
            <Quote>
              &ldquo; A room without books is like a body without a soul.&rdquo;
            </Quote>
            <Person>― Marcus Tullius Cicero</Person>
          </Texts>
          {/* <Texts>
            <Quote>&ldquo;Reading brings us unknown friends.&rdquo;</Quote>
            <Person>― Honore de Belzac</Person>
          </Texts> */}
        </WelcomeText>
      </HomeWelcome>
      <HomeMain>
        <PageTitle>Pick up the one you like!</PageTitle>
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
                        <BookImg
                          src={
                            book.smallThumbnail
                              ? book.smallThumbnail
                              : bookcover
                          }
                          alt={`${book.title}`}
                          width={100}
                          height={150}
                        />
                      </Link>
                      {!book.smallThumbnail && (
                        <NoimgTitle>{book.title}</NoimgTitle>
                      )}
                      <BookInfoTitle>書名：</BookInfoTitle>
                      <BookTitle>{book.title}</BookTitle>
                      <BookInfoTitle>作者：</BookInfoTitle>
                      {book.authors && book.authors[0]?.length > 0 && (
                        <BookAuthor>{book.authors[0]}</BookAuthor>
                      )}
                    </Book>
                  </BookWarp>
                );
              })}
          </Books>
          {books && (
            <ButtonRight
              arrcolor={books?.length - 5 === page}
              onClick={() => {
                setPage((prev) =>
                  prev === books!.length - 5 ? books!.length - 5 : prev + 1
                );
              }}
            />
          )}
        </BooksWrap>
      </HomeMain>
    </>
  );
}
