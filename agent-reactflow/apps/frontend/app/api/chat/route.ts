import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';

export const maxDuration = 30;

// export async function POST() {
//   console.log("✅ Chat POST route hit");

//   const data = new experimental_StreamData();

//   // Simulate partial streaming text
//   setTimeout(() => {
//     data.appendMessage({ role: 'assistant', content: 'Sure, let me verify that...' });
//   }, 200);

//   // Simulate tool call activation (node-activated)
//   setTimeout(() => {
//     data.appendToolCall({
//       toolName: 'updateFlow',
//       toolCallId: 'call-1',
//       args: {
//         flow: {
//           nodes: [
//             { id: 'Id verification', data: { label: 'ID verified ✅' } },
//             { id: 'Manual verification', data: { label: 'Manual step needed 🧑‍💻' } },
//           ],
//           edges: [],
//         },
//       },
//       state: 'result',
//     });
//   }, 400);

//   // End stream
//   setTimeout(() => {
//     data.close();
//   }, 600);

//   return data.toAIStreamResponse(); // ✅ This ensures correct format
// }



// 👇 Original logic commented out for reference

export async function POST(req: Request) {
  const { messages, agentId, runId } = await req.json();
  try {
    const restackEngineHostname = process.env.RESTACK_ENGINE_ADDRESS ? `https://${process.env.RESTACK_ENGINE_ADDRESS}` : 'http://localhost:9233';

    const openaiClient = createOpenAI({
      apiKey: 'next-flow-frontend',
      baseURL: `${restackEngineHostname}/stream/agents/agentChat/${agentId}/${runId}`,
    });

    const result = streamText({
      model: openaiClient('gpt-4.1-mini'),
      messages,
      tools: {
        updateFlow: tool({
          description: 'Create or update flow',
          parameters: z.object({
            flow: z.any()
          }),
          execute: async ({ flow }) => {
            return { flow };
          },
        }),
      },
      toolCallStreaming: true,
    });

    return result.toDataStreamResponse();

  } catch (error) {
    console.error(error);
    return new Response("Error", { status: 500 });
  }
}



// Original Code
// import { createOpenAI } from '@ai-sdk/openai';
// import { streamText, tool } from 'ai';
// import { z } from 'zod';

// export const maxDuration = 30;

// export async function POST(req: Request) {
//   const { messages, agentId, runId } = await req.json();
//   try {

//   const restackEngineHostname = process.env.RESTACK_ENGINE_ADDRESS ? `https://${process.env.RESTACK_ENGINE_ADDRESS}` : 'http://localhost:9233';

//   const openaiClient = createOpenAI({
//     apiKey: 'next-flow-frontend',
//     baseURL: `${restackEngineHostname}/stream/agents/agentChat/${agentId}/${runId}`,
//   })

//   const result = streamText({
//     model: openaiClient('gpt-4.1-mini'),
//     messages,
//     tools: {
//       updateFlow: tool({
//         description: 'Create or update flow',
//         parameters: z.object({
//           flow: z.any()
//         }),
//         execute: async ({ flow }) => {
//           return {
//             flow,
//           };
//         },
//       }),
//     },
//     toolCallStreaming: true,
//   });

//   return result.toDataStreamResponse();

//   } catch (error) {
//     console.error(error);
//     return new Response("Error", { status: 500 });
//   }
// }