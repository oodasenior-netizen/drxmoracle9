import { NextResponse } from "next/server"

const HF_TOKEN = process.env.HF_TOKEN || ""
const SD35_MODEL = "stabilityai/stable-diffusion-3.5-large"
const SD35_TURBO_MODEL = "stabilityai/stable-diffusion-3.5-large-turbo"

interface GenerateOptions {
  prompt: string
  nsfw_allowed?: boolean
  resolution?: string
  num_inference_steps?: number
  negative_prompt?: string
  guidance_scale?: number
  model?: "standard" | "turbo"
}

async function generateImageWithHF(options: GenerateOptions): Promise<string> {
  const {
    prompt,
    nsfw_allowed = true,
    resolution = "1024x1024",
    num_inference_steps = 28,
    negative_prompt = "",
    guidance_scale = 7.0,
    model = "turbo",
  } = options

  const [width, height] = resolution.split("x").map(Number)
  const selectedModel = model === "turbo" ? SD35_TURBO_MODEL : SD35_MODEL

  console.log("[v0] Generating with Stable Diffusion 3.5:", {
    model: selectedModel,
    resolution,
    steps: num_inference_steps,
  })

  try {
    const response = await fetch(`https://api.huggingface.co/models/${selectedModel}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          negative_prompt: negative_prompt || "blurry, low quality, distorted, deformed",
          num_inference_steps: num_inference_steps,
          guidance_scale: guidance_scale,
          width: width,
          height: height,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("[v0] HF API Error:", error)

      // Handle rate limiting
      if (response.status === 429) {
        throw new Error("RATE_LIMIT")
      }

      // Handle model loading
      if (response.status === 503) {
        throw new Error("MODEL_LOADING")
      }

      throw new Error(`HF API error: ${response.status}`)
    }

    // Get the image blob
    const imageBlob = await response.blob()

    // Convert to base64
    const buffer = await imageBlob.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")
    const dataUrl = `data:${imageBlob.type};base64,${base64}`

    console.log("[v0] Successfully generated image with SD3.5")
    return dataUrl
  } catch (error) {
    console.error("[v0] SD3.5 generation failed:", error)
    throw error
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      prompt,
      count = 1,
      nsfw_allowed = true,
      resolution = "1024x1024",
      num_inference_steps = 28,
      negative_prompt = "",
      guidance_scale = 7.0,
      model = "turbo",
    } = body

    console.log("[v0] SD3.5 generation request:", { prompt, count, model })

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const images: string[] = []
    const errors: string[] = []

    // Generate images in parallel with retry logic
    const promises = Array(count)
      .fill(0)
      .map(async (_, i) => {
        let retries = 0
        const maxRetries = 3

        while (retries < maxRetries) {
          try {
            // Add variety by adjusting guidance scale slightly for each image
            const variedGuidance = guidance_scale + (i * 0.5 - count / 4)

            const image = await generateImageWithHF({
              prompt,
              nsfw_allowed,
              resolution,
              num_inference_steps,
              negative_prompt,
              guidance_scale: variedGuidance,
              model,
            })

            return { success: true, image, error: null }
          } catch (error: any) {
            if (error.message === "RATE_LIMIT") {
              console.log(`[v0] Rate limited, retry ${retries + 1}/${maxRetries}`)
              await new Promise((resolve) => setTimeout(resolve, (retries + 1) * 2000))
              retries++
            } else if (error.message === "MODEL_LOADING") {
              console.log(`[v0] Model loading, retry ${retries + 1}/${maxRetries}`)
              await new Promise((resolve) => setTimeout(resolve, 5000))
              retries++
            } else {
              return { success: false, image: null, error: error.message }
            }
          }
        }

        return { success: false, image: null, error: "Max retries exceeded" }
      })

    const results = await Promise.all(promises)

    // Collect successful images and errors
    results.forEach((result) => {
      if (result.success && result.image) {
        images.push(result.image)
      } else if (result.error) {
        errors.push(result.error)
      }
    })

    console.log("[v0] Generated", images.length, "images with", errors.length, "errors")

    // If no images were generated, return error
    if (images.length === 0) {
      if (errors.some((e) => e.includes("RATE_LIMIT") || e.includes("Max retries"))) {
        return NextResponse.json(
          {
            error:
              "Free tier limit reached. Please try again in a few moments or add your own Hugging Face API key in Settings.",
            code: "RATE_LIMIT",
          },
          { status: 429 },
        )
      }

      return NextResponse.json(
        { error: "Failed to generate images. Please try again.", details: errors },
        { status: 500 },
      )
    }

    return NextResponse.json({
      images,
      warnings: errors.length > 0 ? `Generated ${images.length}/${count} images successfully` : null,
    })
  } catch (error: any) {
    console.error("[v0] SD3.5 generation error:", error)
    return NextResponse.json({ error: "Failed to generate images", details: error.message }, { status: 500 })
  }
}
