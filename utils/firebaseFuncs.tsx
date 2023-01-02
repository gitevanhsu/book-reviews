import produce from "immer";
import { initializeApp } from "firebase/app";
import Swal from "sweetalert2";
import {
  deleteDoc,
  doc,
  DocumentData,
  increment,
  orderBy,
  setDoc,
  Timestamp,
  getFirestore,
  collection,
  getDocs,
  getDoc,
  limit,
  query,
  startAfter,
  where,
  updateDoc,
} from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { userSignIn } from "../slices/userInfoSlice";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECTID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGEBUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGINGSENDERID,
  appId: process.env.NEXT_PUBLIC_APPID,
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENTID,
  databaseURL: process.env.NEXT_PUBLIC_DATABASE_URL,
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const firestore = getFirestore(app);
const auth = getAuth();
export const reviewsRef = collection(db, "book_reviews");
export const booksRef = collection(db, "books");
export const friendRequestRef = collection(db, "friends_requests");
export const noticeRef = collection(db, "notices");

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
  reviewCount?: number;
}

export interface SubReview {
  reviewId?: string;
  commentUser?: string;
  like?: string[];
  likeCount?: number;
  time?: Timestamp;
  content?: string;
  memberData?: { uid?: string; name?: string; img?: string; url?: string };
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
  reviewRating?: number;
  subReviewsNumber?: number;
  subReviews?: SubReview[];
}

export interface MemberInfo {
  uid?: string;
  name?: string;
  email?: string;
  isSignIn?: boolean;
  intro?: string;
  img?: string;
  friends?: string[];
  books?: string[];
  reading?: string[];
  finish?: string[];
}

export interface FriendRequest {
  invitor: string;
  receiver: string;
  state: string;
}
export interface ChatMessage {
  uid: string;
  time: Timestamp;
  content: string;
  memberData?: MemberInfo;
  messageId: string;
}
export interface NoticeData {
  noticeid: string;
  reciver: string;
  content: string;
  postUrl: string;
  poster: string;
  time: Date;
  posterInfo?: MemberInfo;
}

export const loadBooks = async (
  page: number,
  pageRef: DocumentData | undefined
) => {
  const booksData: BookInfo[] = [];
  if (page === 0) {
    const first = query(booksRef, limit(16));
    const documentSnapshots = await getDocs(first);
    documentSnapshots.forEach((doc) => {
      booksData.push(doc.data());
    });
    const lastVisible =
      documentSnapshots.docs[documentSnapshots.docs.length - 1];
    return { lastVisible, booksData };
  } else {
    const next = query(booksRef, startAfter(pageRef), limit(16));
    const newDocs = await getDocs(next);
    newDocs.forEach((doc) => {
      booksData.push(doc.data());
    });
    const lastVisible = newDocs.docs[newDocs.docs.length - 1];
    return { lastVisible, booksData };
  }
};

const getBookInfo = async (bookISBN: string): Promise<BookInfo | undefined> => {
  const docSnap = await getDoc(doc(db, "books", bookISBN));
  return docSnap.data();
};

export const emailSignUp = async (
  name: string,
  email: string,
  password: string,
  intro: string,
  img: string
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
      img,
      books: [],
      friends: [],
      reading: [],
      finish: [],
    };
    await setDoc(doc(db, "members", user.uid), userData);
    Swal.fire({
      icon: "success",
      title: "註冊成功！",
      timer: 1000,
      showConfirmButton: false,
    });

    return userData;
  } catch (error) {
    if (error) {
      const errorMessage = (error as Error).message;
      if (errorMessage == "Firebase: Error (auth/email-already-in-use).") {
        Swal.fire({
          title: "已有帳號，請直接登入。",
          icon: "warning",
          timer: 1000,
          showConfirmButton: false,
        });
      } else if (errorMessage === "Firebase: Error (auth/invalid-email).") {
        Swal.fire({
          title: "Email 格式錯誤",
          icon: "warning",
          timer: 1000,
          showConfirmButton: false,
        });
      } else {
      }
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
    Swal.fire({
      icon: "success",
      title: "登入成功！",
      timer: 1000,
      showConfirmButton: false,
    });
  } catch (error) {
    const errorMessage = (error as Error).message;

    if (errorMessage === "Firebase: Error (auth/wrong-password).") {
      Swal.fire({
        title: "帳號或密碼錯誤請重新輸入。",
        icon: "warning",
        timer: 1000,
        showConfirmButton: false,
      });
    } else if (errorMessage === "Firebase: Error (auth/user-not-found).") {
      Swal.fire({
        title: "還不是用戶喔，歡迎註冊。",
        icon: "warning",
        timer: 1000,
        showConfirmButton: false,
      });
    } else if (errorMessage === "Firebase: Error (auth/invalid-email).") {
      Swal.fire({
        title: "請輸入正確 Email 格式",
        icon: "warning",
      });
    }
  }
};

export const signout = () => {
  signOut(auth);
};

export const getMemberData = async (
  uid: string
): Promise<MemberInfo | undefined> => {
  const docData = await getDoc(doc(db, "members", uid));
  return docData.data();
};

const getMemberReviews = async (uid: string, isbn: string) => {
  const reviewQuery = query(
    reviewsRef,
    where("booksIsbn", "==", isbn),
    where("memberId", "==", uid)
  );
  const reviews = await getDocs(reviewQuery);
  return reviews.docs[0]?.data();
};

export const bookRating = async (uid: string, isbn: string, rating: number) => {
  if (rating === 0) {
    Swal.fire({
      title: "請先留下 ★ 評價喔！",
      icon: "warning",
      timer: 1000,
      showConfirmButton: false,
    });
    return;
  }
  const docData = await getDoc(doc(db, "books", isbn));
  const bookData = docData.data() as BookInfo;
  const review = (await getMemberReviews(uid, isbn)) as BookReview;
  if (bookData && review?.rating && bookData.ratingMember!.includes(uid)) {
    const oldReviewDoc = await getDoc(
      doc(db, "book_reviews", review.reviewId!)
    );
    const oldReview = oldReviewDoc.data();
    const newReview = { ...review, rating };
    const ratingDiff = rating - oldReview?.rating;
    bookData.ratingCount! += ratingDiff;
    await setDoc(doc(db, "books", bookData.isbn!), bookData);
    await setDoc(doc(db, "book_reviews", newReview.reviewId!), newReview);
  } else {
    bookData.ratingMember!.push(uid);
    bookData.ratingCount! += rating;
    await setDoc(doc(db, "books", bookData.isbn!), bookData);
    const reviewData = {
      reviewId: `${+new Date()}`,
      booksIsbn: isbn,
      memberId: uid,
      rating,
      title: "",
      content: "",
      reviewRating: 0,
      time: new Date(),
      liked: [],
      disliked: [],
      subReviewsNumber: 0,
    };
    await setDoc(doc(db, "book_reviews", reviewData.reviewId), reviewData);
  }
};

export const removeBookRating = async (uid: string, isbn: string) => {
  const docData = await getDoc(doc(db, "books", isbn));
  const memberReviewData = (await getMemberReviews(uid, isbn)) as BookReview;
  const bookData = docData.data();
  if (
    bookData &&
    memberReviewData.rating &&
    memberReviewData.reviewId &&
    memberReviewData.title &&
    memberReviewData.title.length > 0
  ) {
    bookData.ratingCount -= memberReviewData.rating;
    bookData.reviewCount -= 1;
    const ratingMember = bookData.ratingMember.filter(
      (member: string) => member !== uid
    );
    await setDoc(doc(db, "books", bookData.isbn), {
      ...bookData,
      ratingMember,
    });
    await deleteDoc(doc(db, "book_reviews", memberReviewData.reviewId));
  } else if (bookData && memberReviewData.rating && memberReviewData.reviewId) {
    bookData.ratingCount -= memberReviewData.rating;
    const ratingMember = bookData.ratingMember.filter(
      (member: string) => member !== uid
    );
    await setDoc(doc(db, "books", bookData.isbn), {
      ...bookData,
      ratingMember,
    });
    await deleteDoc(doc(db, "book_reviews", memberReviewData.reviewId));
  }
};

export const addBookReview = async (
  uid: string,
  isbn: string,
  title: string,
  content: string
) => {
  const docData = await getDoc(doc(db, "books", isbn));
  const bookData = docData.data();
  const memberReviewData = (await getMemberReviews(uid, isbn)) as BookReview;
  if (!memberReviewData) {
    Swal.fire({
      title: "請先留下 ★ 評價喔！",
      icon: "warning",
      timer: 1000,
      showConfirmButton: false,
    });
    return;
  }
  if (memberReviewData && bookData) {
    bookData.reviewCount += 1;
    const newReviewData: BookReview = { ...memberReviewData, title, content };
    await setDoc(
      doc(db, "book_reviews", newReviewData.reviewId!),
      newReviewData
    );
    await setDoc(doc(db, "books", bookData.isbn), { ...bookData });
    Swal.fire({
      title: "感謝您的評論！",
      icon: "success",
      timer: 1000,
      showConfirmButton: false,
    });
  }
};

export const editReview = async (
  review: BookReview,
  title: string,
  content: string
) => {
  const newReview = { ...review, title, content };
  delete newReview.memberData;
  await setDoc(doc(db, "book_reviews", newReview.reviewId!), newReview);
};

export const sentSubReview = async (
  review: BookReview,
  input: string,
  uid: string
) => {
  if (input.trim().length === 0) {
    Swal.fire({
      title: "請先留下 ★ 評價喔！",
      icon: "warning",
      timer: 1000,
      showConfirmButton: false,
    });
    return;
  }

  const subReviewData = {
    reviewId: `${+new Date()}`,
    commentUser: uid,
    like: [],
    likeCount: 0,
    time: new Date(),
    content: input,
  };

  await setDoc(
    doc(
      db,
      `book_reviews/${review.reviewId}/subreviews`,
      `${+subReviewData.time}`
    ),
    subReviewData
  );

  review.reviewId &&
    (await updateDoc(doc(db, "book_reviews", review.reviewId), {
      subReviewsNumber: increment(1),
    }));
};

export const likeSubReview = async (
  review: BookReview,
  subReview: SubReview,
  uid: string
) => {
  if (subReview.reviewId) {
    const docData = await getDoc(
      doc(db, `book_reviews/${review.reviewId}/subreviews`, subReview.reviewId)
    );
    const subReviewData = docData.data();
    if (subReviewData && subReviewData.like.includes(uid)) {
      const NewSubReviewData = produce(subReviewData, (draft) => {
        const newLikes = draft.like.filter(
          (dataUid: string) => dataUid !== uid
        );
        return { ...draft, like: newLikes, likeCount: newLikes.length };
      });
      await setDoc(
        doc(
          db,
          `book_reviews/${review.reviewId}/subreviews`,
          subReview.reviewId
        ),
        NewSubReviewData
      );
    } else if (subReviewData) {
      const newSubReviewData: SubReview = produce(subReviewData, (draft) => {
        draft.like.push(uid);
        draft.likeCount = draft.like.length;
      });
      await setDoc(
        doc(
          db,
          `book_reviews/${review.reviewId}/subreviews`,
          subReview.reviewId
        ),
        newSubReviewData
      );
    }
  }
};

export const upperReview = async (uid: string, review: BookReview) => {
  const reviewId = review.reviewId;
  const reviewDoc = await getDoc(doc(db, "book_reviews", reviewId!));
  const reviewData = reviewDoc.data() as BookReview;
  const liked = reviewData.liked?.filter((id) => id !== uid) || [];
  const disliked = reviewData.disliked?.filter((id) => id !== uid) || [];
  liked?.push(uid);
  const reviewRating = liked.length - disliked.length;
  const newReviewData = {
    ...reviewData,
    disliked,
    liked,
    reviewRating,
  };
  newReviewData.reviewId &&
    (await setDoc(
      doc(db, "book_reviews", newReviewData.reviewId),
      newReviewData
    ));
};
export const lowerReview = async (uid: string, review: BookReview) => {
  const reviewId = review.reviewId;
  const reviewDoc = await getDoc(doc(db, "book_reviews", reviewId!));
  const reviewData = reviewDoc.data() as BookReview;

  const liked = reviewData.liked?.filter((id) => id !== uid) || [];
  const disliked = reviewData.disliked?.filter((id) => id !== uid) || [];
  disliked?.push(uid);
  const reviewRating = liked.length - disliked.length;
  const newReviewData = {
    ...reviewData,
    disliked,
    liked,
    reviewRating,
  };
  newReviewData.reviewId &&
    (await setDoc(
      doc(db, "book_reviews", newReviewData.reviewId),
      newReviewData
    ));
};

export const sentFriendRequest = async (
  invitorUid: string,
  receiverUid: string
) => {
  const q = query(
    friendRequestRef,
    where("invitor", "==", invitorUid),
    where("receiver", "==", receiverUid)
  );
  const querySnapshot = await getDocs(q);
  const requestDataArr: FriendRequest[] = querySnapshot.docs.map(
    (requestDoc) => requestDoc.data() as FriendRequest
  );

  if (requestDataArr[0] && requestDataArr[0].state === "pending") {
    Swal.fire({
      title: "請等待對方回應喔",
      icon: "warning",
      timer: 1000,
      showConfirmButton: false,
    });
  } else if (
    querySnapshot.empty ||
    (requestDataArr[0] && requestDataArr[0].state === "reject")
  ) {
    const request = {
      invitor: invitorUid,
      receiver: receiverUid,
      state: "pending",
    };
    await setDoc(
      doc(db, "friends_requests", invitorUid + receiverUid),
      request
    );
    Swal.fire({
      title: "成功送出邀請",
      icon: "success",
      timer: 1000,
      showConfirmButton: false,
    });
  }
};

export const acceptFriendRequest = async (
  receiverUid: string,
  invitorUid: string
) => {
  const requestDocRef = await getDoc(
    doc(db, "friends_requests", invitorUid + receiverUid)
  );
  const receiverMemberDocRef = await getDoc(doc(db, "members", receiverUid));
  const invitorMemberDocRef = await getDoc(doc(db, "members", invitorUid));
  const receiverData = receiverMemberDocRef.data() as MemberInfo;
  const invitorData = invitorMemberDocRef.data() as MemberInfo;
  const newReceiverFriends = [...receiverData.friends!, invitorUid];
  const newInviterFriends = [...invitorData.friends!, receiverUid];
  const newReceiverData = { ...receiverData, friends: newReceiverFriends };
  const newInviterData = { ...invitorData, friends: newInviterFriends };
  const newRequests = { ...requestDocRef.data(), state: "accept" };
  await setDoc(doc(db, "members", invitorUid), newInviterData);
  await setDoc(doc(db, "members", receiverUid), newReceiverData);
  await setDoc(
    doc(db, "friends_requests", invitorUid + receiverUid),
    newRequests
  );
};
export const rejectFriendRequest = async (
  receiverUid: string,
  invitorUid: string
) => {
  const requestDocRef = await getDoc(
    doc(db, "friends_requests", invitorUid + receiverUid)
  );
  const newRequests = { ...requestDocRef.data(), state: "reject" };
  await setDoc(
    doc(db, "friends_requests", invitorUid + receiverUid),
    newRequests
  );
};

export const sentMessage = async (
  isbn: string,
  userInfo: MemberInfo,
  content: string
) => {
  const messageData = {
    messageId: `${+new Date()}`,
    uid: userInfo.uid,
    content,
    time: new Date(),
  };
  await setDoc(
    doc(db, "books", `${isbn}/chat_room/${messageData.messageId}`),
    messageData
  );
};

export const getBooks = async () => {
  const books = query(booksRef, orderBy("ratingCount", "desc"), limit(30));
  const booksSnapshots = await getDocs(books);
  return booksSnapshots.docs.map((doc) => doc.data());
};

export const addBookToShelf = async (isbn: string, uid: string) => {
  const docData = await getDoc(doc(db, "members", uid));
  const memberData = docData.data();
  const newMemberData = produce(memberData, (draft: MemberInfo) => {
    draft.books!.push(isbn);
  });
  await setDoc(doc(db, "members", uid), newMemberData);
};

export const getBookData = async (isbns: string[]) => {
  const bookData = isbns.map(async (isbn) => {
    const res = await getBookInfo(isbn);
    return res;
  });
  return (await Promise.all(bookData)) as BookInfo[];
};

export const removeBook = async (isbn: string, uid: string, shelf: string) => {
  const userData = await getMemberData(uid);
  if (userData && shelf === "books") {
    const newUserData = produce(userData, (data) => {
      data[shelf] = data[shelf]!.filter((bookIsbn) => bookIsbn !== isbn);
    });
    await setDoc(doc(db, "members", uid), newUserData);
  } else if (userData && shelf === "reading") {
    const newUserData = produce(userData, (data) => {
      data[shelf] = data[shelf]!.filter((bookIsbn) => bookIsbn !== isbn);
    });
    await setDoc(doc(db, "members", uid), newUserData);
  } else if (userData && shelf === "finish") {
    const newUserData = produce(userData, (data) => {
      data[shelf] = data[shelf]!.filter((bookIsbn) => bookIsbn !== isbn);
    });
    await setDoc(doc(db, "members", uid), newUserData);
  }
};

export const updateBooks = async (
  {
    newBooks,
    newReading,
    newFinish,
  }: { newBooks: BookInfo[]; newReading: BookInfo[]; newFinish: BookInfo[] },
  uid: string
) => {
  const booksIsbns = newBooks.map((book) => book.isbn);
  const readingIsbns = newReading.map((book) => book.isbn);
  const finishIsbns = newFinish.map((book) => book.isbn);
  const memberData = (await getMemberData(uid)) as MemberInfo;

  await setDoc(doc(db, "members", uid), {
    ...memberData,
    books: booksIsbns,
    reading: readingIsbns,
    finish: finishIsbns,
  });
};

export const sentNotice = async (
  review: BookReview,
  input: string,
  uid: string
) => {
  const url = `/book/id:${review.booksIsbn}`;
  const receiver = review.memberId;
  if (receiver === uid) return;
  const noticeData = {
    noticeid: `${+new Date()}`,
    reciver: receiver,
    content: input,
    postUrl: url,
    poster: uid,
    time: new Date(),
  };
  await setDoc(doc(db, "notices", noticeData.noticeid), noticeData);
};

export const removeNotice = async (notice: NoticeData) => {
  await deleteDoc(doc(db, "notices", notice.noticeid));
};

export const editMemberInfo = async (
  userinfo: MemberInfo,
  newName: string,
  newIntro: string,
  avatar: string,
  dispatch: Function
) => {
  const newUserInfo: MemberInfo = produce(userinfo, (draft) => {
    draft.name = newName;
    draft.intro = newIntro;
    draft.img = avatar;
  });
  newUserInfo.uid &&
    (await setDoc(doc(db, "members", newUserInfo.uid), newUserInfo));
  dispatch(userSignIn(newUserInfo));
};

export const friendStateChecker = async (memberUid: string, myUid: string) => {
  const result1 = await getDoc(doc(db, "friends_requests", memberUid + myUid));
  const result2 = await getDoc(doc(db, "friends_requests", myUid + memberUid));
  if (result1.data()) {
    return "replay" + (result1.data() as FriendRequest).state;
  } else if (result2.data()) {
    return "wait" + (result2.data() as FriendRequest).state;
  }
};

export const getFirstBook = async (bookIsbn: string) => {
  const result = await getDoc(doc(db, "books", bookIsbn));
  return result.data();
};

export const getFirstChat = async (bookIsbn: string) => {
  const querySnapshot = await getDocs(
    collection(db, `books/${bookIsbn}/chat_room`)
  );
  const chatData = querySnapshot.docs.map((doc) => doc.data());
  return chatData;
};

export const getFirstReview = async (bookIsbn: string) => {
  const reviewQuery = query(
    reviewsRef,
    where("reviewRating", ">", -999999),
    orderBy("reviewRating", "desc")
  );
  const querySnapshot = await getDocs(reviewQuery);
  const firstReview = querySnapshot.docs
    .map((doc) => doc.data())
    .filter((review) => review.booksIsbn === bookIsbn);
  return firstReview;
};

export const getFirstBooks = async () => {
  const documentSnapshots = await getDocs(query(booksRef, limit(16)));
  const booksData = documentSnapshots.docs.map((doc) => doc.data());
  return { booksData };
};
export const getBookRef = async (lastIsbn: string) => {
  return await getDoc(doc(db, "books", lastIsbn));
};
