import { useCallback, useEffect, useMemo, useState } from "react";
import { Clock, Mail, Phone, RefreshCw, Send } from "lucide-react";
import { toast } from "sonner";
import {
    adminContentService,
    type AdminContactMessage,
    type ContactMessageStatus,
} from "../service/AdminContentService.ts";
import { getAdminActionErrorMessage } from "../../../lib/adminErrorUtils.ts";

type StatusFilter = "ALL" | ContactMessageStatus;

const FILTER_OPTIONS: Array<{ label: string; value: StatusFilter }> = [
    { label: "All", value: "ALL" },
    { label: "New", value: "NEW" },
    { label: "Replied", value: "REPLIED" },
    { label: "Closed", value: "CLOSED" },
];

const statusClassMap: Record<ContactMessageStatus, string> = {
    NEW: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    REPLIED: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    CLOSED: "bg-slate-500/20 text-slate-300 border border-slate-500/30",
};

const formatDateTime = (value: string): string => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export function MessagesPage() {
    const pageSize = 20;
    const [messages, setMessages] = useState<AdminContactMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalMessages, setTotalMessages] = useState(0);
    const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
    const [replyDraft, setReplyDraft] = useState("");
    const [isSendingReply, setIsSendingReply] = useState(false);
    const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

    const loadMessages = useCallback(async (options?: { silent?: boolean }) => {
        const silent = options?.silent === true;

        try {
            if (silent) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }
            setError(null);

            const dataPage = await adminContentService.getMessages(
                statusFilter === "ALL" ? undefined : statusFilter,
                currentPage,
                pageSize
            );
            const data = dataPage.content;
            setMessages(data);
            setTotalPages(Math.max(1, dataPage.totalPages));
            setTotalMessages(dataPage.totalElements);
            setSelectedMessageId((current) => {
                if (data.length === 0) {
                    return null;
                }
                if (current !== null && data.some((message) => message.messageId === current)) {
                    return current;
                }
                return data[0].messageId;
            });
        } catch (fetchError) {
            console.error("Failed to load contact messages:", fetchError);
            setError(getAdminActionErrorMessage(fetchError, "Unable to load contact messages."));
        } finally {
            if (silent) {
                setIsRefreshing(false);
            } else {
                setIsLoading(false);
            }
        }
    }, [currentPage, pageSize, statusFilter]);

    useEffect(() => {
        void loadMessages();
    }, [loadMessages]);

    useEffect(() => {
        setCurrentPage(0);
    }, [statusFilter]);

    useEffect(() => {
        if (currentPage > 0 && currentPage >= totalPages) {
            setCurrentPage(totalPages - 1);
        }
    }, [currentPage, totalPages]);

    useEffect(() => {
        const interval = window.setInterval(() => {
            void loadMessages({ silent: true });
        }, 8000);

        return () => {
            window.clearInterval(interval);
        };
    }, [loadMessages]);

    const selectedMessage = useMemo(
        () => messages.find((message) => message.messageId === selectedMessageId) ?? null,
        [messages, selectedMessageId]
    );

    const handleReply = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!selectedMessage) {
            return;
        }

        const messageText = replyDraft.trim();
        if (!messageText) {
            toast.error("Reply message cannot be empty.");
            return;
        }

        try {
            setIsSendingReply(true);
            const updatedMessage = await adminContentService.replyToMessage(selectedMessage.messageId, messageText);
            setMessages((current) => current.map((item) => (
                item.messageId === updatedMessage.messageId ? updatedMessage : item
            )));
            setReplyDraft("");
            toast.success("Reply sent.");
        } catch (replyError) {
            console.error("Failed to reply to contact message:", replyError);
            toast.error(getAdminActionErrorMessage(replyError, "Unable to send reply."));
        } finally {
            setIsSendingReply(false);
        }
    };

    const handleStatusUpdate = async (status: ContactMessageStatus) => {
        if (!selectedMessage) {
            return;
        }

        try {
            setStatusUpdateLoading(true);
            const updatedMessage = await adminContentService.updateMessageStatus(selectedMessage.messageId, status);
            setMessages((current) => current.map((item) => (
                item.messageId === updatedMessage.messageId ? updatedMessage : item
            )));
            toast.success(`Message marked as ${status.toLowerCase()}.`);
        } catch (statusError) {
            console.error("Failed to update message status:", statusError);
            toast.error(getAdminActionErrorMessage(statusError, "Unable to update message status."));
        } finally {
            setStatusUpdateLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[280px] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
                    <p className="text-gray-400">Loading messages...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    {FILTER_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => setStatusFilter(option.value)}
                            className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                                statusFilter === option.value
                                    ? "bg-white text-black"
                                    : "bg-[#1a1a1a] text-gray-300 hover:bg-gray-800"
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={() => void loadMessages({ silent: true })}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800"
                >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                    Refresh
                </button>
            </div>

            {error && (
                <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                    {error}
                </div>
            )}

            <section className="grid min-h-[520px] gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
                <aside className="overflow-hidden rounded-xl border border-gray-800 bg-[#1a1a1a]">
                    <div className="border-b border-gray-800 px-4 py-3 text-sm text-gray-400">
                        {totalMessages.toLocaleString()} message{totalMessages === 1 ? "" : "s"}
                    </div>

                    {messages.length === 0 ? (
                        <div className="px-4 py-6 text-sm text-gray-400">No messages found for this filter.</div>
                    ) : (
                        <div className="max-h-[520px] overflow-y-auto">
                            {messages.map((message) => {
                                const isActive = message.messageId === selectedMessageId;
                                const latestReply = message.replies.length > 0
                                    ? message.replies[message.replies.length - 1]
                                    : null;

                                return (
                                    <button
                                        key={message.messageId}
                                        type="button"
                                        onClick={() => setSelectedMessageId(message.messageId)}
                                        className={`w-full border-b border-gray-800 px-4 py-3 text-left transition-colors ${
                                            isActive ? "bg-gray-800/70" : "hover:bg-gray-800/40"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-sm font-medium text-white">{message.name}</p>
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-[11px] ${statusClassMap[message.messageStatus]}`}
                                            >
                                                {message.messageStatus}
                                            </span>
                                        </div>
                                        <p className="mt-1 truncate text-xs text-gray-400">
                                            {message.subject || "No subject"}
                                        </p>
                                        <p className="mt-1 truncate text-xs text-gray-500">
                                            {latestReply ? `Reply: ${latestReply.message}` : message.message}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    <div className="flex items-center justify-between border-t border-gray-800 px-4 py-3">
                        <span className="text-xs text-gray-500">
                            Page {Math.min(currentPage + 1, totalPages)} of {Math.max(1, totalPages)}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={isLoading || isRefreshing || currentPage <= 0}
                                onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                                className="rounded border border-gray-700 px-2 py-1 text-xs text-gray-300 hover:bg-gray-800 disabled:opacity-60"
                            >
                                Prev
                            </button>
                            <button
                                type="button"
                                disabled={isLoading || isRefreshing || currentPage + 1 >= totalPages}
                                onClick={() => setCurrentPage((prev) => prev + 1)}
                                className="rounded border border-gray-700 px-2 py-1 text-xs text-gray-300 hover:bg-gray-800 disabled:opacity-60"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </aside>

                <div className="rounded-xl border border-gray-800 bg-[#1a1a1a] p-5">
                    {!selectedMessage ? (
                        <div className="flex h-full items-center justify-center text-sm text-gray-400">
                            Select a message to view details.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-800 pb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">{selectedMessage.name}</h3>
                                    <div className="mt-2 space-y-1 text-sm text-gray-300">
                                        <p className="inline-flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-gray-500" />
                                            {selectedMessage.email}
                                        </p>
                                        <p className="inline-flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-gray-500" />
                                            {selectedMessage.phone}
                                        </p>
                                        <p className="inline-flex items-center gap-2 text-xs text-gray-500">
                                            <Clock className="h-3.5 w-3.5" />
                                            Received {formatDateTime(selectedMessage.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-xs ${statusClassMap[selectedMessage.messageStatus]}`}
                                    >
                                        {selectedMessage.messageStatus}
                                    </span>

                                    <button
                                        type="button"
                                        disabled={statusUpdateLoading}
                                        onClick={() => void handleStatusUpdate("NEW")}
                                        className="rounded-md border border-amber-500/40 px-3 py-1 text-xs text-amber-300 hover:bg-amber-500/10 disabled:opacity-60"
                                    >
                                        Mark New
                                    </button>
                                    <button
                                        type="button"
                                        disabled={statusUpdateLoading}
                                        onClick={() => void handleStatusUpdate("CLOSED")}
                                        className="rounded-md border border-slate-500/40 px-3 py-1 text-xs text-slate-300 hover:bg-slate-500/10 disabled:opacity-60"
                                    >
                                        Close
                                    </button>
                                </div>
                            </header>

                            <div className="space-y-3 rounded-lg border border-gray-800 bg-[#101010] p-4">
                                <p className="text-xs uppercase tracking-wide text-gray-500">Original Message</p>
                                <p className="text-sm text-gray-200 whitespace-pre-wrap">{selectedMessage.message}</p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs uppercase tracking-wide text-gray-500">Replies</p>
                                {selectedMessage.replies.length === 0 ? (
                                    <div className="rounded-lg border border-dashed border-gray-700 px-4 py-3 text-sm text-gray-400">
                                        No replies yet.
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {selectedMessage.replies.map((reply) => (
                                            <div key={reply.replyId} className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
                                                <div className="mb-1 flex items-center justify-between gap-3">
                                                    <span className="text-xs font-semibold text-emerald-300">{reply.repliedBy}</span>
                                                    <span className="text-xs text-gray-500">{formatDateTime(reply.repliedAt)}</span>
                                                </div>
                                                <p className="text-sm text-gray-100 whitespace-pre-wrap">{reply.message}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleReply} className="space-y-2 border-t border-gray-800 pt-4">
                                <label className="text-sm text-gray-300">Instant Reply</label>
                                <textarea
                                    value={replyDraft}
                                    onChange={(event) => setReplyDraft(event.target.value)}
                                    rows={4}
                                    placeholder="Write a quick response..."
                                    className="w-full rounded-lg border border-gray-700 bg-[#101010] px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                                />
                                <button
                                    type="submit"
                                    disabled={isSendingReply}
                                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-60"
                                >
                                    <Send className="h-4 w-4" />
                                    {isSendingReply ? "Sending..." : "Send Reply"}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
