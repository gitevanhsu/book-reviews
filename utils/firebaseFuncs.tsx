import { initializeApp } from "firebase/app";
import {
  doc,
  DocumentData,
  QueryDocumentSnapshot,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  limit,
  query,
  startAfter,
  where,
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
  ratingMember?: string[];
  ratingCount?: number;
  raviewCount?: number;
}

interface SubReview {
  reviewId?: string;
  commentUser?: string;
  like?: string[];
  time?: Timestamp;
  content?: string;
}
export interface BookReview {
  reviewId?: string;
  booksIsbn?: string;
  memberId?: string;
  memberData?: { name?: string; img?: string; url?: string };
  rating?: number;
  title?: string;
  content?: string;
  time?: Timestamp;
  liked?: string[];
  disliked?: string[];
  subReviewsNumber?: number;
  subReviews?: SubReview[];
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

export const getBookReviews = async (isbn: string) => {
  const reviewsArr: BookReview[] = [];
  const userIds: string[] = [];
  const reviews = await getDocs(
    query(collection(db, "book_reviews"), where("booksIsbn", "==", isbn))
  );
  reviews.forEach((review) => {
    reviewsArr.push(review.data());
    userIds.push(review.data().memberId);
  });

  const requests = userIds.map(async (userId) => {
    const docData = await getDoc(doc(db, "members", userId));
    return docData.data();
  });
  const allMemberInfo = await Promise.all(requests);

  const newReviewsArr = reviewsArr.map((review) => {
    const userData = allMemberInfo.find(
      (member) => member?.uid === review.memberId
    );
    return { ...review, memberData: userData };
  });

  return newReviewsArr;
};

export const getMemberReviews = async (uid: string, isbn: string) => {
  const reviewQuery = query(
    collection(db, "book_reviews"),
    where("booksIsbn", "==", isbn),
    where("memberId", "==", uid)
  );
  const reviews = await getDocs(reviewQuery);
  let returnReview: DocumentData[] = [];
  reviews.forEach((review) => returnReview.push(review.data()));
  return returnReview[0];
};
export const bookRating = async (
  uid: string,
  isbn: string,
  rating: number,
  review: BookReview
) => {
  const docData = await getDoc(doc(db, "books", isbn));
  const bookData = docData.data();
  if (
    bookData &&
    review &&
    review.rating &&
    bookData.ratingMember.includes(uid)
  ) {
    const oldReviewDoc = await getDoc(
      doc(db, "book_reviews", review.reviewId!)
    );
    const oldReview = oldReviewDoc.data();
    const newReview = { ...review, rating };
    const ratingDiff = rating - oldReview?.rating;
    bookData.ratingCount += ratingDiff;
    await setDoc(doc(db, "books", bookData.isbn), bookData);
    await setDoc(doc(db, "book_reviews", newReview.reviewId!), newReview);
  } else if (bookData) {
    bookData.ratingMember.push(uid);
    bookData.ratingCount += rating;
    await setDoc(doc(db, "books", bookData.isbn), bookData);
    const newBookRef = doc(collection(db, "book_reviews"));
    const reviewData = {
      reviewId: newBookRef.id,
      booksIsbn: isbn,
      memberId: uid,
      rating,
      title: "",
      content: "",
      time: new Date(),
      liked: [],
      disliked: [],
      subReviewsNumber: 0,
    };
    console.log(reviewData);
    await setDoc(doc(db, "book_reviews", newBookRef.id), reviewData);
  }
};
