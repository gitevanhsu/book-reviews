import { initializeApp } from "firebase/app";
import { doc, setDoc } from "firebase/firestore";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  limit,
  query,
  startAfter,
} from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

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
const auth = getAuth();
export interface BookInfo {
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
  if (bookIsbn.length !== 13) {
    console.log("wrong ISBN");
    return;
  } else {
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
      console.log("sucess!");
    } catch (ERR) {
      console.log("ERR");
      console.log(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${bookIsbn}`
      );
    }
  }
};

export const loadBooks = async (setBookDatas: Function, page: number) => {
  const booksData: BookInfo[] = [];
  if (page <= 1) {
    const first = query(collection(db, "books"), limit(10));
    const documentSnapshots = await getDocs(first);
    documentSnapshots.forEach((doc) => {
      booksData.push(doc.data());
    });
    setBookDatas(booksData);
  } else {
    const first = query(collection(db, "books"), limit(10 * page));
    const documentSnapshots = await getDocs(first);
    const lastVisible =
      documentSnapshots.docs[documentSnapshots.docs.length - 1];
    const next = query(
      collection(db, "books"),
      startAfter(lastVisible),
      limit(10)
    );
    const newDoc = await getDocs(next);
    newDoc.forEach((doc) => {
      booksData.push(doc.data());
    });
    setBookDatas(booksData);
  }
};

export const getBookInfo = async (bookISBN: string, setBookData: Function) => {
  if (bookISBN) {
    const docSnap = await getDoc(doc(db, "books", bookISBN));
    setBookData(docSnap.data());
  }
};

export const emailSignUp = async (
  name: string,
  email: string,
  password: string
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    const userData = {
      uid: user.uid,
      name,
      email,
      password,
    };
    await setDoc(doc(db, "users", user.uid), userData);
  } catch (error) {
    if (error) {
      const errorMessage = (error as Error).message;
      if (errorMessage == "Firebase: Error (auth/email-already-in-use).") {
        alert("以有帳號，請直接登入。");
      }
    }
  }
};
export const emailSignIn = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  try {
    const user = userCredential.user;
    console.log(user);
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.log(errorMessage);
  }
};
