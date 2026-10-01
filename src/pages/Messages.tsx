import { useNavigate } from "react-router-dom";

import { ConversationList } from "@/components/chat/conversation-list";
import { EmptyInbox, InboxFrame, InboxHeader, SelectConversationPane } from "@/components/chat/inbox-frame";
import { useConversations } from "@/components/chat/use-conversations";
import { AppShell } from "@/components/site";

const Messages = () => {
    const navigate = useNavigate();
    const { conversations, loading, getOtherUser } = useConversations({ channel: "messages_list" });

    const empty = !loading && conversations.length === 0;

    return (
        <AppShell>
            <InboxFrame
                view="list"
                header={<InboxHeader />}
                list={
                    empty ? (
                        <EmptyInbox />
                    ) : (
                        <ConversationList
                            conversations={conversations}
                            getOtherUser={getOtherUser}
                            loading={loading}
                            onSelect={(sessionId) => navigate(`/messages/session/${sessionId}`)}
                        />
                    )
                }
            >
                {empty ? null : <SelectConversationPane />}
            </InboxFrame>
        </AppShell>
    );
};

export default Messages;
