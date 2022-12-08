import { useState } from "react";
import { GetServerSideProps } from "next";
import Image from "next/image";
import Link from "next/link";

import styled from "styled-components";

import { BookInfo, getBooks } from "../utils/firebaseFuncs";
import {
  bookCover,
  book,
  hpBooks,
  friends,
  rating,
  bookshelf,
} from "../utils/imgs";

const HomeWelcome = styled.div`
  height: 55vh;
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
  background-color: ${(props) => props.theme.grey};
  padding: 50px 0 100px;
`;

const Texts = styled.div`
  display: flex;
  flex-direction: column;
  & + & {
    margin-top: 100px;
  }
`;
const Quote = styled.q`
  font-weight: 600;
  font-size: ${(props) => props.theme.fz1};
  @media screen and (max-width: 768px) {
    font-size: ${(props) => props.theme.fz2};
  }
  @media screen and (max-width: 576px) {
    font-size: ${(props) => props.theme.fz3};
  }
`;
const Person = styled.p`
  font-size: ${(props) => props.theme.fz2};
  margin-top: 30px;
  align-self: end;
  @media screen and (max-width: 768px) {
    font-size: ${(props) => props.theme.fz3};
  }
  @media screen and (max-width: 576px) {
    font-size: ${(props) => props.theme.fz4};
  }
`;

const PageTitle = styled.h1`
  font-size: ${(props) => props.theme.fz2};
  padding-bottom: 50px;
  text-align: center;
  @media screen and (max-width: 480px) {
    font-size: ${(props) => props.theme.fz3};
  }
`;
const BooksWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
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
  padding: 0 30px;
`;
const BookImg = styled(Image)`
  box-shadow: 5px 5px 5px ${(props) => props.theme.black};
`;

interface ColorProps {
  arrColor: boolean;
}
const ButtonRight = styled.div<ColorProps>`
  clip-path: polygon(33% 0, 100% 50%, 33% 100%);
  width: 70px;
  height: 70px;
  display: inline-block;
  cursor: pointer;
  background-color: ${(props) =>
    props.arrColor ? props.theme.grey : props.theme.darkYellow};
  opacity: 0.7;
  &:hover {
    opacity: 1;
  }
  @media screen and (max-width: 480px) {
    width: 50px;
  }
`;
const ButtonLeft = styled(ButtonRight)<ColorProps>`
  background-color: ${(props) =>
    props.arrColor ? props.theme.grey : props.theme.darkYellow};
  clip-path: polygon(67% 0, 0 50%, 67% 100%);
`;
const BookTitle = styled.h2`
  font-size: ${(props) => props.theme.fz3};
  font-weight: 600;
  white-space: pre-wrap;
  margin-top: 30px;
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const BookAuthor = styled.p`
  font-size: ${(props) => props.theme.fz4};
  white-space: pre-wrap;
  margin-bottom: 10px;
`;
const NoImgTitle = styled.h2`
  position: absolute;
  color: ${(props) => props.theme.white};
  font-size: ${(props) => props.theme.fz4};
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

const FeatureMain = styled.div`
  width: 100%;
  padding: 20px 20px;
  background-color: ${(props) => props.theme.white};
`;
const FeatureWrap = styled.div`
  margin: 20px auto;
  max-width: 1280px;
  display: flex;
  flex-wrap: wrap;
`;
const FeatureBox = styled.div`
  letter-spacing: 1px;
  padding: 20px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 25%;
  @media screen and (max-width: 768px) {
    width: 50%;
  }
  @media screen and (max-width: 480px) {
    width: 100%;
  }
`;
const FeatureImg = styled(Image)`
  width: 60px;
  height: 60px;
`;
const FeatureTitle = styled.h2`
  font-size: ${(props) => props.theme.fz3};
  border-bottom: 4px solid ${(props) => props.theme.darkYellow};
  margin: 35px 0 15px;
  font-weight: 600;
`;
const FeatureContent = styled.p`
  text-align: center;
  line-height: 20px;
  font-size: ${(props) => props.theme.fz4};
  @media screen and (max-width: 768px) {
    font-size: ${(props) => props.theme.fz5};
  }
`;

function FeatureComponent() {
  return (
    <FeatureMain>
      <FeatureWrap>
        <FeatureBox>
          <FeatureImg src={hpBooks} alt="Books" />
          <FeatureTitle>各樣書籍</FeatureTitle>
          <FeatureContent>
            種類多樣的書籍資料庫
            <br />
            遇見優質書籍
          </FeatureContent>
        </FeatureBox>
        <FeatureBox>
          <FeatureImg src={rating} alt="rating" />
          <FeatureTitle>優質評論</FeatureTitle>
          <FeatureContent>
            按讚優質評論
            <br />
            讓好的評論被更多人看到
          </FeatureContent>
        </FeatureBox>
        <FeatureBox>
          <FeatureImg src={bookshelf} alt="bookshelf" />
          <FeatureTitle>分享書櫃</FeatureTitle>
          <FeatureContent>
            建立自己的書櫃
            <br />
            分享自己最喜歡的書籍
          </FeatureContent>
        </FeatureBox>
        <FeatureBox>
          <FeatureImg src={friends} alt="friends" />
          <FeatureTitle>以書會友</FeatureTitle>
          <FeatureContent>
            加入專屬討論區
            <br />
            認識志同道合的朋友
          </FeatureContent>
        </FeatureBox>
      </FeatureWrap>
    </FeatureMain>
  );
}

interface HomeProps {
  books: BookInfo[];
}
export default function Home({ books }: HomeProps) {
  const [page, setPage] = useState<number>(0);
  return (
    <>
      <HomeWelcome>
        <WelcomeImage src={book} alt="book" priority />
        <WelcomeText>
          <Texts>
            <Quote>
              &ldquo; A room without books is like a body without a soul.&rdquo;
            </Quote>
            <Person>― Marcus Tullius Cicero</Person>
          </Texts>
        </WelcomeText>
      </HomeWelcome>
      <FeatureComponent />
      <HomeMain>
        <PageTitle>好書推薦</PageTitle>
        <BooksWrap>
          <ButtonLeft
            arrColor={0 === page}
            onClick={() => {
              setPage((prev) => (prev === 0 ? 0 : prev - 1));
            }}
          />
          <Books>
            {books.map((book) => {
              return (
                <BookWarp key={book.isbn} page={page}>
                  <Book>
                    <Link href={`/book/id:${book.isbn}`}>
                      <BookImg
                        src={
                          book.smallThumbnail ? book.smallThumbnail : bookCover
                        }
                        alt={`${book.title}`}
                        width={100}
                        height={150}
                      />
                    </Link>
                    {!book.smallThumbnail && (
                      <NoImgTitle>{book.title}</NoImgTitle>
                    )}
                    <BookTitle>{book.title}</BookTitle>
                    {book.authors && book.authors[0]?.length > 0 && (
                      <BookAuthor>{book.authors[0]}</BookAuthor>
                    )}
                  </Book>
                </BookWarp>
              );
            })}
          </Books>
          <ButtonRight
            arrColor={books?.length - 5 === page}
            onClick={() => {
              setPage((prev) =>
                prev === books!.length - 5 ? books!.length - 5 : prev + 1
              );
            }}
          />
        </BooksWrap>
      </HomeMain>
    </>
  );
}

export const getStaticProps: GetServerSideProps = async () => {
  const result = await getBooks();
  return {
    props: {
      books: result,
    },
  };
};
