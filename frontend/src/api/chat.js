import api from "./client";

// messages: [{ role: "user" | "assistant", content: string }, ...]
// Server is stateless -- resend the recent conversation each call.
export async function sendChatMessage(messages) {
  const { data } = await api.post("/chat", { messages });
  return data; // { reply, sources }
}
