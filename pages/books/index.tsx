import { useEffect, useRef, useState } from "react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import Image from "next/image";

import styled from "styled-components";
import produce from "immer";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import { doc, DocumentData, getDoc, setDoc } from "firebase/firestore";
import {
  loadBooks,
  BookInfo,
  getFirstBooks,
  getBookRef,
  db,
} from "../../utils/firebaseFuncs";
import { bookCover, searchImg } from "../../utils/imgs";

const BooksPage = styled.div`
  padding: 50px 30px;
  background-color: ${(props) => props.theme.white};
  min-height: calc(100vh - 60px);
`;

const Books = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
`;
const BookData = styled.div`
  text-align: center;
  width: 25%;
  @media screen and (max-width: 922px) {
    width: 50%;
  }
  @media screen and (max-width: 480px) {
    width: 100%;
  }
`;
const BookTitle = styled.h2`
  padding: 0 40px;
  margin-bottom: 15px;
  font-size: ${(props) => props.theme.fz3};
  line-height: 28px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const BookAuthor = styled.h4`
  padding: 0 40px;
  margin-bottom: 5px;
  font-weight: 600;
  font-size: ${(props) => props.theme.fz4};
`;
const BookTextSnippet = styled.p`
  display: inline-block;
  padding: 0 40px;
  font-size: ${(props) => props.theme.fz5};
  line-height: 18px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
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
  line-height: ${(props) => props.theme.fz3};
  font-size: ${(props) => props.theme.fz4};
  text-align: center;
  border: 1px solid ${(props) => props.theme.grey};
  color: ${(props) => props.theme.black};
  cursor: pointer;
  &:hover {
    background-color: ${(props) => props.theme.darkYellow};
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
      props.hasPrev ? "transparent" : props.theme.darkYellow};
  }
`;
const PageNumber = styled.p`
  font-size: ${(props) => props.theme.fz3};
  margin: 0 20px;
`;
const Book = styled.div`
  padding: 40px 0;
  height: 100%;
  text-align: center;
  position: relative;
  border-bottom: 1px solid ${(props) => props.theme.darkYellow};
`;
const BookLink = styled.div`
  cursor: pointer;
  display: inline-block;
  position: relative;
`;
const BookImg = styled(Image)`
  box-shadow: 5px 5px 10px ${(props) => props.theme.black};
`;
const BookDetail = styled.div`
  margin: 40px auto 0;
  max-width: 280px;
  text-align: left;
`;

const NoImgTitle = styled.h2`
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
  const router = useRouter();
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
    <Book>
      <BookLink onClick={() => move(data)}>
        <BookImg
          src={data.smallThumbnail ? data.smallThumbnail : bookCover}
          alt={`${data.title}`}
          width={128}
          height={193}
        />
        {!data.smallThumbnail && <NoImgTitle>{data.title}</NoImgTitle>}
      </BookLink>
      <BookDetail>
        <BookTitle>{data.title}</BookTitle>
        {data.authors && <BookAuthor>{data.authors[0]}</BookAuthor>}
        <BookTextSnippet>{data.textSnippet}</BookTextSnippet>
      </BookDetail>
    </Book>
  );
}

const SearchBox = styled.div`
  display: flex;
  border-bottom: 1px solid ${(props) => props.theme.darkYellow};
`;
const SearchInput = styled.input`
  border: none;
  background-color: transparent;
  width: 100%;
  padding: 0 10px;
  font-size: ${(props) => props.theme.fz3};
  &:focus {
    outline: none;
  }
  @media screen and (max-width: 576px) {
    font-size: ${(props) => props.theme.fz4};
  }
`;
const SearchButton = styled(Image)`
  cursor: pointer;
`;
const HistoryTitle = styled.p`
  display: inline-block;
  font-size: ${(props) => props.theme.fz4};
  padding-left: 10px;
  margin: 10px 0;
  font-weight: 700;
  letter-spacing: 1px;
  text-align: start;
  width: 100%;
`;
const HistoryBox = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 0px;
`;

const History = styled.div`
  display: flex;
  padding: 5px 10px;
  font-size: ${(props) => props.theme.fz5};
  cursor: pointer;
  border-radius: 10px;
  background-color: ${(props) => props.theme.yellow};
  margin: 5px;
  &:hover {
    background-color: ${(props) => props.theme.darkYellow};
  }
`;

const SearchBooks = styled.div`
  width: 100%;
  margin: 20px;
  display: flex;
  flex-wrap: wrap;
`;

const SearchTitle = styled.h1`
  text-align: center;
  width: 100%;
  margin: 25px auto 5px;
  font-size: ${(props) => props.theme.fz4};
  color: ${(props) => props.theme.black};
  & + & {
    margin: 5px auto 25px;
  }
`;

const SearchNoResult = styled.div`
  width: 100%;
  margin-top: 20px;
  text-align: center;
`;
interface GoogleBook {
  items: {
    volumeInfo: {
      industryIdentifiers: { type: string; identifier: string }[];
      title: string;
      subtitle: string;
      authors: string[];
      categories: string[];
      description: string;
      publisher: string;
      publishedDate: string;
      infoLink: string;
      imageLinks: { smallThumbnail: string; thumbnail: string } | undefined;
    };
    searchInfo: { textSnippet: string } | undefined;
  }[];
}

export default function BooksComponent({
  firstBook,
}: {
  firstBook: BookInfo[];
}) {
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookData, setBookData] = useState<BookInfo[]>(firstBook);
  const [searchBooks, setSearchBooks] = useState<BookInfo[]>([]);
  const [histories, setHistories] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [page, setPage] = useState<number>(0);

  const pageRef = useRef<DocumentData>();
  const inputRef = useRef<HTMLInputElement>(null);
  const noResultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lastIsbn = firstBook[firstBook.length - 1]?.isbn;
    const bookRef = async (lastIsbn: string) => {
      const result = await getBookRef(lastIsbn);
      pageRef.current = result;
    };
    lastIsbn && bookRef(lastIsbn);
  }, [firstBook]);

  useEffect(() => {
    if (page + 1 > bookData.length / 16) {
      loadBooks(page, pageRef.current).then(({ booksData, lastVisible }) => {
        setBookData([...bookData, ...booksData]);
        pageRef.current = lastVisible;
      });
    }
  }, [bookData, page]);

  useEffect(() => {
    const localData = localStorage.getItem("keyWord");
    if (localData) {
      const keywords = (JSON.parse(localData) as string[]) || [];
      setHistories(keywords);
    }
  }, []);

  const bookSearcher = async (input: string) => {
    const result = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=intitle:${input}&maxResults=40&key=${process.env.NEXT_PUBLIC_GOOGLE_BOOK_API}`
    );
    const books: BookInfo[] = [];
    const parseData = (await result.json()) as GoogleBook;
    parseData.items?.map((book) => {
      const bookIsbnArr = book.volumeInfo.industryIdentifiers?.filter(
        (isbn) => {
          if (isbn.type === "ISBN_13") {
            return isbn.identifier;
          }
        }
      );
      if (bookIsbnArr?.length > 0) {
        const isbn = bookIsbnArr[0].identifier;
        const bookData = {
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
        } as BookInfo;
        books.push(bookData);
      }
    });
    setSearchBooks(books);
    setLoading(false);
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
      setHistories(newKeywords);
    } else {
      const keywords: string[] = [];
      const newKeywords = produce(keywords, (draft) => {
        draft.push(value);
      });
      localStorage.setItem("keyWord", JSON.stringify(newKeywords));
      setHistories(newKeywords);
    }
  };

  return (
    <BooksPage>
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
              setLoading(true);
              setShowSearch(true);
              bookSearcher(inputRef.current.value);
              setSearchValue(inputRef.current.value);
              saveKeyword(inputRef.current.value);
              inputRef.current.value = "";
            }
          }}
        />
        <SearchButton
          width={20}
          height={20}
          src={searchImg}
          alt="search Image"
          onClick={() => {
            if (inputRef && inputRef.current && inputRef.current.value.trim()) {
              setLoading(true);
              setShowSearch(true);
              bookSearcher(inputRef.current.value);
              setSearchValue(inputRef.current.value);
              saveKeyword(inputRef.current.value);
              inputRef.current.value = "";
            }
          }}
        />
      </SearchBox>
      <HistoryBox>
        {histories.length > 0 && <HistoryTitle>搜尋紀錄</HistoryTitle>}
        {showSearch && (
          <History
            onClick={() => {
              setShowSearch(false);
              setSearchBooks([]);
            }}
          >
            返回全書籍
          </History>
        )}
        {histories &&
          histories.map((history) => (
            <History
              key={history}
              onClick={() => {
                setLoading(true);
                setShowSearch(true);
                bookSearcher(history);
                setSearchValue(history);
              }}
            >
              {history}
            </History>
          ))}
      </HistoryBox>

      {showSearch ? (
        <SearchBooks>
          <SearchTitle>查詢關鍵字: {searchValue}</SearchTitle>
          {loading ? (
            <SearchTitle>搜尋中...</SearchTitle>
          ) : (
            <SearchTitle>查詢結果共 {searchBooks.length} 筆資料</SearchTitle>
          )}
          <Books>
            {loading &&
              Array.from({ length: 8 }).map((_, index) => (
                <BookData key={index}>
                  <Book>
                    <Skeleton
                      style={{
                        width: "128px",
                        height: "193px",
                      }}
                    />
                    <BookDetail>
                      <BookTitle>
                        <Skeleton />
                      </BookTitle>
                      <BookAuthor>
                        <Skeleton />
                      </BookAuthor>
                      <BookTextSnippet>
                        <Skeleton count={3} />
                      </BookTextSnippet>
                    </BookDetail>
                  </Book>
                </BookData>
              ))}
            {searchBooks &&
              searchBooks.map((data, index) => {
                return (
                  <BookData key={index}>
                    <BookComponent data={data} />
                  </BookData>
                );
              })}
          </Books>
          {searchBooks && searchBooks.length === 0 && (
            <SearchNoResult ref={noResultRef}>
              <SearchTitle>查無搜尋結果</SearchTitle>
              <SearchTitle>請用其他關鍵字搜尋</SearchTitle>
            </SearchNoResult>
          )}
        </SearchBooks>
      ) : (
        <>
          <Books>
            {bookData.map((book, index) => {
              if (index >= page * 16 && index < page * 16 + 16) {
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
        </>
      )}
    </BooksPage>
  );
}

export const getStaticProps: GetServerSideProps = async () => {
  const result = await getFirstBooks();
  return {
    props: {
      firstBook: result.booksData,
    },
  };
};
