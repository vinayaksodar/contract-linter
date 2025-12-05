import type { ChatModelAdapter, ThreadMessage } from "@assistant-ui/react";
import { getGeminiApiKey } from "../storage/settingsStore";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const geminiAdapter: ChatModelAdapter = {
  async *run({ messages }) {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      yield {
        content: [
          {
            type: "text",
            text: "Gemini API key not found. Please add it in the settings.",
          },
        ],
      };
      return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const chat = model.startChat({
      history: messages
        .slice(0, -1)
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: m.content
            .filter((c) => c.type === "text")
            .map((c) => ({ text: c.text }))
            .filter((p) => p.text),
        })),
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.9,
        topP: 1,
        topK: 1,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    const lastMessage = messages[messages.length - 1];

    const mainText = lastMessage.content
      .filter((c) => c.type === "text")
      .map((c) => c.text)
      .join("\n");

    const attachmentTexts = (lastMessage.attachments ?? [])
      .flatMap((attachment) => attachment.content ?? [])
      .filter((part) => part.type === "text")
      .map((part) => {
        const nameMatch = part.text.match(/name="([^"]+)"/);
        const name = nameMatch ? nameMatch[1] : "attached file";
        const content = part.text
          .replace(/<attachment[^>]*>/, "")
          .replace(/<\/attachment>/, "");
        return `The user has attached a file named "${name}" with the following content:\n---\n${content}\n---`;
      });

    const prompt = [mainText, ...attachmentTexts].join("\n\n").trim();

    const result = await chat.sendMessageStream(prompt);

    let text = "";
    for await (const chunk of result.stream) {
      text += chunk.text();
      yield {
        content: [{ type: "text", text }],
      };
    }
  },
};

export default geminiAdapter;
