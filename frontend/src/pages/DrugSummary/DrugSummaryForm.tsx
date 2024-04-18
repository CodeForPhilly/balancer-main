import React from "react";
// import { Link } from "react-router-dom";
import "../../components/Header/chat.css";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
// import TypingAnimation from "./components/TypingAnimation.tsx";
// import chatBubble from "../../assets/chatbubble.svg";
import { extractContentFromDOM } from "../../services/domExtraction.tsx";
import paperclip from "../../assets/paperclip.svg";

interface ChatLogItem {
  type: string;
  message: string;
}

const DrugSummaryForm = () => {
  const [inputValue, setInputValue] = useState("");
  const [chatLog, setChatLog] = useState<ChatLogItem[]>([]); // Specify the type as ChatLogItem[]
  const [isLoading, setIsLoading] = useState(false);
  // const suggestionPrompts = [
  //   "Tell me about treatment options.",
  //   "What are the common side effects?",
  //   "How to manage medication schedule?",
  // ];
  const [pageContent, setPageContent] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file.type === "application/pdf") {
        // setSelectedFile(file);
        setInputValue(file.name);
        // Update chat log to show a message about the uploaded file
        // setChatLog([
        //   ...chatLog,
        //   { type: "user", message: "PDF file uploaded." },
        // ]);
      } else {
        // Handle non-PDF files or errors
      }
    } else {
      // Handle the case where no file is selected
    }
  };

  const systemMessage = {
    role: "system",
    content: "You are a bot please keep conversation going.",
  };

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const content = extractContentFromDOM();
      setPageContent(content);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    const extractedContent = extractContentFromDOM();
    console.log(extractedContent);
    setPageContent(extractedContent);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      const chatContainer = chatContainerRef.current;
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [chatLog]);

  const suggestionPrompts = [
    [
      "Tell me about treatment options.",
      "Additional details or related question.",
    ],
    [
      "What are the common side effects?",
      "Additional details or related question.",
    ],
    [
      "How to manage medication schedule?",
      "Additional details or related question.",
    ],
    ["Another question or topic?", "Additional details or related question."],
  ];

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newMessage = {
      message: inputValue,
      type: "user",
    };

    const newMessages = [...chatLog, newMessage];

    setChatLog(newMessages);

    sendMessage(newMessages);

    setInputValue("");
  };

  const sendMessage = (message: ChatLogItem[]) => {
    let baseUrl = 'http://' + window.location.host + '/api';
    baseUrl = baseUrl.replace(":3000", ":8000");
    const url = `${baseUrl}/chatgpt/chat`;

    const apiMessages = message.map((messageObject) => {
      let role = "";
      if (messageObject.type === "user") {
        role = "user";
      } else {
        role = "assistant";
      }
      return { role: role, content: messageObject.message };
    });

    systemMessage.content += `If applicable, please use the following content to ask questions. If not applicable,
      please answer to the best of your ability: ${pageContent}`;

    const apiRequestBody = {
      prompt: [systemMessage, ...apiMessages],
    };

    setIsLoading(true);

    axios
      .post(url, apiRequestBody)
      .then((response) => {
        console.log(response);
        setChatLog((prevChatLog) => [
          ...prevChatLog,
          {
            type: "bot",
            message: response.data.message.choices[0].message.content,
          },
        ]);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        console.log(error);
      });
  };

  return (
    <>
      <div
        ref={chatContainerRef}
        id="chat_container"
        className=" mx-auto flex h-full flex-col overflow-auto rounded "
        style={{ width: "800px", height: "680px" }}
      >
        <div className="font_body pb-22 mt-36 flex flex-grow flex-col space-y-2 p-5">
          {chatLog.length === 0 ? (
            <>
              <div className="max-h-[100%] max-w-[310px] rounded-lg border-2 bg-gray-200 p-2 text-black">
                You can ask about the content on this page.
              </div>
              <div className="max-h-[100%] max-w-[190px] rounded-lg border-2 bg-gray-200 p-2 text-black">
                Or questions in general.
              </div>
            </>
          ) : (
            chatLog.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`${
                    message.type === "user"
                      ? "bg-blue-200 text-black "
                      : "border-2 bg-gray-200 text-black "
                  }rounded-lg max-h-[100%] max-w-[500px] p-2`}
                >
                  {message.message}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div key={chatLog.length} className="flex justify-between">
              <div className="max-w-sm rounded-lg p-4 text-white">
                {/* <TypingAnimation /> */}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ width: "800px" }}>
        <div className="p-4">
          {/* <div className="grid grid-cols-2 gap-2 p-2"> */}
          <ul className="grid cursor-pointer grid-cols-2 gap-2 rounded-lg p-2 p-3">
            {suggestionPrompts.map((suggestion, index) => (
              <button
                type="button"
                key={index}
                className="rounded-md border p-2 text-left text-sm text-black hover:bg-blue-200"
                onClick={() => setInputValue(suggestion[0])}
              >
                <span className="font-bold text-black">{suggestion[0]}</span>
                <div className="mt-1 font-satoshi text-sm text-gray-400">
                  {suggestion[1]}
                </div>
              </button>
            ))}
          </ul>

          {/* </div> */}
          <form onSubmit={handleSubmit} className="mb-1 flex">
            <div className="relative flex w-full  items-center ">
              <button
                type="button"
                className="absolute left-2 z-10"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.click();
                  }
                }}
              >
                <img src={paperclip} alt="Upload" className="h-6" />
              </button>

              <input
                type="ani_input"
                className="input w-full rounded-md border border-gray-300"
                placeholder="Talk to me..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />

              <input
                type="file"
                id="fileInput"
                ref={fileInputRef}
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <div className="ml-5">
              <button type="submit" className="btnBlue">
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default DrugSummaryForm;
