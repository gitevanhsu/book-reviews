import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";
import { doc, DocumentData, getDoc, setDoc } from "firebase/firestore";
import {
  loadBooks,
  BookInfo,
  getFirstBooks,
  getBookRef,
  db,
} from "../../utils/firebaseFuncs";
import bookcover from "/public/img/bookcover.jpeg";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import produce from "immer";
import Swal from "sweetalert2";
import searchImg from "public/img/search.png";
import remove from "/public/img/hp-books.png";

const BooksPage = styled.div`
  padding: 50px 30px;
  background-color: ${(props) => props.theme.white};
  min-height: calc(100vh - 60px);
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
  margin-bottom: 15px;
  font-size: ${(props) => props.theme.fz * 1.5}px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const BookAuthor = styled.h4`
  margin-bottom: 5px;
  font-weight: 600;
  font-size: ${(props) => props.theme.fz * 1.2}px;
`;
const BookTextSnippet = styled.p`
  display: inline-block;
  padding: 0 40px;
  font-size: ${(props) => props.theme.fz}px;
  line-height: ${(props) => props.theme.fz * 1.2}px;
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
  margin: 40px auto 0;
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
const HistoryTitle = styled.p`
  display: inline-block;
  font-size: ${(props) => props.theme.fz * 1.2}px;
  padding-left: 10px;
`;
const HistoryBox = styled.div`
  display: flex;
  flex-wrap: wrap;
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
  margin: 5px;
  &:hover {
    background-color: ${(props) => props.theme.greyBlue};
  }
`;

const HistoryRemove = styled(Image)`
  width: 20px;
  height: 20px;
  padding: 2px;
  border-radius: 5px;
  margin-left: 10px;
`;
const SearchBooks = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 20px auto;
  display: flex;
  flex-wrap: wrap;
`;

const SearchTitle = styled.h1`
  text-align: center;
  width: 100%;
  margin: 25px auto 5px;
  font-size: ${(props) => props.theme.fz * 1.5}px;
  color: ${(props) => props.theme.black};
  & + & {
    margin: 5px auto 25px;
  }
`;

const SearchBook = styled.div`
  text-align: center;
  position: relative;
  width: 50%;
  padding: 20px 20px;
  border-bottom: 1px solid ${(props) => props.theme.black};
  @media screen and (max-width: 576px) {
    width: 100%;
  }
`;

const Move = styled.div`
  cursor: pointer;
  display: inline-block;
  min-width: 128px;
  min-height: 193px;
  position: relative;
`;

const SearchBookImg = styled(Image)`
  box-shadow: 0px 0px 15px ${(props) => props.theme.black};
`;
const SearchNoimgTitle = styled.h2`
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
const SearchBookInfos = styled.div`
  padding: 10px 0;
  max-width: 200px;
  margin: 30px auto;
`;
const SearchBookTitle = styled.h2`
  font-size: ${(props) => props.theme.fz * 1.5}px;
  line-height: ${(props) => props.theme.fz * 1.5}px;
  height: ${(props) => props.theme.fz * 3}px;
  display: -webkit-box;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  white-space: wrap;
  margin-bottom: 10px;
`;
const SearchBookAuthor = styled.h3`
  font-size: ${(props) => props.theme.fz * 1.2}px;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const SearchBookIsbn = styled.p`
  font-size: ${(props) => props.theme.fz}px;
`;

const BackBtn = styled.button`
  cursor: pointer;
  padding: 5px 10px;
  margin-top: 10px;
  border-radius: 10px;
  background-color: ${(props) => props.theme.yellow};
  &:hover {
    background-color: ${(props) => props.theme.greyBlue};
  }
`;
const SearchNoResult = styled.div`
  width: 100%;
  margin-top: 20px;
  text-align: center;
`;

export default function BooksComponent({
  firstBook,
}: {
  firstBook: BookInfo[];
}) {
  const [bookDatas, setBookDatas] = useState<BookInfo[]>(firstBook);
  const [page, setPage] = useState<number>(0);
  const pageRef = useRef<DocumentData>();

  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [searchBooks, setSearchBooks] = useState<BookInfo[]>();
  const booksRef = useRef<HTMLDivElement>(null);
  const [serchValue, setSerchValue] = useState<string>("");
  const noResultRef = useRef<HTMLDivElement>(null);
  const [histories, sethistories] = useState<string[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const lastIsbn = firstBook[firstBook.length - 1]?.isbn;
    const bookRef = async (lastIsbn: string) => {
      const result = await getBookRef(lastIsbn);
      pageRef.current = result;
    };
    lastIsbn && bookRef(lastIsbn);
  }, [firstBook]);

  useEffect(() => {
    if (page + 1 > bookDatas.length / 16) {
      loadBooks(page, pageRef.current).then(({ booksData, lastVisible }) => {
        setBookDatas([...bookDatas, ...booksData]);
        pageRef.current = lastVisible;
      });
    }
  }, [bookDatas, page]);

  useEffect(() => {
    const localData = localStorage.getItem("keyWord");
    if (localData) {
      const keywords = (JSON.parse(localData) as string[]) || [];
      sethistories(keywords);
    }
  }, []);

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
    setSearchBooks(books);
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
              bookSearcher(inputRef.current.value);
              setSerchValue(inputRef.current.value);
              saveKeyword(inputRef.current.value);
              inputRef.current.value = "";
              Swal.fire({
                title: "搜尋中...",
                timer: 1200,
                showConfirmButton: false,
              });
              setShowSearch(true);
            }
          }}
        />
        <SearchBtton
          width={20}
          height={20}
          src={searchImg}
          alt="search Image"
          onClick={() => {
            if (inputRef && inputRef.current && inputRef.current.value.trim()) {
              bookSearcher(inputRef.current.value);
              setSerchValue(inputRef.current.value);
              saveKeyword(inputRef.current.value);
              inputRef.current.value = "";
              Swal.fire({
                title: "搜尋中...",
                timer: 1200,
                showConfirmButton: false,
              });
              setShowSearch(true);
            }
          }}
        />
      </SearchBox>
      <HistoryBox>
        {showSearch && (
          <BackBtn
            onClick={() => {
              setShowSearch(false);
              setSearchBooks([]);
            }}
          >
            返回全書籍
          </BackBtn>
        )}
        {histories.length > 0 && <HistoryTitle>搜尋紀錄</HistoryTitle>}
        {histories &&
          histories.map((history) => (
            <History
              key={history}
              onClick={() => {
                bookSearcher(history);
                setSerchValue(history);
                Swal.fire({
                  title: "搜尋中...",
                  timer: 1200,
                  showConfirmButton: false,
                });
                setShowSearch(true);
              }}
            >
              <HistoryTitle>{history}</HistoryTitle>
              <HistoryRemove src={remove} alt="Remove Btn" />
            </History>
          ))}
      </HistoryBox>
      {showSearch ? (
        searchBooks && (
          <SearchBooks ref={booksRef}>
            <SearchTitle>查詢關鍵字: {serchValue}</SearchTitle>
            <SearchTitle>查詢結果共 {searchBooks.length} 筆資料</SearchTitle>
            {searchBooks.map((data) => {
              return (
                <SearchBook key={data.isbn}>
                  <Move
                    onClick={() => {
                      move(data);
                    }}
                  >
                    <SearchBookImg
                      src={
                        data.smallThumbnail ? data.smallThumbnail : bookcover
                      }
                      alt={`${data.title}`}
                      width={180}
                      height={271}
                    />
                    {!data.smallThumbnail && (
                      <SearchNoimgTitle>{data.title}</SearchNoimgTitle>
                    )}
                  </Move>
                  <SearchBookInfos>
                    <SearchBookTitle>{data.title}</SearchBookTitle>
                    {data.authors && data.authors && (
                      <SearchBookAuthor>{data.authors[0]}</SearchBookAuthor>
                    )}
                    <SearchBookIsbn>ISBN：{data.isbn}</SearchBookIsbn>
                  </SearchBookInfos>
                </SearchBook>
              );
            })}
            {searchBooks && searchBooks.length === 0 && (
              <SearchNoResult ref={noResultRef}>
                <SearchTitle>查無搜尋結果</SearchTitle>
                <SearchTitle>請用其他關鍵字搜尋</SearchTitle>
              </SearchNoResult>
            )}
          </SearchBooks>
        )
      ) : (
        <>
          <Books>
            {bookDatas.map((book, index) => {
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
