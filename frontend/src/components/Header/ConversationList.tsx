import React from "react";
import { useState, useEffect } from "react";
import { Conversation } from "./Chat";

interface ConversationListProps {
  conversations: Conversation[];
  onSelectConversation: (conversationId: Conversation["id"]) => void;
  onNewConversation: () => void;
  onSubmitConversationTitle: (
    conversationId: Conversation["id"],
    newTitle: string,
  ) => Promise<
    { status: string; title: Conversation["title"] } | { error: string }
  >;
  onDeleteConversation: (conversationId: Conversation["id"]) => void;
}
const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  onSelectConversation,
  onNewConversation,
  onSubmitConversationTitle,
  onDeleteConversation,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState<
    Conversation["id"] | null
  >(null); // Track which conversation is being edited
  const [newTitle, setNewTitle] = useState("");
  const [localConversations, setLocalConversations] = useState(conversations);

  // Ensure that the local conversations state is updated when the prop changes
  useEffect(() => {
    setLocalConversations(conversations);
  }, [conversations]);

  const handleTitleSubmit = async (
    conversationId: Conversation["id"],
    newTitle: string,
  ) => {
    try {
      const result = await onSubmitConversationTitle(conversationId, newTitle);

      if ("status" in result) {
        // Handle success case
        setLocalConversations(
          localConversations.map((convo) =>
            convo.id === conversationId
              ? { ...convo, title: result.title }
              : convo,
          ),
        );
      } else if ("error" in result) {
        // Handle error case
        console.error("Failed to update conversation title:", result.error);
      }
    } catch (error) {
      console.error("Error updating conversation title: ", error);
    } finally {
      setIsEditingTitle(null);
    }
  };

  const handleDeleteConversation = async (
    conversationId: Conversation["id"],
    conversationTitle: Conversation["title"],
  ) => {
    try {
      if (
        window.confirm(
          `Are you sure you want to delete the "${conversationTitle}" conversation?`,
        )
      ) {
        await onDeleteConversation(conversationId);
        setLocalConversations(
          localConversations.filter((convo) => convo.id !== conversationId),
        );
      }
    } catch (error) {
      console.error(`Error deleting conversation ${conversationId}: `, error);
    }
  };

  return (
    <>
      <button className="btnBlue m-4 text-lg" onClick={onNewConversation}>
        New Conversation
      </button>
      <ul className="conversation-list space-y-4">
        {localConversations.map((conversation) => (
          <li
            key={conversation.id}
            className="conversation-item flex justify-between items-center p-4 bg-white shadow rounded-lg hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              // Conversation can only be selected while not editing the title
              if (isEditingTitle !== conversation.id) {
                onSelectConversation(conversation.id);
              }
            }}
          >
            <span
              onClick={() => setIsEditingTitle(conversation.id)}
              className="block w-full"
            >
              {isEditingTitle === conversation.id ? (
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleTitleSubmit(conversation.id, newTitle);
                    }
                  }}
                  autoFocus
                  className="w-full flex-grow"
                />
              ) : (
                conversation.title
              )}
            </span>

            <div className="flex space-x-2 self-end">
              {/* Edit Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 icon-container hover:bg-blue-500 p-1 rounded cursor-pointer"
                viewBox="0 0 512 512"
                fill="currentColor"
                onClick={(e) => {
                  e.stopPropagation(); // Prevents the click event from bubbling up to the <li> element

                  if (isEditingTitle !== conversation.id) {
                    setNewTitle(conversation.title);
                    setIsEditingTitle(conversation.id);
                  } else handleTitleSubmit(conversation.id, newTitle);
                }}
              >
                <path d="M362.7 19.3L314.3 67.7 444.3 197.7l48.4-48.4c25-25 25-65.5 0-90.5L453.3 19.3c-25-25-65.5-25-90.5 0zm-71 71L58.6 323.5c-10.4 10.4-18 23.3-22.2 37.4L1 481.2C-1.5 489.7 .8 498.8 7 505s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L421.7 220.3 291.7 90.3z" />
              </svg>

              {/* Trash Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 icon-container hover:bg-red-500 p-1 rounded cursor-pointer"
                viewBox="0 0 448 512"
                fill="currentColor"
                onClick={(e) => {
                  e.stopPropagation(); // Prevents the click event from bubbling up to the <li> element
                  handleDeleteConversation(conversation.id, conversation.title);
                }}
              >
                <path
                  fillRule="evenodd"
                  d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
};

export default ConversationList;
