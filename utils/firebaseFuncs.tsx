import { initializeApp } from "firebase/app";
import produce from "immer";
import {
  deleteDoc,
  doc,
  DocumentData,
  increment,
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
export const memersRef = collection(db, "members");
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
        title: items[0].volumeInfo.title || "",
        subtitle: items[0].volumeInfo.subtitle || "",
        authors: items[0].volumeInfo.authors || "",
        categories: items[0].volumeInfo.categories || "",
        thumbnail: items[0].volumeInfo.imageLinks.thumbnail || "",
        smallThumbnail: items[0].volumeInfo.imageLinks.smallThumbnail || "",
        textSnippet: items[0].searchInfo.textSnippet || "",
        description: items[0].volumeInfo.description || "",
        publisher: items[0].volumeInfo.publisher || "",
        publishedDate: items[0].volumeInfo.publishedDate || "",
        infoLink: items[0].volumeInfo.infoLink || "",
        ratingMember: [],
        ratingCount: 0,
        reviewCount: 0,
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
// addBooksData("9789860659795");
export const loadBooks = async (
  page: number,
  pageRef: QueryDocumentSnapshot<DocumentData> | undefined
) => {
  const booksData: BookInfo[] = [];
  if (page === 0) {
    const first = query(booksRef, limit(8));
    const documentSnapshots = await getDocs(first);
    documentSnapshots.forEach((doc) => {
      booksData.push(doc.data());
    });
    const lastVisible =
      documentSnapshots.docs[documentSnapshots.docs.length - 1];

    return { lastVisible, booksData };
  } else {
    const next = query(booksRef, startAfter(pageRef), limit(8));
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
): Promise<MemberInfo | undefined> => {
  const docData = await getDoc(doc(db, "members", uid));
  return docData.data();
};

export const getBookReviews = async (isbn: string) => {
  const reviewsArr: BookReview[] = [];
  const userIds: string[] = [];
  const reviews = await getDocs(
    query(reviewsRef, where("booksIsbn", "==", isbn))
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
    reviewsRef,
    where("booksIsbn", "==", isbn),
    where("memberId", "==", uid)
  );
  const reviews = await getDocs(reviewQuery);
  let returnReview: DocumentData[] = [];
  reviews.forEach((review) => returnReview.push(review.data()));
  return returnReview[0];
};

export const bookRating = async (uid: string, isbn: string, rating: number) => {
  if (rating === 0) {
    alert("您尚未評價喔！");
    return;
  }
  const docData = await getDoc(doc(db, "books", isbn));
  const bookData = docData.data();
  const review = (await getMemberReviews(uid, isbn)) as BookReview;
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
export const removeBookRating = async (
  uid: string,
  isbn: string,
  rating: number,
  review: BookReview
) => {
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
    alert("請先留下評價喔！");
    return;
  }
  if (!title || !content) {
    alert("請補充內容");
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
  } else {
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

export const showSubReview = async (review: BookReview) => {
  const reviewId = review.reviewId;
  const subreviewsArr: SubReview[] = [];
  const userIds: string[] = [];
  const subreviewDocs = await getDocs(
    query(collection(db, `book_reviews/${reviewId}/subreviews`))
  );
  subreviewDocs.forEach((doc) => {
    subreviewsArr.push(doc.data());
    userIds.push(doc.data().commentUser);
  });
  const requests = userIds.map(async (userId) => {
    const docData = await getDoc(doc(db, "members", userId));
    return docData.data();
  });
  const allMemberInfo = (await Promise.all(requests)) as {
    uid?: string;
    name?: string;
    img?: string;
    url?: string;
  }[];
  const newSubreviews = subreviewsArr.map((subreview) => {
    const userData = allMemberInfo.find(
      (member) => member.uid === subreview.commentUser
    );
    return { ...subreview, memberData: userData };
  });
  return newSubreviews;
};

export const sentSubReview = async (
  review: BookReview,
  input: string,
  uid: string
) => {
  if (input.trim().length === 0) {
    alert("請輸入內容");
    return;
  }
  const newSubReviewRef = doc(
    collection(db, `book_reviews/${review.reviewId}/subreviews`)
  );

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
  subreview: SubReview,
  uid: string
) => {
  if (subreview.reviewId) {
    const docData = await getDoc(
      doc(db, `book_reviews/${review.reviewId}/subreviews`, subreview.reviewId)
    );
    const subreviewData = docData.data();

    if (subreviewData && subreviewData.like.includes(uid)) {
      const NewSubreviewData = produce(subreviewData, (draft) => {
        const newLikes = draft.like.filter(
          (dataUid: string) => dataUid !== uid
        );
        return { ...draft, like: newLikes, likeCount: newLikes.length };
      });
      await setDoc(
        doc(
          db,
          `book_reviews/${review.reviewId}/subreviews`,
          subreview.reviewId
        ),
        NewSubreviewData
      );
    } else if (subreviewData) {
      const newSubreviewData: SubReview = produce(subreviewData, (draft) => {
        draft.like.push(uid);
        draft.likeCount = draft.like.length;
      });
      await setDoc(
        doc(
          db,
          `book_reviews/${review.reviewId}/subreviews`,
          subreview.reviewId
        ),
        newSubreviewData
      );
    }
  }
};

export const upperReview = async (uid: string, review: BookReview) => {
  console.log("UPPER!");
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
  console.log("LOWER!");
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
  let requestDataArr: FriendRequest[] = [];
  querySnapshot.forEach((request) =>
    requestDataArr.push(request.data() as FriendRequest)
  );

  if (requestDataArr[0] && requestDataArr[0].state === "pending") {
    alert("請等待對方接受。");
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
    alert("成功送出邀請。");
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
  const reciverData = receiverMemberDocRef.data() as MemberInfo;
  const invitorData = invitorMemberDocRef.data() as MemberInfo;
  const newReciverFriends = [...reciverData.friends!, invitorUid];
  const newInvitorFriends = [...invitorData.friends!, receiverUid];
  const newReceiverData = { ...reciverData, friends: newReciverFriends };
  const newInvitorData = { ...invitorData, friends: newInvitorFriends };
  const newRequests = { ...requestDocRef.data(), state: "accept" };
  await setDoc(doc(db, "members", invitorUid), newInvitorData);
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
  const books = query(booksRef, limit(30));
  const booksSnapshots = await getDocs(books);
  return booksSnapshots.docs.map((doc) => doc.data());
};

export const addToshelf = async (isbn: string, uid: string) => {
  const docData = await getDoc(doc(db, "members", uid));
  const memberData = docData.data();
  const newMemberData = produce(memberData, (draft: MemberInfo) => {
    draft.books!.push(isbn);
  });
  await setDoc(doc(db, "members", uid), newMemberData);
};

export const getBookDatas = async (isbns: string[]) => {
  const bookDatas = isbns.map(async (isbn) => {
    const res = await getBookInfo(isbn);
    return res;
  });
  const datas = await Promise.all(bookDatas);
  return datas;
};

export const removeBook = async (isbn: string, uid: string, shelf: string) => {
  const userData = await getMemberData(uid);
  if (userData && shelf === "books") {
    const newUserData = produce(userData, (data) => {
      data[shelf] = data[shelf]!.filter((booksibn) => booksibn !== isbn);
    });
    await setDoc(doc(db, "members", uid), newUserData);
  } else if (userData && shelf === "reading") {
    const newUserData = produce(userData, (data) => {
      data[shelf] = data[shelf]!.filter((booksibn) => booksibn !== isbn);
    });
    await setDoc(doc(db, "members", uid), newUserData);
  } else if (userData && shelf === "finish") {
    const newUserData = produce(userData, (data) => {
      data[shelf] = data[shelf]!.filter((booksibn) => booksibn !== isbn);
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
  const url = `http://localhost:3000/book/id:${review.booksIsbn}`;
  const reciver = review.memberId;
  if (reciver === uid) return;
  const noticeData = {
    noticeid: `${+new Date()}`,
    reciver: reciver,
    content: input,
    postUrl: url,
    poster: uid,
    time: new Date(),
  };
  await setDoc(doc(db, "notices", noticeData.noticeid), noticeData);
};

export const removeNotice = async (notice: NoticeData) => {
  const docData = await getDoc(doc(db, "notices", notice.noticeid));
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

export const friendStateChecker = async (memberuid: string, myuid: string) => {
  const result1 = await getDoc(doc(db, "friends_requests", memberuid + myuid));
  const result2 = await getDoc(doc(db, "friends_requests", myuid + memberuid));
  if (result1.data()) {
    return "replay" + (result1.data() as FriendRequest).state;
  } else if (result2.data()) {
    return "wait" + (result2.data() as FriendRequest).state;
  }
};
