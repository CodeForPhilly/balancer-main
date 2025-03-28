import React from "react";
import { useState, useEffect } from "react";
import { Conversation } from "./Chat";
import { FaPen, FaTimes } from "react-icons/fa";

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
    <div className="flex flex-col gap-1 p-1">
      <button className="btnBlue w-full text-lg" onClick={onNewConversation}>
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
              <FaPen className="text-gray-600 hover:text-blue-500" onClick={(e) => {
                    e.stopPropagation(); // Prevents the click event from bubbling up to the <li> element
                    handleDeleteConversation(conversation.id, conversation.title);
                  }}
                />

              <FaTimes className="text-gray-600 hover:text-blue-500" onClick={(e) => {
                  e.stopPropagation(); // Prevents the click event from bubbling up to the <li> element
                  handleDeleteConversation(conversation.id, conversation.title);
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConversationList;
