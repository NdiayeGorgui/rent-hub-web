
"use client";

import { useEffect, useRef, useState, useContext } from "react";
import { useSearchParams } from "next/navigation";
import {
    sendMessage,
    getConversationMessages,
    markMessageAsRead,
    sendMessageWithImage,
} from "@/services/messageService";
import { getCurrentUser } from "@/services/authService";
import { MessageContext } from "@/components/contexts/MessageContext";
import { BASE_URL } from "@/lib/baseURL";


export default function ChatPage() {
    const searchParams = useSearchParams();

    const conversationId = searchParams.get("conversationId");
    const receiverId = searchParams.get("receiverId");
    const itemId = searchParams.get("itemId");
    const receiverUsername = searchParams.get("receiverUsername");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [sending, setSending] = useState(false);
    const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

    const otherUsername = receiverUsername ?? "Utilisateur";
    const item = itemId && itemId !== "" && itemId !== "null" && itemId !== "undefined"
        ? Number(itemId)
        : null;

    const [convId, setConvId] = useState<number | null>(
        conversationId ? Number(conversationId) : null
    );
    const convIdRef = useRef<number | null>(convId); // ✅ ref toujours à jour

    const [messages, setMessages] = useState<any[]>([]);
    const [content, setContent] = useState("");
    const [user, setUser] = useState<any>(null);
    const userRef = useRef<any>(null); // ✅ ref toujours à jour
    const bottomRef = useRef<HTMLDivElement>(null);
    const { loadUnreadMessages } = useContext(MessageContext);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const isAtBottomRef = useRef(true);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // ✅ Sync refs
    useEffect(() => { convIdRef.current = convId; }, [convId]);
    useEffect(() => {
        if (isAtBottomRef.current) {
            bottomRef.current?.scrollIntoView({
                behavior: "smooth",
            });
        }
    }, [messages]);

    const loadMessages = async () => {
        if (!convIdRef.current) return;
        try {
            const data = await getConversationMessages(convIdRef.current);
            setMessages(data);
            for (const msg of data) {
                if (msg.receiverId === userRef.current?.userId && !msg.read) {
                    await markMessageAsRead(msg.id);
                }
            }
            await loadUnreadMessages();
        } catch (err) {
            console.log("loadMessages error:", err);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);

        // 🔥 création preview
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        console.log("📎 Fichier sélectionné :", file.name);
    };

    // ── Init ─────────────────────────────────────────────
    useEffect(() => {
        const init = async () => {
            const u = await getCurrentUser();
            setUser(u);
            userRef.current = u;
            if (convIdRef.current) {
                await loadMessages();
            }
        };
        init();

        // ── Refresh auto ─────────────────────────────────
        const interval = setInterval(() => {
            loadMessages();
        }, 5000);

        return () => clearInterval(interval);
    }, []); // ✅ un seul setInterval, utilise les refs

    // ── Scroll bas ───────────────────────────────────────


    // ── Envoi ────────────────────────────────────────────
    const handleSend = async () => {
        if (!content.trim() && !selectedFile) return;

        try {
            setSending(true);
            // 🟢 CAS 1 : PAS de conversation → création classique (texte uniquement)
            if (!convIdRef.current) {
                const msg = await sendMessage({
                    receiverId,
                    itemId: item,
                    content,
                });

                setContent("");

                if (msg?.conversationId) {
                    convIdRef.current = msg.conversationId;
                    setConvId(msg.conversationId);
                }

                setMessages(prev => [...prev, msg]);
                return;
            }

            // 🟢 CAS 2 : conversation existe → on peut envoyer image
            const formData = new FormData();

            formData.append("conversationId", String(convIdRef.current));

            if (content.trim()) {
                formData.append("content", content.trim());
            }

            if (selectedFile) {
                formData.append("image", selectedFile);
            }

            console.log("📦 FORM DATA");
            for (let pair of formData.entries()) {
                console.log(pair[0], pair[1]);
            }

            const msg = await sendMessageWithImage(formData);

            setMessages(prev => [...prev, msg]);

            setContent("");
            setSelectedFile(null);
            setPreviewUrl(null);

        } catch (err) {
            console.log("❌ Send error:", err);
        } finally {
            setSending(false); // ✅ STOP LOADING
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-60px)]">

            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm">
                    {otherUsername.charAt(0).toUpperCase()}
                </div>
                <p className="font-semibold text-gray-900 text-sm">{otherUsername}</p>
            </div>

            {/* Messages */}
            <div
                ref={messagesContainerRef}
                onScroll={(e) => {
                    const el = e.currentTarget;

                    const distanceFromBottom =
                        el.scrollHeight - el.scrollTop - el.clientHeight;

                    isAtBottomRef.current = distanceFromBottom < 50;
                }}
                className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3 bg-gray-50"
            >

                {messages.length === 0 && (

                    <div className="text-center text-gray-400 text-sm mt-10">
                        Commencez la conversation 👋
                    </div>
                )}
                {messages.map((msg) => {
                    const isMe = msg.senderId === user?.userId;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${isMe
                                ? "bg-blue-600 text-white rounded-br-sm"
                                : "bg-white text-gray-900 border border-gray-100 rounded-bl-sm"
                                }`}>
                                <p className={`text-xs font-medium mb-1 ${isMe ? "text-blue-200" : "text-gray-400"}`}>
                                    {isMe ? "Vous" : otherUsername}
                                </p>
                                {/* Image */}
                                {msg.imageUrl && (
                                    <img
                                        src={`${BASE_URL}${msg.imageUrl}`}
                                        alt="image"
                                        className="rounded-lg mb-2 max-w-full cursor-pointer hover:opacity-90 transition-opacity"
                                        style={{ maxHeight: 250, objectFit: "contain" }}
                                        onClick={() => setFullscreenImage(`${BASE_URL}${msg.imageUrl}`)}
                                    />
                                )}

                                {/* Texte */}
                                {msg.content && <p>{msg.content}</p>}
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />

            </div>

            {/* Input */}
            <div className="bg-white border-t border-gray-100 px-6 py-4 flex gap-3 items-end">

                {/* Input file caché */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />

                {/* Bouton spirale */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${selectedFile
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                    title="Joindre un fichier"
                >
                    <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                </button>
                {previewUrl && (
                    <div className="relative w-20 h-20">
                        <img
                            src={previewUrl}
                            className="w-full h-full object-contain rounded-lg border border-gray-200"
                            alt="preview"
                        />

                        {/* bouton supprimer */}
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedFile(null);
                                setPreviewUrl(null);
                            }}
                            className="absolute -top-1 -right-1 bg-black bg-opacity-70 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                            ×
                        </button>
                    </div>
                )}
                <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Votre message... (Entrée pour envoyer)"
                    rows={1}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="button"
                    onClick={handleSend}
                    disabled={(!content.trim() && !selectedFile) || sending}
                    className={`bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors flex-shrink-0 ${(!content.trim() && !selectedFile) || sending
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-blue-700 cursor-pointer"
                        }`}
                >
                    {sending ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                    ) : "Envoyer"}
                </button>
            </div>
            {/* Fullscreen image viewer */}
            {fullscreenImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50"
                    onClick={() => setFullscreenImage(null)}
                >
                    {/* Fermer */}
                    <button
                        onClick={() => setFullscreenImage(null)}
                        className="absolute top-6 right-6 text-white text-4xl font-bold hover:opacity-70 transition-opacity z-10"
                    >
                        ×
                    </button>

                    {/* Image */}
                    <img
                        src={fullscreenImage}
                        alt="fullscreen"
                        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
                        onClick={(e) => e.stopPropagation()} // ← évite de fermer en cliquant sur l'image
                    />

                    {/* Indication fermeture */}
                    <p className="absolute bottom-6 text-white text-xs opacity-50">
                        Cliquez en dehors pour fermer
                    </p>
                </div>
            )}
        </div>
    );
}