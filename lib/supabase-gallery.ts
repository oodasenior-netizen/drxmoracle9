import { createClient as createBrowserClient } from "@/lib/supabase/client"
import { auth } from "./firebase"

export interface GalleryItem {
  id: string
  character_id: string
  embed_code: string
  media_type: "embed" | "video" | "image"
  created_at: string
  updated_at: string
  user_id: string
}

export interface GalleryError {
  message: string
  code: string
  details?: string
}

async function getFirebaseUserId(): Promise<string | null> {
  if (!auth) {
    console.error("[v0] Firebase not configured - check firebase.ts initialization")
    return null
  }

  // Wait for Firebase to initialize with a timeout
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.warn("[v0] Firebase auth initialization timeout - proceeding without user")
      resolve(null)
    }, 5000) // 5 second timeout

    if (auth.currentUser) {
      clearTimeout(timeout)
      resolve(auth.currentUser.uid)
    } else {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        clearTimeout(timeout)
        unsubscribe()
        
        if (user) {
          console.log("[v0] Firebase user authenticated:", user.uid)
          resolve(user.uid)
        } else {
          console.warn("[v0] No Firebase user authenticated - user must be logged in to access gallery")
          resolve(null)
        }
      })
    }
  })
}

// Client-side functions for gallery management
export async function addGalleryItem(
  characterId: string,
  embedCode: string,
  mediaType: "embed" | "video" | "image",
): Promise<GalleryItem | null> {
  try {
    const supabase = createBrowserClient()
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("[v0] Supabase environment variables not configured")
      return null
    }

    const userId = await getFirebaseUserId()
    if (!userId) {
      console.error("[v0] Cannot add gallery item - user not authenticated")
      return null
    }

    const { data, error } = await supabase
      .from("character_gallery")
      .insert({
        character_id: characterId,
        embed_code: embedCode,
        media_type: mediaType,
        user_id: userId,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error adding gallery item:", error.message, error.details)
      return null
    }

    console.log("[v0] Gallery item added successfully:", data.id)
    return data
  } catch (error) {
    console.error("[v0] Exception while adding gallery item:", error)
    return null
  }
}

export async function getGalleryItems(characterId: string): Promise<GalleryItem[]> {
  try {
    const supabase = createBrowserClient()
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("[v0] Supabase environment variables not configured")
      return []
    }

    const userId = await getFirebaseUserId()
    if (!userId) {
      console.warn("[v0] Cannot fetch gallery - user not authenticated")
      return []
    }

    console.log("[v0] Fetching gallery for character:", characterId, "user:", userId)

    const { data, error } = await supabase
      .from("character_gallery")
      .select("*")
      .eq("character_id", characterId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching gallery items:", error.message, error.details)
      return []
    }

    console.log("[v0] Successfully loaded gallery items:", data?.length || 0)
    return data || []
  } catch (error) {
    console.error("[v0] Exception while fetching gallery items:", error)
    return []
  }
}

export async function deleteGalleryItem(itemId: string): Promise<boolean> {
  try {
    const supabase = createBrowserClient()
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("[v0] Supabase environment variables not configured")
      return false
    }

    const userId = await getFirebaseUserId()
    if (!userId) {
      console.error("[v0] Cannot delete gallery item - user not authenticated")
      return false
    }

    const { error } = await supabase.from("character_gallery").delete().eq("id", itemId).eq("user_id", userId)

    if (error) {
      console.error("[v0] Error deleting gallery item:", error.message, error.details)
      return false
    }

    console.log("[v0] Gallery item deleted successfully:", itemId)
    return true
  } catch (error) {
    console.error("[v0] Exception while deleting gallery item:", error)
    return false
  }
}

export async function bulkAddGalleryItems(
  characterId: string,
  items: Array<{ embedCode: string; mediaType: "embed" | "video" | "image" }>,
): Promise<GalleryItem[]> {
  try {
    const supabase = createBrowserClient()
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("[v0] Supabase environment variables not configured")
      return []
    }

    const userId = await getFirebaseUserId()
    if (!userId) {
      console.error("[v0] Cannot bulk add items - user not authenticated")
      return []
    }

    if (items.length === 0) {
      console.warn("[v0] No items to add")
      return []
    }

    console.log("[v0] Bulk adding gallery items:", items.length, "for character:", characterId)

    const insertData = items.map((item) => ({
      character_id: characterId,
      embed_code: item.embedCode,
      media_type: item.mediaType,
      user_id: userId,
    }))

    const { data, error } = await supabase.from("character_gallery").insert(insertData).select()

    if (error) {
      console.error("[v0] Error bulk adding gallery items:", error.message, error.details)
      return []
    }

    console.log("[v0] Successfully added", data?.length || 0, "gallery items")
    return data || []
  } catch (error) {
    console.error("[v0] Exception while bulk adding gallery items:", error)
    return []
  }
}
