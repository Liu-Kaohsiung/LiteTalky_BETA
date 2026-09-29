"use client";

import { useEffect, useReducer, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  initialWorkspaceState,
  workspaceReducer,
  type Destination,
  type Session,
  type SessionMessage,
} from "./workspace-state";

type IconName = "chat" | "spark" | "user" | "logout" | "plus" | "more" | "edit" | "trash" | "close" | "arrow" | "menu" | "check";

const icons: Record<IconName, ReactNode> = {
  chat: (
    <>
      <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H7l-3.5 2v-5.2A7.5 7.5 0 1 1 20 11.5Z" />
      <path d="M8 11h.01M12 11h.01M16 11h.01" />
    </>
  ),
  spark: (
    <>
      <path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z" />
      <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 21a7 7 0 0 1 14 0" />
    </>
  ),
  logout: (
    <>
      <path d="M10 17l5-5-5-5M15 12H3" />
      <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  more: (
    <>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </>
  ),
  edit: (
    <>
      <path d="m14 5 5 5M4 20l4.2-.8L19 8.4 15.6 5 4.8 15.8 4 20Z" />
      <path d="M13 20h7" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  check: <path d="m5 12 4 4L19 6" />,
};

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icons[name]}
    </svg>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
    .format(new Date(value))
    .replace(",", "");
}

export default function Home() {
  const [workspace, dispatch] = useReducer(workspaceReducer, initialWorkspaceState);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftMessage, setDraftMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const selectedSession = workspace.sessions.find(
    (session) => session.id === workspace.selectedSessionId,
  );

  function createSession() {
    dispatch({
      type: "create-session",
      session: {
        id: globalThis.crypto.randomUUID(),
        title: "New Conversation",
        lastEdited: new Date().toISOString(),
        messages: [],
        isGenerating: false,
        error: null,
      },
    });
    setEditingId(null);
    setOpenMenuId(null);
    setMobileNavOpen(false);
  }

  function beginRename(session: Session) {
    setDraftTitle(session.title);
    setEditingId(session.id);
    setOpenMenuId(null);
  }

  function saveRename(id: string) {
    const title = draftTitle.trim();
    if (!title) {
      setEditingId(null);
      return;
    }

    dispatch({
      type: "rename-session",
      id,
      title,
      lastEdited: new Date().toISOString(),
    });
    setEditingId(null);
  }

  function deleteSession(id: string) {
    dispatch({ type: "delete-session", id });
    if (editingId === id) setEditingId(null);
    setOpenMenuId(null);
  }

  function navigate(to: Destination) {
    dispatch({ type: "navigate", destination: to });
    setMobileNavOpen(false);
    setOpenMenuId(null);
  }

  const conversationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const conversation = conversationRef.current;
    if (conversation) conversation.scrollTop = conversation.scrollHeight;
  }, [workspace.selectedSessionId, selectedSession?.messages.length, selectedSession?.isGenerating]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const session = selectedSession;
    const content = draftMessage.trim();
    if (!session || session.isGenerating || !content) return;

    const sessionId = session.id;
    const userMessage: SessionMessage = {
      id: globalThis.crypto.randomUUID(),
      role: "user",
      content,
    };
    const messages = [
      ...session.messages.map(({ role, content: messageContent }) => ({
        role,
        content: messageContent,
      })),
      { role: "user" as const, content },
    ];

    dispatch({
      type: "user-message-sent",
      sessionId,
      message: userMessage,
      lastEdited: new Date().toISOString(),
    });
    setDraftMessage("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      const payload: unknown = await response.json().catch(() => null);
      const result = payload as { message?: { content?: unknown }; error?: unknown } | null;

      if (!response.ok) {
        dispatch({
          type: "chat-request-failed",
          sessionId,
          error:
            typeof result?.error === "string"
              ? result.error
              : "The assistant could not respond. Please try again.",
        });
        return;
      }

      const assistantContent = result?.message?.content;
      if (typeof assistantContent !== "string" || !assistantContent.trim()) {
        dispatch({
          type: "chat-request-failed",
          sessionId,
          error: "The assistant returned an empty response. Please try again.",
        });
        return;
      }

      dispatch({
        type: "assistant-message-received",
        sessionId,
        message: {
          id: globalThis.crypto.randomUUID(),
          role: "assistant",
          content: assistantContent,
        },
        lastEdited: new Date().toISOString(),
      });
    } catch {
      dispatch({
        type: "chat-request-failed",
        sessionId,
        error: "Could not reach the chat server. Check your connection and try again.",
      });
    }
  }

  return (
    <div className="workspace-shell">
      {mobileNavOpen && (
        <button
          className="mobile-nav-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <aside className={`sidebar${mobileNavOpen ? " sidebar-open" : ""}`}>
        <div className="brand-row">
          <a className="brand" href="#home" onClick={() => navigate("chat")}>
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 40 40" fill="none">
                <path d="M31 18.5a11 11 0 0 1-11 11H13l-5 3v-7.1a11 11 0 1 1 23-6.9Z" />
                <path d="m19.8 11.5 1.3 4 4 1.3-4 1.3-1.3 4-1.3-4-4-1.3 4-1.3 1.3-4Z" />
              </svg>
            </span>
            <span className="brand-name">LiteTalky</span>
          </a>
          <span className="brand-edition">WORKSPACE</span>
        </div>

        <div className="sidebar-rule" />

        <nav className="sidebar-nav" aria-label="Workspace navigation">
          <div className="nav-section">
            <p className="section-label">Apps</p>
            <button
              className={`nav-item${workspace.destination === "simgEn" ? " nav-item-active" : ""}`}
              onClick={() => navigate("simgEn")}
              type="button"
            >
              <span className="nav-item-icon"><Icon name="spark" /></span>
              <span>SimGen</span>
              <span className="nav-badge">SOON</span>
            </button>
            <button
              className={`nav-item${workspace.destination === "chat" ? " nav-item-active" : ""}`}
              onClick={() => navigate("chat")}
              type="button"
              aria-current={workspace.destination === "chat" ? "page" : undefined}
            >
              <span className="nav-item-icon"><Icon name="chat" /></span>
              <span>CHAT</span>
              {workspace.destination === "chat" && <span className="active-indicator" />}
            </button>
          </div>

          <div className="nav-section account-section">
            <p className="section-label">Account</p>
            <button
              className={`nav-item${workspace.destination === "account" ? " nav-item-active" : ""}`}
              onClick={() => navigate("account")}
              type="button"
            >
              <span className="nav-item-icon"><Icon name="user" /></span>
              <span>Account</span>
              <Icon name="arrow" size={15} />
            </button>
          </div>

          <div className="sessions-section">
            <div className="sessions-heading">
              <p className="section-label">Sessions</p>
              <button
                className="add-session-button"
                type="button"
                aria-label="Start a new session"
                title="Start a new session"
                onClick={createSession}
              >
                <Icon name="plus" size={17} />
              </button>
            </div>

            <div className="session-list">
              {workspace.sessions.length === 0 ? (
                <p className="session-list-empty">Your conversations will appear here.</p>
              ) : (
                workspace.sessions.map((session) => (
                  <div
                    className={`session-card${workspace.selectedSessionId === session.id ? " session-card-active" : ""}`}
                    key={session.id}
                  >
                    {editingId === session.id ? (
                      <form
                        className="rename-form"
                        onSubmit={(event) => {
                          event.preventDefault();
                          saveRename(session.id);
                        }}
                      >
                        <input
                          aria-label="Session title"
                          autoFocus
                          value={draftTitle}
                          onChange={(event) => setDraftTitle(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Escape") setEditingId(null);
                          }}
                          maxLength={60}
                        />
                        <button className="rename-save" type="submit" aria-label="Save title">
                          <Icon name="check" size={16} />
                        </button>
                        <button
                          className="rename-cancel"
                          type="button"
                          aria-label="Cancel rename"
                          onClick={() => setEditingId(null)}
                        >
                          <Icon name="close" size={16} />
                        </button>
                      </form>
                    ) : (
                      <>
                        <button
                          className="session-select"
                          type="button"
                          onClick={() => {
                            dispatch({ type: "select-session", id: session.id });
                            setOpenMenuId(null);
                          }}
                          aria-pressed={workspace.selectedSessionId === session.id}
                        >
                          <span className="session-title">{session.title}</span>
                          <time className="session-date" dateTime={session.lastEdited}>
                            {formatDate(session.lastEdited)}
                          </time>
                        </button>
                        <button
                          className="session-more"
                          type="button"
                          aria-label={`Options for ${session.title}`}
                          aria-expanded={openMenuId === session.id}
                          onClick={() => setOpenMenuId(openMenuId === session.id ? null : session.id)}
                        >
                          <Icon name="more" size={17} />
                        </button>
                        {openMenuId === session.id && (
                          <div className="session-menu" role="menu">
                            <button type="button" role="menuitem" onClick={() => beginRename(session)}>
                              <Icon name="edit" size={15} />
                              <span>Change title</span>
                            </button>
                            <button
                              className="delete-action"
                              type="button"
                              role="menuitem"
                              onClick={() => deleteSession(session.id)}
                            >
                              <Icon name="trash" size={15} />
                              <span>Delete session</span>
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="footer-rule" />
          <button
            className="logout-button"
            type="button"
            onClick={() => setNotice("Sign out is not connected in this preview.")}
          >
            <Icon name="logout" size={18} />
            <span>Log out</span>
          </button>
          <div className="sidebar-version"><span /> LITETALKY PREVIEW</div>
        </div>
      </aside>

      <div className="main-column">
        <header className="workspace-topbar">
          <button
            className="mobile-menu-button"
            type="button"
            aria-label="Open navigation"
            onClick={() => setMobileNavOpen(true)}
          >
            <Icon name="menu" size={20} />
          </button>
          <div className="breadcrumb">
            <span>WORKSPACE</span>
            <span className="breadcrumb-divider">/</span>
            <strong>
              {workspace.destination === "chat" ? "CHAT" : workspace.destination === "simgEn" ? "SIMGEN" : "ACCOUNT"}
            </strong>
          </div>
          <div className="topbar-right">
            {selectedSession && workspace.destination === "chat" && (
              <span className="current-session-label">{selectedSession.title}</span>
            )}
            <span className="preview-chip"><span /> PREVIEW</span>
          </div>
        </header>

        <main className="workspace-content">
          {workspace.destination === "chat" && !selectedSession && (
            <section className="welcome-state" aria-labelledby="welcome-title">
              <div className="welcome-art" aria-hidden="true">
                <div className="art-halo" />
                <div className="art-card art-card-back"><span /><span /><span /></div>
                <div className="art-card art-card-front">
                  <span className="art-chat-bubble"><Icon name="chat" size={27} /></span>
                  <span className="art-spark"><Icon name="spark" size={17} /></span>
                </div>
                <span className="art-orbit art-orbit-one" />
                <span className="art-orbit art-orbit-two" />
              </div>
              <p className="welcome-kicker"><span /> A LITTLE ROOM TO THINK</p>
              <h1 id="welcome-title">Good ideas start<br className="desktop-break" /> with a conversation.</h1>
              <p className="welcome-copy">
                Open a fresh space and see where your next thought takes you.
              </p>
              <button className="start-button" type="button" onClick={createSession}>
                <span className="start-button-plus"><Icon name="plus" size={21} /></span>
                <span>Start a New Conversation</span>
                <Icon name="arrow" size={18} />
              </button>
              <p className="welcome-hint">Your recent conversations live in the sidebar.</p>
            </section>
          )}

          {workspace.destination === "chat" && selectedSession && (
            <section className="session-workspace" aria-labelledby="session-heading">
              <div className="session-workspace-heading">
                <div>
                  <p className="content-eyebrow"><span /> CHAT SESSION</p>
                  <h1 id="session-heading">{selectedSession.title}</h1>
                  <p className="session-updated">Last edited {formatDate(selectedSession.lastEdited)}</p>
                </div>
                <button className="new-session-secondary" type="button" onClick={createSession}>
                  <Icon name="plus" size={17} />
                  <span>New conversation</span>
                </button>
              </div>
              <div
                className={`empty-conversation${selectedSession.messages.length ? " has-messages" : ""}`}
                ref={conversationRef}
              >
                {selectedSession.messages.length === 0 ? (
                  <div className="empty-conversation-prompt">
                    <div className="empty-conversation-icon"><Icon name="chat" size={25} /></div>
                    <p className="empty-label">A FRESH PAGE</p>
                    <h2>This conversation is ready when you are.</h2>
                    <p>Send a message to start chatting with LiteTalky.</p>
                  </div>
                ) : (
                  <div className="message-list" aria-live="polite">
                    {selectedSession.messages.map((message) => (
                      <article className={`chat-message chat-message-${message.role}`} key={message.id}>
                        <p className="chat-message-author">{message.role === "user" ? "You" : "LiteTalky"}</p>
                        <p className="chat-message-content">{message.content}</p>
                      </article>
                    ))}
                    {selectedSession.isGenerating && (
                      <p className="assistant-loading" role="status">LiteTalky is thinking...</p>
                    )}
                  </div>
                )}
              </div>
              {selectedSession.error && (
                <p className="chat-error" role="alert">{selectedSession.error}</p>
              )}
              <form className="message-composer" onSubmit={sendMessage}>
                <textarea
                  className="message-input"
                  aria-label="Message LiteTalky"
                  placeholder="Write a message..."
                  value={draftMessage}
                  maxLength={8000}
                  onChange={(event) => setDraftMessage(event.target.value)}
                />
                <button
                  className="send-message-button"
                  type="submit"
                  disabled={!draftMessage.trim() || selectedSession.isGenerating}
                  aria-label={selectedSession.isGenerating ? "Waiting for response" : "Send message"}
                >
                  <span>{selectedSession.isGenerating ? "Waiting" : "Send"}</span>
                  <Icon name="arrow" size={16} />
                </button>
              </form>
            </section>
          )}

          {workspace.destination !== "chat" && (
            <section className="coming-soon-state">
              <div className="coming-soon-icon">
                <Icon name={workspace.destination === "simgEn" ? "spark" : "user"} size={27} />
              </div>
              <p className="content-eyebrow"><span /> LITETALKY WORKSPACE</p>
              <h1>{workspace.destination === "simgEn" ? "SimGen" : "Your account"}</h1>
              <p>
                {workspace.destination === "simgEn"
                  ? "SimGen is not implemented yet."
                  : "Account controls will live here."}
              </p>
              <button className="text-back-button" type="button" onClick={() => navigate("chat")}>
                <Icon name="arrow" size={16} />
                Back to Chat
              </button>
            </section>
          )}
        </main>
      </div>

      {notice && (
        <div className="preview-notice" role="status">
          <span>{notice}</span>
          <button type="button" aria-label="Dismiss message" onClick={() => setNotice("")}>
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
