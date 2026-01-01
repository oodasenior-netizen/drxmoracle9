export const maxDuration = 30

async function fetchWithRetry(url: string, options: RequestInit, retries = 3, backoff = 1000): Promise<Response> {
  try {
    const response = await fetch(url, options)

    // If rate limited, try with backoff
    if (response.status === 429 && retries > 0) {
      console.log(`[v0] LoreyAI rate limited, retrying in ${backoff}ms (${retries} retries left)`)
      await new Promise((resolve) => setTimeout(resolve, backoff))
      return fetchWithRetry(url, options, retries - 1, backoff * 2)
    }

    return response
  } catch (error) {
    if (retries > 0) {
      console.log(`[v0] LoreyAI request failed, retrying in ${backoff}ms (${retries} retries left)`)
      await new Promise((resolve) => setTimeout(resolve, backoff))
      return fetchWithRetry(url, options, retries - 1, backoff * 2)
    }
    throw error
  }
}

const GROQ_API_KEY = process.env.GROQ_API_KEY || ""
const GROQ_MODEL = "llama-3.3-70b-versatile"

export async function POST(req: Request) {
  try {
    const {
      messages,
      apiKey,
      groqKey,
      systemPrompt,
    }: {
      messages: Array<{ role: string; content: string; timestamp?: number }>
      apiKey: string
      groqKey?: string
      systemPrompt?: string
    } = await req.json()

    const cleanMessages = messages.map(({ role, content }) => ({ role, content }))
    const allMessages = systemPrompt ? [{ role: "system", content: systemPrompt }, ...cleanMessages] : cleanMessages

    const useGroqKey = GROQ_API_KEY || groqKey

    if (useGroqKey) {
      try {
        console.log(`[v0] LoreyAI using Groq ${GROQ_MODEL} for lore curation`)

        const response = await fetchWithRetry(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${useGroqKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: GROQ_MODEL,
              messages: allMessages,
              temperature: 0.9,
              max_tokens: 4000,
              stream: true,
            }),
          },
          2,
          1000,
        )

        if (response.ok) {
          console.log(`[v0] LoreyAI success with Groq ${GROQ_MODEL}`)

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
                          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
                        }
                      } catch (e) {
                        // Skip invalid JSON
                      }
                    }
                  }
                }
              } catch (error) {
                console.error("[v0] LoreyAI stream error:", error)
              } finally {
                controller.close()
              }
            },
          })

          return new Response(stream, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              Connection: "keep-alive",
            },
          })
        }

        console.log(`[v0] LoreyAI Groq failed with status ${response.status}, falling back to OpenRouter`)
      } catch (error) {
        console.error(`[v0] LoreyAI Groq error:`, error)
      }
    }

    if (!apiKey) {
      return Response.json(
        { error: "LoreyAI requires Groq API key for optimal lore curation. OpenRouter key can be used as fallback." },
        { status: 400 },
      )
    }

    console.log(`[v0] LoreyAI falling back to OpenRouter`)

    const response = await fetchWithRetry(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://v0.dev",
          "X-Title": "BlackOracle Engine - LoreyAI Lore Curation",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-exp:free",
          messages: allMessages,
          temperature: 0.9,
          max_tokens: 4000,
          stream: true,
        }),
      },
      2,
      1000,
    )

    if (response.ok) {
      console.log(`[v0] LoreyAI success with OpenRouter fallback`)

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
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
                    }
                  } catch (e) {
                    // Skip invalid JSON
                  }
                }
              }
            }
          } catch (error) {
            console.error("[v0] LoreyAI stream error:", error)
          } finally {
            controller.close()
          }
        },
      })

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    }

    const errorData = await response.json()
    return Response.json(
      {
        error: `LoreyAI failed: ${errorData.error?.message || response.statusText}`,
      },
      { status: 503 },
    )
  } catch (error) {
    console.error("[v0] LoreyAI API error:", error)
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to process lore request" },
      { status: 500 },
    )
  }
}
