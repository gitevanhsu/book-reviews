import { initializeApp } from "firebase/app";
import {
  doc,
  DocumentData,
  QueryDocumentSnapshot,
  setDoc,
} from "firebase/firestore";
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
  signOut,
} from "firebase/auth";
import { UserState } from "../slices/userInfoSlice";

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

export const loadBooks = async (
  page: number,
  pageRef: QueryDocumentSnapshot<DocumentData> | undefined
) => {
  const booksData: BookInfo[] = [];
  if (page === 0) {
    const first = query(collection(db, "books"), limit(10));
    const documentSnapshots = await getDocs(first);
    documentSnapshots.forEach((doc) => {
      booksData.push(doc.data());
    });
    const lastVisible =
      documentSnapshots.docs[documentSnapshots.docs.length - 1];

    return { lastVisible, booksData };
  } else {
    const next = query(collection(db, "books"), startAfter(pageRef), limit(10));
    const newDocs = await getDocs(next);
    newDocs.forEach((doc) => {
      booksData.push(doc.data());
    });
    const lastVisible = newDocs.docs[newDocs.docs.length - 1];
    return { lastVisible, booksData };
  }
};

export const getBookInfo = async (
  bookISBN: string
): Promise<BookInfo | undefined> => {
  const docSnap = await getDoc(doc(db, "books", bookISBN));
  return docSnap.data();
};

export const emailSignUp = async (
  name: string,
  email: string,
  password: string,
  intro: string
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
      intro,
    };
    await setDoc(doc(db, "members", user.uid), userData);
    return userData;
  } catch (error) {
    if (error) {
      const errorMessage = (error as Error).message;
      errorMessage == "Firebase: Error (auth/email-already-in-use)." &&
        alert("已有帳號，請直接登入。");
      console.log(errorMessage);
    }
  }
};
export const emailSignIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.log(errorMessage);
    if (errorMessage === "Firebase: Error (auth/wrong-password).") {
      alert("密碼錯誤請重新輸入。");
    }
    if (errorMessage === "Firebase: Error (auth/user-not-found).") {
      alert("尚未有帳號，歡迎註冊喔！");
    }
  }
};

export const signout = () => {
  signOut(auth)
    .then(() => {
      console.log("Sign-out successful.");
    })
    .catch((error) => {});
};

export const getMemberData = async (
  uid: string
): Promise<UserState | undefined> => {
  const docRef = doc(db, "members", uid);
  const docData = await getDoc(docRef);
  return docData.data();
};