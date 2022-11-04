import { doc, getDoc, setDoc } from "firebase/firestore";
import styled from "styled-components";
import searchImg from "public/img/search.png";
import { useRef, useState } from "react";
import { BookInfo, db } from "../../utils/firebaseFuncs";
import Link from "next/link";
import Image from "next/image";
import bookcover from "/public/img/bookcover.jpeg";
import { useRouter } from "next/router";

const Title = styled.h1``;
const SearchBox = styled.div``;
const SearchInput = styled.input``;
const SearchBtton = styled.button`
  border: solid 1px;
  cursor: pointer;
`;

const Books = styled.div`
  display: flex;
  flex-wrap: wrap;
`;
const Book = styled.div`
  position: relative;
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
const Move = styled.div`
  cursor: pointer;
  display: inline-block;
  min-width: 128px;
  min-height: 193px;
  position: relative;
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

export default function Search() {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [books, setBooks] = useState<BookInfo[]>();

  const bookSearcher = async (input: string) => {
    const result = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=intitle:${input}&maxResults=40&key=${process.env.NEXT_PUBLIC_GOOGLE_BOOK_API}`
    );
    const books: BookInfo[] = [];
    const parseData = await result.json();
    parseData.items.map((book: any) => {
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
    <>
      <Title>請輸入您想搜尋的書籍</Title>
      <SearchBox>
        <SearchInput ref={inputRef} />
        <SearchBtton
          onClick={() => {
            inputRef &&
              inputRef.current &&
              bookSearcher(inputRef.current.value);
          }}
        >
          搜尋
        </SearchBtton>
      </SearchBox>
      {books && (
        <Books>
          {books.map((data) => {
            return (
              <Book key={data.isbn}>
                <Move
                  onClick={() => {
                    move(data);
                  }}
                >
                  <Image
                    src={data.smallThumbnail ? data.smallThumbnail : bookcover}
                    alt={`${data.title}`}
                    width={128}
                    height={193}
                  />
                </Move>
                {!data.smallThumbnail && <NoimgTitle>{data.title}</NoimgTitle>}
                <BookTitle>書名：{data.title}</BookTitle>
                {data.subtitle && <BookSubTitle>{data.subtitle}</BookSubTitle>}
                {data.authors &&
                  data.authors?.map((author) => (
                    <BookAuthor key={author}>作者:{author}</BookAuthor>
                  ))}
                {data.categories &&
                  data.categories?.map((category) => (
                    <Categories key={category}>分類：{category}</Categories>
                  ))}
                <BookPublisher>出版社：{data.publisher}</BookPublisher>
                <BookPublishedDate>
                  出版日期：{data.publishedDate}
                </BookPublishedDate>
                <BookIsbn>ISBN：{data.isbn}</BookIsbn>
                <BookTextSnippet>簡介：{data.textSnippet}</BookTextSnippet>
              </Book>
            );
          })}
        </Books>
      )}
    </>
  );
}
