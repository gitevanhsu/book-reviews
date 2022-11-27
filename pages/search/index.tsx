import { doc, getDoc, setDoc } from "firebase/firestore";
import styled from "styled-components";
import searchImg from "public/img/search.png";
import { useEffect, useRef, useState } from "react";
import { BookInfo, db, getRandomBooks } from "../../utils/firebaseFuncs";
import Image from "next/image";
import bookcover from "/public/img/bookcover.jpeg";
import { useRouter } from "next/router";
import produce from "immer";
import remove from "/public/img/hp-books.png";
import { GetStaticProps, GetServerSideProps } from "next";

const SearchPage = styled.main`
  width: 100%;
  min-height: calc(100vh - 60px);
  background-color: ${(props) => props.theme.grey};
`;
const SearchPageWrap = styled.div`
  padding: 50px 30px;
  max-width: 1280px;
  margin: 0 auto;
  text-align: center;
`;

const BookImg = styled(Image)`
  box-shadow: 0px 0px 15px ${(props) => props.theme.black};
`;
const Title = styled.h1`
  width: 100%;
  margin: 25px auto 5px;
  font-size: ${(props) => props.theme.fz * 1.5}px;
  color: ${(props) => props.theme.black};
  & + & {
    margin: 5px auto 25px;
  }
`;
const SearchBox = styled.div`
  display: flex;
  border-bottom: 1px solid ${(props) => props.theme.greyBlue};
`;
const SearchInput = styled.input`
  border: none;
  background-color: transparent;
  width: 100%;
  padding: 0 10px;
  font-size: ${(props) => props.theme.fz * 2}px;
  &:focus {
    outline: none;
  }
  @media screen and (max-width: 576px) {
    font-size: ${(props) => props.theme.fz * 1.5}px;
  }
`;
const SearchBtton = styled(Image)`
  cursor: pointer;
`;
const NoResult = styled.div`
  margin-top: 20px;
`;

const Books = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 20px auto;
  display: flex;
  flex-wrap: wrap;
`;
const Book = styled.div`
  position: relative;
  width: 50%;
  padding: 20px 20px;
  border-bottom: 1px solid ${(props) => props.theme.black};
  @media screen and (max-width: 576px) {
    width: 100%;
  }
`;
const BookInfos = styled.div`
  padding: 10px 0;
  max-width: 200px;
  margin: 30px auto;
`;
const BookTitle = styled.h2`
  font-size: ${(props) => props.theme.fz * 1.5}px;
  height: ${(props) => props.theme.fz * 3 + 2}px;
  display: -webkit-box;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  white-space: wrap;
  margin-bottom: 10px;
`;
const BookAuthor = styled.h3`
  font-size: ${(props) => props.theme.fz * 1.2}px;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const BookIsbn = styled.p`
  font-size: ${(props) => props.theme.fz}px;
`;

const Move = styled.div`
  cursor: pointer;
  display: inline-block;
  min-width: 128px;
  min-height: 193px;
  position: relative;
`;
const NoimgTitle = styled.h2`
  position: absolute;
  color: ${(props) => props.theme.white};
  font-size: ${(props) => props.theme.fz * 2}px;
  width: 180px;
  height: 271px;
  overflow: hidden;
  padding: 20px 10px;
  text-align: center;
  letter-spacing: 2px;
  top: 0;
  left: 0;
  pointer-events: none;
`;
const DefaultTitle = styled(Title)`
  font-size: ${(props) => props.theme.fz * 1.5}px;
  margin: 30px 0;
`;
const HistoryTitle = styled.p`
  font-size: ${(props) => props.theme.fz * 1.2}px;
`;
const HistoryBox = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 5px 10px;
  margin-top: 0px;
  & > ${HistoryTitle} {
    margin: 10px 0;
    font-size: ${(props) => props.theme.fz * 1.2}px;
    font-weight: 700;
    letter-spacing: 1px;
    text-align: start;
    width: 100%;
  }
`;
const History = styled.div`
  display: flex;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 10px;
  background-color: ${(props) => props.theme.yellow};
  align-items: center;
  &:hover {
    background-color: ${(props) => props.theme.greyBlue};
  }
  & + & {
    margin-left: 10px;
  }
`;

const HistoryRemove = styled(Image)`
  width: 20px;
  height: 20px;
  padding: 2px;
  border-radius: 5px;
  margin-left: 10px;
`;

export default function Search({ defaultBooks }: { defaultBooks: BookInfo[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [books, setBooks] = useState<BookInfo[]>();
  const booksRef = useRef<HTMLDivElement>(null);
  const [serchValue, setSerchValue] = useState<string>("");
  const noResultRef = useRef<HTMLDivElement>(null);
  const [histories, sethistories] = useState<string[]>([]);

  useEffect(() => {
    const localData = localStorage.getItem("keyWord");
    if (localData) {
      const keywords = (JSON.parse(localData) as string[]) || [];
      sethistories(keywords);
    }
  }, []);

  useEffect(() => {
    if (booksRef && booksRef.current) {
      booksRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [books]);

  const bookSearcher = async (input: string) => {
    const result = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=intitle:${input}&maxResults=40&key=${process.env.NEXT_PUBLIC_GOOGLE_BOOK_API}`
    );
    const books: BookInfo[] = [];
    const parseData = await result.json();
    parseData.items?.map((book: any) => {
      const bookIsbnArr = book.volumeInfo.industryIdentifiers?.filter(
        (isbn: any) => {
          if (isbn.type === "ISBN_13") {
            return isbn.identifier;
          }
        }
      );
      if (bookIsbnArr?.length > 0) {
        const isbn = bookIsbnArr[0].identifier;
        const bookDatas: BookInfo = {
          isbn: isbn,
          title: book.volumeInfo.title || "",
          subtitle: book.volumeInfo.subtitle || "",
          authors: book.volumeInfo.authors || [],
          categories: book.volumeInfo.categories || [],
          thumbnail: book.volumeInfo.imageLinks?.thumbnail || "",
          smallThumbnail: book.volumeInfo.imageLinks?.smallThumbnail || "",
          textSnippet: book.searchInfo?.textSnippet || "",
          description: book.volumeInfo.description || "",
          publisher: book.volumeInfo.publisher || "",
          publishedDate: book.volumeInfo.publishedDate || "",
          infoLink: book.volumeInfo.infoLink || "",
          ratingMember: [],
          ratingCount: 0,
          reviewCount: 0,
        };
        books.push(bookDatas);
      }
    });
    setBooks(books);
  };
  const move = async (data: BookInfo) => {
    if (data.isbn) {
      const docSnap = await getDoc(doc(db, "books", data.isbn));
      if (docSnap.exists()) {
        router.push(`/book/id:${data.isbn}`);
      } else {
        await setDoc(doc(db, "books", data.isbn), data);
        router.push(`/book/id:${data.isbn}`);
      }
    }
  };
  const saveKeyword = (value: string) => {
    const localData = localStorage.getItem("keyWord");
    if (localData) {
      const keywords = (JSON.parse(localData) as string[]) || [];
      if (keywords.includes(value)) return;
      const newKeywords = produce(keywords, (draft) => {
        draft.unshift(value);
        if (draft.length > 5) draft.splice(5, draft.length - 1);
      });
      localStorage.setItem("keyWord", JSON.stringify(newKeywords));
      sethistories(newKeywords);
    } else {
      const keywords: string[] = [];
      const newKeywords = produce(keywords, (draft) => {
        draft.push(value);
      });
      localStorage.setItem("keyWord", JSON.stringify(newKeywords));
      sethistories(newKeywords);
    }
  };
  return (
    <SearchPage>
      <SearchPageWrap>
        <SearchBox>
          <SearchInput
            ref={inputRef}
            placeholder="請輸入您想查詢的關鍵字......"
            onKeyPress={(e) => {
              if (
                e.code === "Enter" &&
                inputRef &&
                inputRef.current &&
                inputRef.current.value.trim()
              ) {
                bookSearcher(inputRef.current.value);
                setSerchValue(inputRef.current.value);
                saveKeyword(inputRef.current.value);
                inputRef.current.value = "";
              }
            }}
          />
          <SearchBtton
            width={20}
            height={20}
            src={searchImg}
            alt="search Image"
            onClick={() => {
              if (
                inputRef &&
                inputRef.current &&
                inputRef.current.value.trim()
              ) {
                bookSearcher(inputRef.current.value);
                setSerchValue(inputRef.current.value);
                saveKeyword(inputRef.current.value);
                inputRef.current.value = "";
              }
            }}
          />
        </SearchBox>
        <HistoryBox>
          {histories.length > 0 && <HistoryTitle>搜尋紀錄</HistoryTitle>}
          {histories &&
            histories.map((history) => (
              <History
                key={history}
                onClick={() => {
                  bookSearcher(history);
                  setSerchValue(history);
                }}
              >
                <HistoryTitle>{history}</HistoryTitle>
                <HistoryRemove src={remove} alt="Remove Btn" />
              </History>
            ))}
        </HistoryBox>
        {books ? (
          <Books ref={booksRef}>
            <Title>查詢關鍵字: {serchValue}</Title>
            <Title>查詢結果共 {books.length} 筆資料</Title>
            {books.map((data) => {
              return (
                <Book key={data.isbn}>
                  <Move
                    onClick={() => {
                      move(data);
                    }}
                  >
                    <BookImg
                      src={
                        data.smallThumbnail ? data.smallThumbnail : bookcover
                      }
                      alt={`${data.title}`}
                      width={180}
                      height={271}
                    />
                    {!data.smallThumbnail && (
                      <NoimgTitle>{data.title}</NoimgTitle>
                    )}
                  </Move>
                  <BookInfos>
                    <BookTitle>{data.title}</BookTitle>
                    {data.authors && data.authors && (
                      <BookAuthor>{data.authors[0]}</BookAuthor>
                    )}
                    <BookIsbn>ISBN：{data.isbn}</BookIsbn>
                  </BookInfos>
                </Book>
              );
            })}
          </Books>
        ) : (
          <Books>
            <DefaultTitle>這些書也不錯喔！</DefaultTitle>
            {defaultBooks?.map((data) => (
              <Book key={data.isbn}>
                <Move
                  onClick={() => {
                    move(data);
                  }}
                >
                  <BookImg
                    src={data.smallThumbnail ? data.smallThumbnail : bookcover}
                    alt={`${data.title}`}
                    width={180}
                    height={271}
                  />
                  {!data.smallThumbnail && (
                    <NoimgTitle>{data.title}</NoimgTitle>
                  )}
                </Move>
                <BookInfos>
                  <BookTitle>{data.title}</BookTitle>
                  {data.authors && data.authors && (
                    <BookAuthor>{data.authors[0]}</BookAuthor>
                  )}
                  <BookIsbn>ISBN：{data.isbn}</BookIsbn>
                </BookInfos>
              </Book>
            ))}
          </Books>
        )}
        {books && books.length === 0 && (
          <NoResult ref={noResultRef}>
            <Title>查無搜尋結果</Title>
            <Title>請用其他關鍵字搜尋</Title>
          </NoResult>
        )}
      </SearchPageWrap>
    </SearchPage>
  );
}
export const getStaticProps: GetStaticProps = async () => {
  const defaultBooks = await getRandomBooks();
  return {
    props: {
      defaultBooks,
    },
  };
};
