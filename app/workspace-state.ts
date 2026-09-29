export type Destination = "chat" | "simgEn" | "account";

export type SessionMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type Session = {
  id: string;
  title: string;
  lastEdited: string;
  messages: SessionMessage[];
  isGenerating: boolean;
  error: string | null;
};

export type WorkspaceState = {
  destination: Destination;
  sessions: Session[];
  selectedSessionId: string | null;
};

export type WorkspaceAction =
  | { type: "navigate"; destination: Destination }
  | { type: "create-session"; session: Session }
  | { type: "select-session"; id: string }
  | { type: "rename-session"; id: string; title: string; lastEdited: string }
  | { type: "user-message-sent"; sessionId: string; message: SessionMessage; lastEdited: string }
  | { type: "assistant-message-received"; sessionId: string; message: SessionMessage; lastEdited: string }
  | { type: "chat-request-failed"; sessionId: string; error: string }
  | { type: "delete-session"; id: string };

export const initialWorkspaceState: WorkspaceState = {
  destination: "chat",
  sessions: [],
  selectedSessionId: null,
};

export function workspaceReducer(
  state: WorkspaceState,
  action: WorkspaceAction,
): WorkspaceState {
  switch (action.type) {
    case "navigate":
      return state.destination === action.destination
        ? state
        : { ...state, destination: action.destination };
    case "create-session":
      return {
        ...state,
        destination: "chat",
        sessions: [action.session, ...state.sessions],
        selectedSessionId: action.session.id,
      };
    case "select-session":
      if (!state.sessions.some((session) => session.id === action.id)) return state;
      return {
        ...state,
        destination: "chat",
        selectedSessionId: action.id,
      };
    case "rename-session": {
      const title = action.title.trim();
      if (!title || !state.sessions.some((session) => session.id === action.id)) return state;

      return {
        ...state,
        sessions: state.sessions.map((session) =>
          session.id === action.id
            ? { ...session, title, lastEdited: action.lastEdited }
          : session,
        ),
      };
    }
    case "user-message-sent": {
      const session = state.sessions.find((item) => item.id === action.sessionId);
      if (!session || session.isGenerating) return state;

      return {
        ...state,
        sessions: state.sessions.map((session) =>
          session.id === action.sessionId && !session.isGenerating
            ? {
                ...session,
                messages: [...session.messages, action.message],
                lastEdited: action.lastEdited,
                isGenerating: true,
                error: null,
              }
            : session,
        ),
      };
    }
    case "assistant-message-received": {
      const session = state.sessions.find((item) => item.id === action.sessionId);
      if (!session || !session.isGenerating) return state;

      return {
        ...state,
        sessions: state.sessions.map((session) =>
          session.id === action.sessionId && session.isGenerating
            ? {
                ...session,
                messages: [...session.messages, action.message],
                lastEdited: action.lastEdited,
                isGenerating: false,
                error: null,
              }
            : session,
        ),
      };
    }
    case "chat-request-failed": {
      const session = state.sessions.find((item) => item.id === action.sessionId);
      if (!session || !session.isGenerating) return state;

      return {
        ...state,
        sessions: state.sessions.map((session) =>
          session.id === action.sessionId && session.isGenerating
            ? { ...session, isGenerating: false, error: action.error }
            : session,
        ),
      };
    }
    case "delete-session": {
      const sessions = state.sessions.filter((session) => session.id !== action.id);
      if (sessions.length === state.sessions.length) return state;
      const deletedSelection = state.selectedSessionId === action.id;

      return {
        ...state,
        destination: deletedSelection ? "chat" : state.destination,
        sessions,
        selectedSessionId:
          deletedSelection ? sessions[0]?.id ?? null : state.selectedSessionId,
      };
    }
  }
}
