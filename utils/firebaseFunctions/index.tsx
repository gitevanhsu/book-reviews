import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { doc, setDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECTID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGEBUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGINGSENDERID,
  appId: process.env.NEXT_PUBLIC_APPID,
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENTID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
interface BookInfo {
  isbn?: string;
  title?: string;
  subtitle?: string;
  authors?: string[];
  categories?: string[];
  thumbnail?: string;
  smallThumbnail?: string;
  textSnippet?: string;
  description?: string;
  publisher?: string;
  publishedDate?: string;
  infoLink?: string;
}

export const addBooksData = async (bookIsbn: string) => {
  // const bookRes = await fetch(
  //   `https://www.googleapis.com/books/v1/volumes?q=isbn:${bookIsbn}`
  // );
  const bookRes = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${bookIsbn}`
  );

  const { items } = await bookRes.json();

  try {
    const bookInfo: BookInfo = {
      isbn: bookIsbn,
      title: items[0].volumeInfo.title,
      subtitle: items[0].volumeInfo.subtitle || "",
      authors: items[0].volumeInfo.authors,
      categories: items[0].volumeInfo.categories,
      thumbnail: items[0].volumeInfo.imageLinks.thumbnail || "",
      smallThumbnail: items[0].volumeInfo.imageLinks.smallThumbnail || "",
      textSnippet: items[0].searchInfo.textSnippet,
      description: items[0].volumeInfo.description,
      publisher: items[0].volumeInfo.publisher,
      publishedDate: items[0].volumeInfo.publishedDate,
      infoLink: items[0].volumeInfo.infoLink,
    };
    await setDoc(doc(db, "books", bookIsbn), bookInfo);
  } catch (ERR) {
    console.log("ERR");
    console.log(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${bookIsbn}`
    );
  }
};
