import { FunctionFailure, log } from "@restackio/ai/function";
import OpenAI from "openai/index";
import { ChatCompletionCreateParamsNonStreaming } from "openai/resources/chat/completions";
import { ChatModel } from "openai/resources/index";

export type UsageOutput = { tokens: number; cost: number };

export type OpenAIChatInput = {
  userContent: string;
  systemContent?: string;
  model?: ChatModel;
};

export const llm = async ({
  userContent,
  systemContent = "",
  model = "gpt-4.1-mini",
}: OpenAIChatInput): Promise<string> => {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const chatParams: ChatCompletionCreateParamsNonStreaming = {
      messages: [
        ...(systemContent
          ? [{ role: "system" as const, content: systemContent }]
          : []),
        { role: "user" as const, content: userContent },
      ],

      model,
    };

    log.debug("OpenAI chat completion params", {
      chatParams,
    });

    const completion = await openai.chat.completions.create(chatParams);

    return completion.choices[0].message.content ?? "";
  } catch (error) {
    throw FunctionFailure.nonRetryable(`Error OpenAI chat: ${error}`);
  }
};
