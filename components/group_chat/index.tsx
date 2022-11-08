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
const ChatRoom = styled.div``;
const MemberChat = styled.div``;
const MyChat = styled.div``;
const Member = styled.div`
  display: flex;
  align-items: center;
`;
const MemberName = styled.h3``;
const MemberImg = styled(Image)``;
const MemberContent = styled.p``;
const InputBox = styled.div`
  display: flex;
  align-items: center;
`;
const MessageInput = styled.textarea``;
const SentMessageButton = styled.button`
  cursor: pointer;
  border: solid 1px;
  padding: 5px 10px;
`;

export default function ChatRoomComponent({ id }: { id: string }) {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [chats, setChats] = useState<ChatMessage[]>();
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
  }, []);
  return (
    <ChatRoom>
      {chats ? (
        chats.map((chat) => {
          if (chat.memberData?.uid === userInfo.uid) {
            return (
              <MyChat key={chat.messageId}>
                <Member>
                  <MemberName>{chat.memberData?.name}</MemberName>
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
                </Member>
                <MemberContent>{chat.content}</MemberContent>
              </MyChat>
            );
          } else {
            return (
              <>
                <MemberChat key={chat.messageId}>
                  <Member>
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
                    <MemberName>{chat.memberData?.name}</MemberName>
                  </Member>
                  <MemberContent>{chat.content}</MemberContent>
                </MemberChat>
              </>
            );
          }
        })
      ) : (
        <MemberContent>跟大家分享你的想法吧！</MemberContent>
      )}
      <InputBox>
        <MessageInput ref={inputRef} />
        <SentMessageButton
          onClick={() => {
            if (inputRef && inputRef.current && userInfo) {
              sentMessage(id, userInfo, inputRef.current.value);
            }
          }}
        >
          送出
        </SentMessageButton>
      </InputBox>
    </ChatRoom>
  );
}
