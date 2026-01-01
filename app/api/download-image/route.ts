import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const { url, filename } = await request.json()

    if (!url || !filename) {
      return NextResponse.json({ error: "Missing url or filename" }, { status: 400 })
    }

    console.log("[v0] Downloading image from:", url)

    // Fetch the image with proper headers
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    if (!response.ok) {
      console.error("[v0] Failed to fetch image, status:", response.status)
      return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 })
    }

    const contentType = response.headers.get("content-type") || "image/jpeg"
    console.log("[v0] Image content type:", contentType)

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Create EyeDownloads directory if it doesn't exist
    const downloadDir = path.join(process.cwd(), "public", "EyeDownloads")
    await mkdir(downloadDir, { recursive: true })

    // Save the file to server
    const filePath = path.join(downloadDir, filename)
    await writeFile(filePath, buffer)
    console.log("[v0] Image saved to:", filePath)

    // Return the actual image blob for download
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("[v0] Error downloading image:", error)
    return NextResponse.json({ error: "Failed to save image" }, { status: 500 })
  }
}
