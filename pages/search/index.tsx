import { doc, getDoc, setDoc } from "firebase/firestore";
import styled from "styled-components";
import searchImg from "public/img/search.png";
import { useEffect, useRef, useState } from "react";
import { BookInfo, db } from "../../utils/firebaseFuncs";
import Link from "next/link";
import Image from "next/image";
import bookcover from "/public/img/bookcover.jpeg";
import { useRouter } from "next/router";

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

const BookImg = styled(Image)``;
const Title = styled.h1`
  width: 100%;
  margin: 15px auto;
  font-size: ${(props) => props.theme.fz * 1.5}px;
  color: ${(props) => props.theme.black};
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
  padding: 5px 0;
  max-width: 200px;
  margin: 10px auto;
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
  margin-bottom: 10px;
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

export default function Search() {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [books, setBooks] = useState<BookInfo[]>();
  const booksRef = useRef<HTMLDivElement>(null);
  const [serchValue, setSerchValue] = useState<string>("");
  const noResultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (booksRef && booksRef.current) {
      booksRef.current.scrollIntoView({ behavior: "smooth" });
    }
  });

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
                inputRef.current.value = "";
              }
            }}
          />
        </SearchBox>
        {books && (
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
