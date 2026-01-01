export const maxDuration = 30

async function callXAI(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>,
  signal?: AbortSignal,
): Promise<Response> {
  // Extract model ID - handle both "xai/grok-4.1" and "grok-4.1" formats
  const modelId = model.startsWith("xai/") ? model.slice(4) : model

  console.log(`[v0] Multi-chat calling xAI API with model: ${modelId}`)

  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ],
      temperature: 0.8,
      max_tokens: 800, // Shorter for multi-char
      stream: true,
    }),
    signal,
  })

  return response
}

async function callOpenRouter(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>,
  signal?: AbortSignal,
): Promise<Response> {
  console.log(`[v0] Multi-chat calling OpenRouter API with model: ${model}`)

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://v0.dev",
      "X-Title": "BlackOracle Engine - Party Mode",
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ],
      temperature: 0.8,
      max_tokens: 800,
      stream: true,
    }),
    signal,
  })

  return response
}

function createStreamResponse(response: Response): Response {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader()
      if (!reader) {
        controller.close()
        return
      }

      const decoder = new TextDecoder()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split("\n").filter((line) => line.trim() !== "")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6)
              if (data === "[DONE]") continue

              try {
                const parsed = JSON.parse(data)
                const content = parsed.choices?.[0]?.delta?.content

                if (content) {
                  controller.enqueue(encoder.encode(`0:${JSON.stringify(content)}\n`))
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      } catch (error) {
        console.error("[v0] Multi-chat stream error:", error)
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}

import { getRelevantLoreFromSupabase } from "@/lib/supabase-lore-server"

export async function POST(req: Request) {
  try {
    const { messages, model, apiKey, apiKeys, characterId, character, sessionContext, lorebookIds } = await req.json()

    const effectiveApiKeys = {
      xai: apiKeys?.xai || apiKey,
      openRouter: apiKeys?.openRouter || apiKey,
    }

    if (!effectiveApiKeys.xai && !effectiveApiKeys.openRouter) {
      return Response.json({ error: "API key required (xAI or OpenRouter)" }, { status: 400 })
    }

    let loreContext = ""
    if (lorebookIds && lorebookIds.length > 0) {
      const recentMessages = messages
        .slice(-5)
        .map((m: any) => m.content)
        .join(" ")
      const relevantLore = await getRelevantLoreFromSupabase(recentMessages, characterId, undefined, lorebookIds)

      if (relevantLore.length > 0) {
        loreContext = `\n\n=== WORLD LORE & CONTEXT ===\nThe following lore is relevant to the current conversation:\n\n${relevantLore
          .map((entry) => `[${entry.name}] (${entry.importance})\n${entry.content}`)
          .join(
            "\n\n",
          )}\n\nUse this lore naturally in your responses when relevant. Characters should react to, remember, and reference these facts as appropriate for their knowledge level.\n`
      }
    }

    const systemPrompt = `${sessionContext}${loreContext}

=== CONTEXTUAL AWARENESS & MEMORY ===
You have full awareness of:
- All previous conversations and events in this session
- Character relationships and their evolution
- The current scenario and your role within it
- Emotional states and ongoing storylines
- Physical locations and environmental details
- World lore and established facts from the lorebooks

MEMORY RULES:
1. Remember and reference past events naturally in conversation
2. Track character emotional states across the session
3. Maintain consistency with established facts and relationships
4. Build upon previous interactions organically
5. React to character development and story progression

FORMATTING RULES:
- Write in third-person narrative format using "${character.name}"
- Put spoken dialogue in double quotes ("")
- Keep responses concise (2-4 paragraphs max) to allow other characters to respond
- Include body language, facial expressions, and environmental details
- Show internal thoughts and emotions when relevant

DYNAMIC RESPONSE RULES:
- Consider the group dynamic and current situation
- React naturally to what others have said
- Let the conversation flow organically - you don't need to respond to everything
- When it makes sense for your character to stay quiet, it's okay to pass
- Balance between advancing the story and letting others contribute
- Pay attention to who was just addressed or mentioned

This is a multi-character roleplay. Stay in character and respond appropriately to the group conversation.`

    const selectedModel = model || "xai/grok-4.1"
    const isXAIModel = selectedModel.startsWith("xai/") || selectedModel.startsWith("grok")

    if (effectiveApiKeys.xai && isXAIModel) {
      console.log("[v0] Multi-chat using xAI API")

      try {
        const response = await callXAI(effectiveApiKeys.xai, selectedModel, systemPrompt, messages, req.signal)

        if (response.ok) {
          return createStreamResponse(response)
        }

        const errorText = await response.text()
        console.error("[v0] Multi-chat xAI API error:", response.status, errorText)
      } catch (error) {
        console.error("[v0] Multi-chat xAI API call failed:", error)
      }
    }

    if (effectiveApiKeys.openRouter) {
      console.log("[v0] Multi-chat using OpenRouter API")

      try {
        const openRouterModel = "cognitivecomputations/dolphin-mistral-24b-venice-edition:free"

        const response = await callOpenRouter(
          effectiveApiKeys.openRouter,
          openRouterModel,
          systemPrompt,
          messages,
          req.signal,
        )

        if (response.ok) {
          return createStreamResponse(response)
        }

        const error = await response.json()
        return Response.json({ error: error.error?.message || "OpenRouter API error" }, { status: response.status })
      } catch (error) {
        console.error("[v0] Multi-chat OpenRouter API call failed:", error)
      }
    }

    return Response.json({ error: "No valid API configuration available" }, { status: 400 })
  } catch (error) {
    console.error("[v0] Multi-chat API error:", error)
    return Response.json({ error: error instanceof Error ? error.message : "Failed to process" }, { status: 500 })
  }
}
