import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styled from "styled-components";
import {
  db,
  MemberInfo,
  getMemberData,
  sentMessage,
  ChatMessage,
} from "../../utils/firebaseFuncs";
import { RootState } from "../../store";

import male from "/public/img/reading-male.png";
import { useSelector } from "react-redux";
import { onSnapshot, query, collection } from "firebase/firestore";
import Link from "next/link";
import Swal from "sweetalert2";
import { useRouter } from "next/router";

const ChatRoom = styled.div`
  position: relative;
  width: 600px;
  margin-top: 20px;
  background-color: ${(props) => props.theme.lightWhite};
  border: 1px solid ${(props) => props.theme.greyBlue};
  overflow: hidden;
  border-radius: 10px;
  max-height: 500px;
  box-shadow: 0px 0px 3px ${(props) => props.theme.black};
  @media screen and (max-width: 768px) {
    width: 100%;
  }
`;
const ChatContent = styled.div`
  position: relative;
  padding: 10px 10px 40px;
  max-height: 350px;
  min-height: 350px;
  overflow: auto;
  ::-webkit-scrollbar {
    display: none;
  }
`;
const Member = styled.div`
  display: flex;
  align-items: center;
`;

const MemberName = styled.h3`
  font-size: ${(props) => props.theme.fz4};
  letter-spacing: 1px;
  font-weight: 600;
`;
const MemberImg = styled(Image)`
  margin-right: 5px;
`;
const MemberContent = styled.p`
  display: inline-block;
  font-size: ${(props) => props.theme.fz4};
  padding-left: 30px;
  min-width: 100px;
  white-space: pre-wrap;
  letter-spacing: 2px;
  margin: 5px 0;
  line-height: ${(props) => props.theme.fz4};
`;
const InputBox = styled.div`
  position: absolute;
  bottom: 0;
  margin-top: 10px;
  width: 100%;
`;
const MessageInput = styled.input`
  width: 100%;
  border-radius: 5px;
  padding: 5px 10px;
  border: none;
  outline: none;
  border-top: 1px solid ${(props) => props.theme.grey};
  font-size: ${(props) => props.theme.fz4};
`;
const ChatDate = styled.p`
  padding-left: 30px;
  margin-top: 10px;
`;
const MemberChat = styled.div`
  display: flex;
  max-width: 300px;
  flex-direction: column;
  padding: 10px 0;
`;

const MyChat = styled(MemberChat)`
  align-items: end;
  margin-left: auto;
`;

const ChatRoomTitle = styled.h3`
  top: 0;
  letter-spacing: 3px;
  padding: 10px 0;
  box-shadow: 5px 0px 5px ${(props) => props.theme.black};
  position: sticky;
  text-align: center;
  font-size: ${(props) => props.theme.fz3};
  background-color: ${(props) => props.theme.yellow}; ;
`;

const Nomessage = styled(MemberContent)`
  width: 100%;
  text-align: center;
`;

export default function ChatRoomComponent({
  id,
  chatdata,
}: {
  id: string;
  chatdata: ChatMessage[];
}) {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [chats, setChats] = useState<ChatMessage[]>(chatdata);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatBox = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    let unsub: Function;
    if (id) {
      unsub = onSnapshot(
        query(collection(db, `books/${id}/chat_room`)),
        async (querySnapshot) => {
          const ids: string[] = [];
          const allChat = querySnapshot.docs.map((doc) => {
            ids.push(doc.data().uid);
            return doc.data();
          });
          const requests = ids.map(async (id) => {
            const docData = await getMemberData(id);
            return docData;
          });
          const allMemberInfo = (await Promise.all(requests)) as MemberInfo[];

          const newAllChat = allChat.map((chat) => {
            const memberData = allMemberInfo.find(
              (member) => member.uid === chat.uid
            );
            return { ...chat, memberData } as ChatMessage;
          });
          setChats(newAllChat);
        }
      );
    }
    return () => {
      if (unsub) {
        unsub();
      }
    };
  }, [id]);

  useEffect(() => {
    if (chatBox.current) chatBox.current.scrollTo(999999, 999999);
  });

  return (
    <ChatRoom>
      <ChatRoomTitle>聊天室</ChatRoomTitle>
      <ChatContent ref={chatBox}>
        {chats.length > 0 ? (
          chats.map((chat) => {
            const chatDate = new Date(
              chat.time ? chat.time?.seconds * 1000 : ""
            );
            const year = chatDate.getFullYear();
            const month = chatDate.getMonth() + 1;
            const date = chatDate.getDate();
            if (chat.memberData?.uid === userInfo.uid) {
              return (
                <MyChat key={chat.messageId}>
                  <MemberContent>{chat.content}</MemberContent>
                  <ChatDate>{`${year}-${month}-${date}`}</ChatDate>
                </MyChat>
              );
            } else {
              return (
                <MemberChat key={chat.messageId}>
                  <Member>
                    <Link href={`/member/id:${chat.memberData?.uid}`}>
                      <MemberImg
                        src={
                          chat.memberData && chat.memberData.img
                            ? chat.memberData.img
                            : male
                        }
                        alt={
                          chat.memberData && chat.memberData.name
                            ? chat.memberData.name
                            : "user Img"
                        }
                        width={25}
                        height={25}
                      />
                    </Link>
                    <MemberName>{chat.memberData?.name}</MemberName>
                  </Member>
                  <MemberContent>{chat.content}</MemberContent>
                  <ChatDate>{`${year}-${month}-${date}`}</ChatDate>
                </MemberChat>
              );
            }
          })
        ) : (
          <Nomessage>趕快跟大家分享你的想法吧！</Nomessage>
        )}
      </ChatContent>
      <InputBox>
        <MessageInput
          ref={inputRef}
          placeholder="留下評論......"
          onKeyPress={(e) => {
            if (!userInfo.isSignIn) {
              Swal.fire({
                icon: "info",
                title: "請先登入喔！",
                confirmButtonText: "前往登入",
              }).then((result) => {
                result.isConfirmed && router.push("/profile");
              });
            } else if (
              e.code === "Enter" &&
              inputRef &&
              inputRef.current &&
              inputRef.current.value.trim() &&
              userInfo
            ) {
              sentMessage(id, userInfo, inputRef.current.value);
              inputRef.current.value = "";
            }
          }}
        />
      </InputBox>
    </ChatRoom>
  );
}
