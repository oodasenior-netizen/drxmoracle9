"use client"

import { useState, useEffect, useRef, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip as CustomTooltip, TooltipContent as CustomTooltipContent, TooltipTrigger as CustomTooltipTrigger } from "@/components/ui/tooltip"
import {
  Send,
  Settings,
  Edit2,
  MoreVertical,
  Sparkles,
  Hand,
  Trash,
  GitBranch,
  BookOpen,
  Users,
  ArrowLeft,
  ArrowRight,
  MessageSquare,
  Copy,
  Volume2,
  Mic,
  MicOff,
  Zap,
  Heart,
  Shield,
  Sword,
  Eye,
} from "lucide-react"
import {
  getMultiCharSession,
  saveMultiCharSession,
  getCharacters,
  getUserPersona,
  generateId,
  deleteMultiCharSession,
  getSettings,
  type MultiCharSession,
  type Character,
  type Message,
  type FocusSession,
  type MultiCharNode,
  type AppSettings,
  getLorebooks,
  getLorebook, // Added import for getLorebook
} from "@/lib/storage"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ModelSelectorDialog } from "@/components/model-selector-dialog"
import { OracleViewer } from "@/components/oracle-viewer"
import { StyledText } from "@/lib/onomatopoeia-styler"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"

export default function PartyOracleSessionPage({ params: paramsProp }: { params: Promise<{ sessionId: string }> }) {
  const params = use(paramsProp)
  const router = useRouter()
  const { sessionId } = params

  const [session, setSession] = useState<MultiCharSession | null>(null)
  const [characters, setCharacters] = useState<Character[]>([])
  const [persona, setPersona] = useState(getUserPersona())
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false) // Renamed from isLoading
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [showCharacterPanel, setShowCharacterPanel] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showRelationships, setShowRelationships] = useState(false)
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [narratorEnabled, setNarratorEnabled] = useState(false)
  const [interjecting, setInterjecting] = useState(false)

  const [inFocusMode, setInFocusMode] = useState(false)
  const [focusCharacters, setFocusCharacters] = useState<string[]>([])
  const [showFocusDialog, setShowFocusDialog] = useState(false)

  const [showNodeDialog, setShowNodeDialog] = useState(false)
  const [newNodeTitle, setNewNodeTitle] = useState("")
  const [showScenarioDialog, setShowScenarioDialog] = useState(false)
  const [scenarioText, setScenarioText] = useState("")

  const [showOracleViewer, setShowOracleViewer] = useState(false)
  const [viewerMedia, setViewerMedia] = useState<{ url: string; type: "image" | "video" | "embed" } | null>(null)

  // New states for dialogs
  const [showNodeManager, setShowNodeManager] = useState(false)
  const [showLorebookManager, setShowLorebookManager] = useState(false)
  const [showRelationshipManager, setShowRelationshipManager] = useState(false)

  const [settings, setSettings] = useState<AppSettings | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    console.log("[v0] Loading PartyOracle session:", sessionId)
    const loadedSession = getMultiCharSession(sessionId)

    if (!loadedSession) {
      console.error("[v0] Session not found:", sessionId)
      console.log("[v0] Available sessions:", getMultiCharSessions().map(s => s.id))
      toast.error("Session not found. Please create a new session.")
      router.push("/embark-modes")
      return
    }

    // Validate session structure
    if (!loadedSession.nodes || loadedSession.nodes.length === 0) {
      console.error("[v0] Invalid session structure - no nodes found")
      toast.error("Invalid session structure. Please create a new session.")
      router.push("/embark-modes")
      return
    }

    if (!loadedSession.currentNodeId) {
      console.warn("[v0] No currentNodeId set, using first node")
      loadedSession.currentNodeId = loadedSession.nodes[0].id
      saveMultiCharSession(loadedSession)
    }

    console.log("[v0] Session loaded:", loadedSession)
    setSession(loadedSession)
    setNarratorEnabled(loadedSession.narratorEnabled || false)

    if (loadedSession.focusMode && !loadedSession.focusMode.endedAt) {
      setInFocusMode(true)
      setFocusCharacters(loadedSession.focusMode.participantIds)
    }

    const loadedCharacters = getCharacters().filter((c) => loadedSession.characterIds.includes(c.id))
    console.log("[v0] Characters loaded:", loadedCharacters.length)
    setCharacters(loadedCharacters)

    // Load settings
    setSettings(getSettings())

    setTimeout(() => inputRef.current?.focus(), 100)
  }, [sessionId, router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [session?.nodes, inFocusMode]) // Re-scroll when focus mode changes as messages are different

  const getCurrentNode = () => {
    if (!session) return null
    // Fallback to first node if currentNodeId is invalid or not set
    return session.nodes.find((n) => n.id === session.currentNodeId) || session.nodes[0]
  }

  const getDisplayMessages = () => {
    const currentNode = getCurrentNode()
    if (inFocusMode && session?.focusMode) {
      return session.focusMode.messages
    }
    return currentNode?.messages || []
  }

  const saveSessionState = (updatedSession: MultiCharSession) => {
    setSession(updatedSession)
    saveMultiCharSession(updatedSession)
  }

  const sendMessage = async () => {
    const currentMessages = getDisplayMessages()
    if (!message.trim() || !session || isSending) return

    console.log("[v0] Send button clicked")
    console.log("[v0] Message:", message)
    console.log("[v0] Session:", session ? "exists" : "null")

    const canSend = Boolean(message.trim() && session)
    console.log("[v0] Can send:", canSend, {
      hasMessage: Boolean(message.trim()),
      hasSession: Boolean(session),
    })

    if (!canSend) {
      console.error("[v0] Cannot send: Missing requirements")
      return
    }

    setIsSending(true)

    const userMessage: Message = {
      id: `msg_${Date.now()}_${Math.random()}`,
      role: "user",
      content: message,
      timestamp: Date.now(),
      characterId: "user",
      characterName: "You",
      characterAvatar: "/placeholder.svg?height=40&width=40",
    }

    let updatedMessages: Message[] = []
    const updatedSession = { ...session }

    if (inFocusMode && updatedSession.focusMode) {
      updatedSession.focusMode.messages = [...updatedSession.focusMode.messages, userMessage]
      updatedMessages = updatedSession.focusMode.messages
    } else {
      const currentNode = getCurrentNode()
      if (!currentNode) {
        console.error("[v0] No current node to add message to")
        setIsSending(false)
        return
      }
      const nodeIndex = updatedSession.nodes.findIndex((n) => n.id === currentNode.id)
      if (nodeIndex === -1) {
        console.error("[v0] Current node not found in session nodes")
        setIsSending(false)
        return
      }
      updatedSession.nodes[nodeIndex].messages = [...currentNode.messages, userMessage]
      updatedSession.nodes[nodeIndex].updatedAt = Date.now()
      updatedMessages = updatedSession.nodes[nodeIndex].messages
    }

    saveSessionState({ ...updatedSession, updatedAt: Date.now() })
    setMessage("")

    try {
      // Generate 1-3 AI responses based on conversation flow
      const maxResponses = Math.floor(Math.random() * 3) + 1
      let responsesGenerated = 0

      for (let i = 0; i < maxResponses; i++) {
        const currentTurnMessages = updatedMessages.slice(-10) // Use recent messages for context
        const turnOrder = calculateTurnOrder(
          characters,
          currentTurnMessages,
          currentTurnMessages[currentTurnMessages.length - 1],
        )
        const nextSpeaker = turnOrder[0]

        if (!nextSpeaker) {
          console.log("[v0] No next speaker found, stopping generation.")
          break
        }

        const globalPrompt = settings?.globalSystemPrompt || ""
        const characterContext = characters.find((c) => c.id === nextSpeaker.id)

        // Get lorebook context if attached
        let lorebookContext = ""
        if (session.attachedLorebookIds && session.attachedLorebookIds.length > 0) {
          const lorebooks = session.attachedLorebookIds
            .map((id) => {
              const lorebook = getLorebook(id)
              if (lorebook) {
                return `\n\n[LOREBOOK: ${lorebook.name}]\n${lorebook.description}\nEntries: ${lorebook.entries.join(", ")}`
              }
              return ""
            })
            .join("")
          lorebookContext = lorebooks
        }

        const enhancedSystemPrompt = `You are ${nextSpeaker.name}, participating in a multi-character roleplay session.

${globalPrompt ? `GLOBAL INSTRUCTIONS:\n${globalPrompt}\n\n` : ""}CHARACTER DETAILS:
Name: ${characterContext?.name}
Personality: ${characterContext?.personality || "Not specified"}
Description: ${characterContext?.description || "Not specified"}
Scenario Context: ${characterContext?.scenario || session.situation || "General roleplay"}
${lorebookContext}

RELATIONSHIP CONTEXT:
${characters
  .filter((c) => c.id !== nextSpeaker.id)
  .map((c) => {
    const rel = getRelationship(nextSpeaker.id, c.id)
    return `- ${c.name}: ${rel || "Undefined relationship"}`
  })
  .join("\n")}

ROLEPLAY GUIDELINES:
- Stay in character at all times and respond naturally to the conversation
- Remember previous interactions and maintain emotional continuity
- React dynamically to what other characters say and do
- Use descriptive language and show emotions through actions and dialogue
- Keep responses concise (2-4 paragraphs) to maintain conversation flow
- Do not speak for other characters or the user
${settings?.temperature ? `- Response creativity level: ${settings.temperature}` : ""}

Recent conversation context is provided in your message history. Respond appropriately to the current situation.`

        // Add placeholder for the AI message before it's generated
        const assistantMessage: Message = {
          id: `msg_${Date.now()}_${Math.random()}`,
          role: "assistant",
          content: "...",
          timestamp: Date.now(),
          characterId: nextSpeaker.id,
          characterName: nextSpeaker.name,
          characterAvatar: nextSpeaker.avatarUrl || nextSpeaker.avatar || "/placeholder.svg",
        }

        if (inFocusMode && updatedSession.focusMode) {
          updatedSession.focusMode.messages = [...updatedMessages, assistantMessage]
        } else {
          const currentNode = getCurrentNode()
          if (currentNode) {
            const nodeIndex = updatedSession.nodes.findIndex((n) => n.id === currentNode.id)
            if (nodeIndex !== -1) {
              updatedSession.nodes[nodeIndex].messages = [...updatedMessages, assistantMessage]
            }
          }
        }
        saveSessionState({ ...updatedSession, updatedAt: Date.now() })
        updatedMessages.push(assistantMessage) // Add placeholder to the messages being tracked in this loop

        const response = await fetch("/api/multi-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: currentTurnMessages, // Pass only recent messages as history
            characters,
            nextSpeakerId: nextSpeaker.id,
            systemPrompt: enhancedSystemPrompt,
            model: session.modelId || settings?.defaultModel,
            temperature: settings?.temperature,
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("[v0] Multi-chat API error:", errorText)
          toast.error(`API error: ${response.status} - ${errorText}`)
          // Remove placeholder message if API fails
          if (inFocusMode && updatedSession.focusMode) {
            updatedSession.focusMode.messages.pop()
          } else {
            const currentNode = getCurrentNode()
            if (currentNode) {
              const nodeIndex = updatedSession.nodes.findIndex((n) => n.id === currentNode.id)
              if (nodeIndex !== -1) {
                updatedSession.nodes[nodeIndex].messages.pop()
              }
            }
          }
          saveSessionState({ ...updatedSession, updatedAt: Date.now() })
          break // Stop generating further responses on error
        }

        const reader = response.body?.getReader()
        if (!reader) throw new Error("No response stream")

        const decoder = new TextDecoder()
        let accumulatedContent = ""
        let fullContent = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n").filter((line) => line.trim())

          for (const line of lines) {
            if (line.startsWith("0:")) {
              const contentPart = JSON.parse(line.slice(2))
              accumulatedContent += contentPart
              fullContent += contentPart // Keep track of full content for final save

              // Update the placeholder message with streamed content
              if (inFocusMode && updatedSession.focusMode) {
                const msgIndex = updatedSession.focusMode.messages.findIndex((m) => m.id === assistantMessage.id)
                if (msgIndex !== -1) {
                  updatedSession.focusMode.messages[msgIndex].content = accumulatedContent
                }
              } else {
                const currentNode = getCurrentNode()
                if (currentNode) {
                  const nodeIndex = updatedSession.nodes.findIndex((n) => n.id === currentNode.id)
                  if (nodeIndex !== -1) {
                    const msgIndex = updatedSession.nodes[nodeIndex].messages.findIndex(
                      (m) => m.id === assistantMessage.id,
                    )
                    if (msgIndex !== -1) {
                      updatedSession.nodes[nodeIndex].messages[msgIndex].content = accumulatedContent
                    }
                  }
                }
              }
              saveSessionState({ ...updatedSession, updatedAt: Date.now() })
            } else if (line.startsWith("1:")) {
              // Handle other metadata if needed, e.g., reasoning
              try {
                const metadata = JSON.parse(line.slice(2))
                if (metadata.reasoning) {
                  assistantMessage.turnReasoning = metadata.reasoning
                }
              } catch (e) {
                console.error("Failed to parse metadata line:", line, e)
              }
            }
          }
        }

        // Update the final content and add reasoning if available
        if (inFocusMode && updatedSession.focusMode) {
          const msgIndex = updatedSession.focusMode.messages.findIndex((m) => m.id === assistantMessage.id)
          if (msgIndex !== -1) {
            updatedSession.focusMode.messages[msgIndex].content = fullContent
          }
        } else {
          const currentNode = getCurrentNode()
          if (currentNode) {
            const nodeIndex = updatedSession.nodes.findIndex((n) => n.id === currentNode.id)
            if (nodeIndex !== -1) {
              const msgIndex = updatedSession.nodes[nodeIndex].messages.findIndex((m) => m.id === assistantMessage.id)
              if (msgIndex !== -1) {
                updatedSession.nodes[nodeIndex].messages[msgIndex].content = fullContent
              }
            }
          }
        }

        updatedMessages[updatedMessages.findIndex((m) => m.id === assistantMessage.id)] = {
          ...assistantMessage,
          content: fullContent,
          timestamp: Date.now(), // Update timestamp to reflect final message time
        }

        responsesGenerated++

        // Decide if we should continue with another response using advanced conversation analysis
        const shouldContinue = analyzeConversationFlow(
          fullContent,
          characters,
          nextSpeaker,
          i,
          maxResponses,
          updatedMessages
        )

        if (!shouldContinue) {
          break
        }

        // Dynamic delay based on message length and conversation intensity
        const delayMs = calculateResponseDelay(fullContent, i)
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }

      console.log("[v0] Generated", responsesGenerated, "AI response(s)")

      saveSessionState({ ...updatedSession, updatedAt: Date.now() })
    } catch (error) {
      console.error("[v0] Error sending message:", error)
      toast.error(`Failed to send message: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsSending(false)
      setTimeout(() => inputRef.current?.focus(), 100) // Refocus input after sending
    }
  }

  const generateSingleResponse = async (
    character: Character,
    messages: Message[],
    currentNode: MultiCharNode,
  ): Promise<Message | null> => {
    // This function is largely superseded by the new sendMessage logic, but kept for potential future use.
    // The core generation logic is now within the sendMessage loop.
    console.warn("[v0] generateSingleResponse is deprecated, use sendMessage logic instead.")
    return null
  }

  const calculateTurnOrder = (chars: Character[], msgs: Message[], lastMessage: Message): Character[] => {
    if (chars.length === 0) return []

    const weights = chars.map((char) => {
      let weight = 100

      // 1. Recent speaking history - avoid repetition
      const recentMessages = msgs.slice(-8) // Look at more history
      const lastSpeakIndex = recentMessages.findIndex((m) => m.characterId === char.id)
      if (lastSpeakIndex !== -1) {
        // Heavier penalty for very recent speakers
        weight -= (8 - lastSpeakIndex) * 20
        // If spoke in last 2 messages, heavily penalize
        if (lastSpeakIndex >= 6) {
          weight -= 100
        }
      }

      // 2. Character mentions - prioritize mentioned characters
      if (lastMessage && lastMessage.content.toLowerCase().includes(char.name.toLowerCase())) {
        // Count how many times they're mentioned
        const mentionCount = (lastMessage.content.match(new RegExp(char.name.toLowerCase(), "g")) || []).length
        weight += 30 + (mentionCount * 15)
      }

      // 3. Relationship-based priority
      // Characters with stronger relationships to recent speakers get priority
      if (lastMessage && lastMessage.characterId && lastMessage.characterId !== "user") {
        const relationship = getRelationship(lastMessage.characterId, char.id)
        if (relationship) {
          // Add weight based on relationship strength
          const relationshipScore = (
            (relationship.affection || 0) * 0.5 + 
            (relationship.trust || 0) * 0.3 + 
            (relationship.attraction || 0) * 0.2
          ) / 100
          weight += relationshipScore * 50
        }
      }

      // 4. Personality-based participation
      // More extroverted characters speak more frequently
      const personalityScore = analyzePersonalityForParticipation(char.personality)
      weight += personalityScore * 20

      // 5. Contextual relevance
      // Characters whose tags match conversation topics get priority
      const contextScore = analyzeContextualRelevance(char, lastMessage)
      weight += contextScore * 25

      // 6. Random factor for natural variation
      weight += Math.random() * 15

      return { char, weight }
    })

    // Sort by weight and return character order
    return weights.sort((a, b) => b.weight - a.weight).map((w) => w.char)
  }

  const getRelationship = (fromCharId: string, toCharId: string): CharacterRelationship | undefined => {
    if (!session) return undefined
    return session.relationships.find(r => 
      (r.fromCharacterId === fromCharId && r.toCharacterId === toCharId) ||
      (r.fromCharacterId === toCharId && r.toCharacterId === fromCharId)
    )
  }

  const analyzePersonalityForParticipation = (personality: string): number => {
    // Simple personality analysis for participation tendency
    const personalityLower = personality.toLowerCase()
    let score = 0.5 // Default neutral score
    
    if (personalityLower.includes("extrovert") || personalityLower.includes("outgoing") || 
        personalityLower.includes("talkative") || personalityLower.includes("social")) {
      score = 0.8
    } else if (personalityLower.includes("introvert") || personalityLower.includes("quiet") || 
               personalityLower.includes("reserved") || personalityLower.includes("shy")) {
      score = 0.3
    } else if (personalityLower.includes("bold") || personalityLower.includes("confident") || 
               personalityLower.includes("leader")) {
      score = 0.7
    }
    
    return score
  }

  const analyzeContextualRelevance = (character: Character, lastMessage: Message | undefined): number => {
    if (!lastMessage) return 0
    
    let score = 0
    const messageLower = lastMessage.content.toLowerCase()
    
    // Check if character's tags match conversation topics
    if (character.tags && character.tags.length > 0) {
      const relevantTags = character.tags.filter(tag => 
        messageLower.includes(tag.toLowerCase())
      )
      score += relevantTags.length * 0.1
    }
    
    // Check if character's expertise is relevant
    if (character.description && messageLower.includes("question") && 
        (character.description.includes("expert") || character.description.includes("skilled"))) {
      score += 0.2
    }
    
    return Math.min(score, 1.0) // Cap at 1.0
  }

  const analyzeConversationFlow = (
    messageContent: string,
    characters: Character[],
    currentSpeaker: Character,
    responseIndex: number,
    maxResponses: number,
    messageHistory: Message[]
  ): boolean => {
    const contentLower = messageContent.toLowerCase()
    
    // 1. Check for direct engagement indicators
    const hasQuestion = contentLower.includes("?") || 
                      contentLower.includes("what") || 
                      contentLower.includes("how") ||
                      contentLower.includes("why") ||
                      contentLower.includes("when") ||
                      contentLower.includes("where")
    
    const mentionsOtherCharacter = characters.some((c) => 
      c.id !== currentSpeaker.id && 
      (contentLower.includes(c.name.toLowerCase()) || 
       (c.description && contentLower.includes(c.description.toLowerCase().split(' ')[0])))
    )
    
    // 2. Analyze conversation intensity
    const conversationIntensity = calculateConversationIntensity(messageHistory)
    
    // 3. Check for natural conversation endings
    const hasClosingStatement = contentLower.includes("anyway") ||
                               contentLower.includes("enough about") ||
                               contentLower.includes("let's move on") ||
                               contentLower.includes("that's all") ||
                               contentLower.includes("i'm done")
    
    // 4. Personality-based conversation style
    const speakerPersonality = analyzePersonalityForParticipation(currentSpeaker.personality)
    const isTalkative = speakerPersonality > 0.6
    
    // 5. Decision logic
    let continueScore = 0
    
    // Strong reasons to continue
    if (hasQuestion) continueScore += 30
    if (mentionsOtherCharacter) continueScore += 25
    if (conversationIntensity > 0.7) continueScore += 20
    if (isTalkative) continueScore += 15
    
    // Reasons to stop
    if (hasClosingStatement) continueScore -= 50
    if (responseIndex >= maxResponses - 1) continueScore -= 100
    if (conversationIntensity < 0.3 && responseIndex > 0) continueScore -= 20
    
    // Random factor for natural variation
    continueScore += Math.random() * 15
    
    // Final decision
    const shouldContinue = continueScore > 25
    
    console.log(`[v0] Conversation flow analysis: ${shouldContinue ? 'CONTINUE' : 'STOP'}`)
    console.log(`[v0] Score: ${continueScore}, Question: ${hasQuestion}, Mentions: ${mentionsOtherCharacter}, Intensity: ${conversationIntensity.toFixed(2)}`)
    
    return shouldContinue
  }

  const calculateConversationIntensity = (messages: Message[]): number => {
    if (messages.length === 0) return 0.5
    
    // Analyze recent messages for intensity indicators
    const recentMessages = messages.slice(-3)
    let intensityScore = 0.5 // Default medium intensity
    
    recentMessages.forEach(msg => {
      const contentLower = msg.content.toLowerCase()
      
      // High intensity indicators
      if (contentLower.includes("!!!") || contentLower.includes("urgent") || 
          contentLower.includes("danger") || contentLower.includes("attack") ||
          contentLower.includes("hurry") || contentLower.includes("emergency")) {
        intensityScore += 0.2
      }
      
      // Medium intensity indicators  
      if (contentLower.includes("?") || contentLower.includes("!") ||
          contentLower.includes("important") || contentLower.includes("serious")) {
        intensityScore += 0.1
      }
      
      // Low intensity indicators
      if (contentLower.includes("relax") || contentLower.includes("calm") ||
          contentLower.includes("peaceful") || contentLower.includes("quiet")) {
        intensityScore -= 0.1
      }
    })
    
    return Math.min(Math.max(intensityScore, 0.1), 1.0) // Clamp between 0.1 and 1.0
  }

  const calculateResponseDelay = (messageContent: string, responseIndex: number): number => {
    // Base delay
    let delay = 800

    // Adjust based on message length
    const wordCount = messageContent.split(/\s+/).length
    if (wordCount > 50) {
      delay += 300 // Longer messages need more "thinking" time
    } else if (wordCount < 20) {
      delay -= 200 // Short responses can be quicker
    }

    // Adjust based on response position
    if (responseIndex === 0) {
      delay += 100 // First response can be slightly slower
    } else if (responseIndex > 1) {
      delay -= 150 // Subsequent responses can be quicker
    }

    // Add some randomness
    delay += Math.random() * 200

    return Math.max(500, delay) // Minimum 500ms delay
  }

  const getRelationshipContext = (character: Character, previousMessages: Message[]): { mood: string; description: string } | null => {
    if (!session || previousMessages.length === 0) return null

    // Find recent interactions with this character
    const recentInteractions = previousMessages.slice(-5).filter(msg =>
      msg.characterId === character.id || msg.content.toLowerCase().includes(character.name.toLowerCase())
    )

    if (recentInteractions.length === 0) return null

    // Analyze sentiment from recent messages
    const lastMessage = recentInteractions[recentInteractions.length - 1]
    const content = lastMessage.content.toLowerCase()

    // Simple sentiment analysis
    const positiveWords = ['happy', 'good', 'great', 'excellent', 'wonderful', 'amazing', 'love', 'like', 'friend', 'trust', 'respect']
    const negativeWords = ['angry', 'sad', 'bad', 'terrible', 'hate', 'dislike', 'enemy', 'distrust', 'betray', 'hurt']

    const positiveCount = positiveWords.filter(word => content.includes(word)).length
    const negativeCount = negativeWords.filter(word => content.includes(word)).length

    let mood = 'neutral'
    let description = 'Neutral interaction'

    if (positiveCount > negativeCount) {
      mood = 'positive'
      description = 'Positive interaction detected'
    } else if (negativeCount > positiveCount) {
      mood = 'negative'
      description = 'Tense interaction detected'
    }

    // Check relationship data
    const relationship = getRelationship(character.id, lastMessage.characterId || 'user')
    if (relationship) {
      const affection = relationship.affection || 0
      const trust = relationship.trust || 0

      if (affection > 50) {
        mood = 'warm'
        description = `Warm relationship (${affection}% affection)`
      } else if (affection < -20) {
        mood = 'hostile'
        description = `Hostile relationship (${affection}% affection)`
      } else if (trust > 70) {
        mood = 'trusting'
        description = `Trusting relationship (${trust}% trust)`
      }
    }

    return { mood, description }
  }

  const handleInterject = () => {
    if (isSending) {
      setInterjecting(true)
      setIsSending(false) // Stop AI generation
      setTimeout(() => {
        inputRef.current?.focus()
        setInterjecting(false)
      }, 100)
    }
  }

  const openCharacterPanel = (character: Character) => {
    setSelectedCharacter(character)
    setShowCharacterPanel(true)
  }

  const openCharacterGallery = (character: Character, itemIndex = 0) => {
    console.log("[v0] Opening character gallery:", character.name, "item:", itemIndex)

    if (character.gallery && character.gallery.length > itemIndex) {
      const item = character.gallery[itemIndex]

      // Handle both formats: url (test data) and embed_code (Supabase)
      const mediaUrl = (item as any).url || (item as any).embed_code || "/placeholder.svg"
      const mediaType = item.type || "image"

      console.log("[v0] Gallery item:", { mediaUrl, mediaType })

      setViewerMedia({
        url: mediaUrl,
        type: mediaType,
      })
      setShowOracleViewer(true)
    } else {
      console.error("[v0] Gallery item not found:", itemIndex)
    }
  }

  const updateRelationship = (id1: string, id2: string, value: string) => {
    if (!session) return
    const key = [id1, id2].sort().join("_")
    const updatedMap = { ...session.relationshipMap, [key]: value }
    const updatedSession = { ...session, relationshipMap: updatedMap, updatedAt: Date.now() }
    saveSessionState(updatedSession)
  }

  const updateModel = (modelId: string) => {
    if (!session) return
    const updatedSession = { ...session, modelId, updatedAt: Date.now() }
    saveSessionState(updatedSession)
    setSettings((prev) => (prev ? { ...prev, defaultModel: modelId } : prev)) // Update local settings state too
  }

  const toggleNarrator = () => {
    if (!session) return
    const newValue = !narratorEnabled
    setNarratorEnabled(newValue)
    const updatedSession = { ...session, narratorEnabled: newValue, updatedAt: Date.now() }
    saveSessionState(updatedSession)
  }

  const startFocusMode = () => {
    if (!session || focusCharacters.length === 0 || focusCharacters.length > 2) {
      alert("Please select 1-2 characters for Focus Mode")
      return
    }

    const focusSession: FocusSession = {
      id: generateId(),
      participantIds: focusCharacters,
      messages: [],
      startedAt: Date.now(),
    }

    const updatedSession = { ...session, focusMode: focusSession, updatedAt: Date.now() }
    saveSessionState(updatedSession)
    setInFocusMode(true)
    setShowFocusDialog(false)
  }

  const endFocusMode = async () => {
    if (!session || !session.focusMode || !inFocusMode) return

    setIsSending(true) // Use isSending for loading state
    try {
      const settings = getSettings()
      if (!settings.apiKeys.xai && !settings.apiKeys.openRouter) {
        alert("Please add your xAI or OpenRouter API key in Settings")
        setIsSending(false)
        return
      }

      // Generate narrator summary
      const focusContent = session.focusMode.messages.map((m) => `${m.characterName}: ${m.content}`).join("\n\n")

      const narratorPrompt = `You are a narrator reconnecting a story after an intimate scene. Summarize what transpired during this private moment between ${focusCharacters.map((id) => characters.find((c) => c.id === id)?.name).join(" and ")} and smoothly transition back to the main group adventure. Keep it tasteful and brief (2-3 sentences).

Focus Scene:
${focusContent}

Narrator Summary:`

      const response = await fetch("/api/multi-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: narratorPrompt }],
          model: session.modelId || settings.defaultModel || "xai/grok-4.1",
          apiKeys: settings.apiKeys,
          characterId: "narrator",
          character: { name: "Narrator", description: "Story narrator" },
          sessionContext: "You are a narrator helping transition the story.",
          temperature: 0.7, // Moderate creativity for summary
        }),
      })

      let narrationSummary = ""
      if (response.ok) {
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split("\n").filter((line) => line.trim())

            for (const line of lines) {
              if (line.startsWith("0:")) {
                narrationSummary += JSON.parse(line.slice(2))
              }
            }
          }
        }
      } else {
        const errorText = await response.text()
        throw new Error(`Narrator API error: ${response.status} - ${errorText}`)
      }

      // Add narrator message to main node if it exists, or create if not
      const currentNode = getCurrentNode()
      const updatedSession = { ...session }
      let updatedMessages: Message[] = []

      const narratorMessage: Message = {
        id: `msg_${Date.now()}_narrator`,
        role: "assistant",
        content: narrationSummary || "The intimate moment concluded.", // Fallback message
        timestamp: Date.now(),
        characterId: "narrator",
        characterName: "Narrator",
        characterAvatar: "/placeholder.svg",
      }

      if (currentNode) {
        const nodeIndex = updatedSession.nodes.findIndex((n) => n.id === currentNode.id)
        if (nodeIndex !== -1) {
          updatedSession.nodes[nodeIndex].messages = [...currentNode.messages, narratorMessage]
          updatedSession.nodes[nodeIndex].updatedAt = Date.now()
          updatedMessages = updatedSession.nodes[nodeIndex].messages
        }
      } else {
        // Should not happen if session is loaded, but as a safeguard
        console.error("[v0] Current node not found when ending focus mode.")
      }

      updatedSession.focusMode.endedAt = Date.now()
      updatedSession.focusMode.narrationSummary = narrationSummary

      saveSessionState({ ...updatedSession, updatedAt: Date.now() })
      setInFocusMode(false)
      setFocusCharacters([])
    } catch (error) {
      console.error("[v0] Error ending focus mode:", error)
      toast.error(error instanceof Error ? error.message : "Failed to end focus mode")
    } finally {
      setIsSending(false)
    }
  }

  const createNewNode = () => {
    if (!session || !newNodeTitle.trim()) {
      alert("Please enter a node title")
      return
    }

    const newNode: MultiCharNode = {
      id: generateId(),
      title: newNodeTitle,
      sessionId: session.id,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    const updatedSession = {
      ...session,
      nodes: [...session.nodes, newNode],
      currentNodeId: newNode.id,
      updatedAt: Date.now(),
    }

    saveSessionState(updatedSession)
    setNewNodeTitle("")
    setShowNodeDialog(false)
    setShowNodeManager(false) // Close node manager if open
  }

  const switchNode = (nodeId: string) => {
    if (!session) return

    const updatedSession = { ...session, currentNodeId: nodeId, updatedAt: Date.now() }
    saveSessionState(updatedSession)
  }

  const deleteNode = (nodeId: string) => {
    if (!session || session.nodes.length <= 1) {
      alert("Cannot delete the last node")
      return
    }

    const updatedNodes = session.nodes.filter((n) => n.id !== nodeId)
    let newCurrentId = session.currentNodeId

    if (session.currentNodeId === nodeId) {
      newCurrentId = updatedNodes[0].id
    }

    const updatedSession = {
      ...session,
      nodes: updatedNodes,
      currentNodeId: newCurrentId,
      updatedAt: Date.now(),
    }

    saveSessionState(updatedSession)
  }

  const updateScenario = () => {
    if (!session) return

    const updatedSession = { ...session, situation: scenarioText, updatedAt: Date.now() }
    saveSessionState(updatedSession)
    setShowScenarioDialog(false)
  }

  // const handleDeleteSession = () => { // Replaced by inline confirm in DropdownMenuItem
  //   if (!session) return

  //   if (confirm(`Are you sure you want to delete "${session.name}"? This cannot be undone.`)) {
  //     deleteMultiCharSession(session.id)
  //     router.push("/embark-modes")
  //   }
  // }

  const currentNode = getCurrentNode()
  const displayMessages = getDisplayMessages()

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2 p-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/embark-modes")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="flex-1 text-xl font-bold">{session?.title || session?.name || "PartyOracle Session"}</h1>

          {/* Character quick access with turn indicators */}
          <div className="flex items-center gap-2">
            {characters.map((char, index) => {
              const turnOrder = calculateTurnOrder(characters, displayMessages, displayMessages[displayMessages.length - 1] || null)
              const isNextSpeaker = turnOrder[0]?.id === char.id
              const isRecentSpeaker = displayMessages.slice(-3).some(msg => msg.characterId === char.id)

              return (
                <CustomTooltip key={char.id}>
                  <CustomTooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`relative h-10 w-10 rounded-full p-0 transition-all ${
                        isNextSpeaker ? "ring-2 ring-green-500 scale-110" :
                        isRecentSpeaker ? "ring-1 ring-blue-400" : ""
                      }`}
                      onClick={() => openCharacterPanel(char)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={char.avatarUrl || char.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{char.name[0]}</AvatarFallback>
                      </Avatar>
                      {isNextSpeaker && (
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
                          <Zap className="h-2 w-2 text-white" />
                        </div>
                      )}
                      {isRecentSpeaker && !isNextSpeaker && (
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-blue-400 border-2 border-background" />
                      )}
                    </Button>
                  </CustomTooltipTrigger>
                  <CustomTooltipContent>
                    <div className="text-center">
                      <p className="font-semibold">{char.name}</p>
                      {isNextSpeaker && <p className="text-xs text-green-600">Next to speak</p>}
                      {isRecentSpeaker && !isNextSpeaker && <p className="text-xs text-blue-600">Recently spoke</p>}
                    </div>
                  </CustomTooltipContent>
                </CustomTooltip>
              )
            })}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowNodeManager(true)}>
                <GitBranch className="mr-2 h-4 w-4" />
                Manage Nodes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowLorebookManager(true)}>
                <BookOpen className="mr-2 h-4 w-4" />
                Manage Lorebooks
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowRelationshipManager(true)}>
                <Users className="mr-2 h-4 w-4" />
                Edit Relationships
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowModelSelector(true)}>
                <Settings className="mr-2 h-4 w-4" />
                AI Model Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  if (confirm("Delete this session?")) {
                    deleteMultiCharSession(sessionId)
                    router.push("/embark-modes")
                  }
                }}
                className="text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Session
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Character Avatars Bar (removed as it's now in the sticky header) */}

      {/* Session Header with Status Indicators */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-4xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold">
                {session?.title || session?.name || "PartyOracle Session"}
              </h2>
              {inFocusMode && (
                <Badge variant="secondary" className="gap-1">
                  <Users className="h-3 w-3" />
                  Focus Mode
                </Badge>
              )}
              {narratorEnabled && (
                <Badge variant="secondary" className="gap-1">
                  <BookOpen className="h-3 w-3" />
                  Narrator
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1 text-xs">
                <Users className="h-3 w-3" />
                {characters.length} Characters
              </Badge>
              <Badge variant="outline" className="gap-1 text-xs">
                <MessageSquare className="h-3 w-3" />
                {displayMessages.length} Messages
              </Badge>
              {displayMessages.length > 0 && (
                <CustomTooltip>
                  <CustomTooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className={`gap-1 text-xs ${
                        calculateConversationIntensity(displayMessages) > 0.7 ? 'border-red-400 text-red-600' :
                        calculateConversationIntensity(displayMessages) > 0.4 ? 'border-yellow-400 text-yellow-600' :
                        'border-green-400 text-green-600'
                      }`}
                    >
                      <Zap className={`h-3 w-3 ${
                        calculateConversationIntensity(displayMessages) > 0.7 ? 'animate-pulse' : ''
                      }`} />
                      {calculateConversationIntensity(displayMessages) > 0.7 ? 'High' :
                       calculateConversationIntensity(displayMessages) > 0.4 ? 'Medium' : 'Low'} Intensity
                    </Badge>
                  </CustomTooltipTrigger>
                  <CustomTooltipContent>
                    <p className="text-sm">
                      Conversation intensity: {(calculateConversationIntensity(displayMessages) * 100).toFixed(0)}%
                    </p>
                  </CustomTooltipContent>
                </CustomTooltip>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(true)}
                className="h-8 w-8"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {/* Character Avatars */}
          <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
            {characters.map((char) => (
              <Tooltip key={char.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => openCharacterPanel(char)}
                    className={`relative flex-shrink-0 rounded-full border-2 p-0.5 transition-all ${
                      selectedCharacter?.id === char.id
                        ? "border-primary scale-110"
                        : "border-transparent hover:border-muted-foreground"
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={char.avatarUrl || char.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{char.name[0]}</AvatarFallback>
                    </Avatar>
                    {/* Turn indicator - shows who might speak next */}
                    {session?.turnOrder && session.turnOrder[0] === char.id && (
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{char.name}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-4xl space-y-4 p-4">
          {displayMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Sparkles className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">Begin Your Adventure</h3>
              <p className="text-muted-foreground">
                {inFocusMode
                  ? "Focus Mode active - intimate scene with selected characters"
                  : "Send a message to start the multi-character roleplay"}
              </p>
              {session?.situation && (
                <Card className="mt-4 max-w-md">
                  <CardContent className="p-4">
                    <h4 className="mb-2 font-semibold">Current Situation:</h4>
                    <p className="text-sm text-muted-foreground">{session.situation}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            displayMessages.map((msg, index) => {
              const isUser = msg.role === "user"
              const isNarrator = msg.characterId === "narrator"
              const char = characters.find((c) => c.id === msg.characterId)
              const messageBg = isUser ? "bg-primary/10 border-primary/20 shadow-sm" :
                               isNarrator ? "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800" :
                               "bg-background border-border shadow-sm"

              // Get relationship context for non-user messages
              const relationshipContext = !isUser && char ? getRelationshipContext(char, displayMessages.slice(0, index)) : null

              return (
                <div key={msg.id} className="group relative flex gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                  <button onClick={() => char && openCharacterPanel(char)} className="flex-shrink-0 mt-1">
                    <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
                      <AvatarImage src={msg.characterAvatar || "/placeholder.svg"} />
                      <AvatarFallback>{msg.characterName[0]}</AvatarFallback>
                    </Avatar>
                  </button>
                  <div className={`flex-1 rounded-lg border p-4 ${messageBg} transition-all hover:shadow-md`}>
                    <div className="mb-3 flex items-center gap-2">
                      <span className="font-semibold text-foreground">{msg.characterName}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {!isUser && msg.characterId !== "narrator" && (
                        <Badge variant="secondary" className="text-xs gap-1">
                          <Sparkles className="h-2 w-2" />
                          AI
                        </Badge>
                      )}
                      {isNarrator && (
                        <Badge variant="secondary" className="text-xs gap-1 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                          <BookOpen className="h-2 w-2" />
                          Narrator
                        </Badge>
                      )}
                      {relationshipContext && (
                        <CustomTooltip>
                          <CustomTooltipTrigger asChild>
                            <Badge variant="outline" className="text-xs cursor-pointer gap-1">
                              <Heart className="h-2 w-2" />
                              {relationshipContext.mood}
                            </Badge>
                          </CustomTooltipTrigger>
                          <CustomTooltipContent>
                            <p className="text-sm">{relationshipContext.description}</p>
                          </CustomTooltipContent>
                        </CustomTooltip>
                      )}
                      {msg.turnReasoning && (
                        <CustomTooltip>
                          <CustomTooltipTrigger asChild>
                            <Badge
                              variant="outline"
                              className="text-xs text-muted-foreground cursor-pointer gap-1"
                            >
                              <Eye className="h-2 w-2" />
                              Reasoning
                            </Badge>
                          </CustomTooltipTrigger>
                          <CustomTooltipContent className="max-w-xs">
                            <p className="text-sm">{msg.turnReasoning}</p>
                          </CustomTooltipContent>
                        </CustomTooltip>
                      )}
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <StyledText text={msg.content} />
                    </div>
                    {/* Message actions */}
                    <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 text-xs hover:bg-muted"
                        onClick={() => navigator.clipboard.writeText(msg.content)}
                      >
                        <Copy className="h-3 w-3" />
                        Copy
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 text-xs hover:bg-muted"
                        onClick={() => {
                          const speech = new SpeechSynthesisUtterance(msg.content)
                          speechSynthesis.speak(speech)
                        }}
                      >
                        <Volume2 className="h-3 w-3" />
                        Read
                      </Button>
                      {!isUser && char && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1 text-xs hover:bg-muted"
                          onClick={() => {
                            // Quick reply to this character
                            setMessage(`@${char.name} `)
                            inputRef.current?.focus()
                          }}
                        >
                          <MessageSquare className="h-3 w-3" />
                          Reply
                        </Button>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 mt-1">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => navigator.clipboard.writeText(msg.content)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Text
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          const speech = new SpeechSynthesisUtterance(msg.content)
                          speechSynthesis.speak(speech)
                        }}
                      >
                        <Volume2 className="mr-2 h-4 w-4" />
                        Read Aloud
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            })
          )}
          {isSending && (
            <div className="flex items-center gap-3 animate-in fade-in-0 slide-in-from-bottom-2">
              <div className="relative">
                <Avatar className="h-10 w-10 bg-gradient-to-br from-primary/20 to-primary/10 animate-pulse" />
                <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-spin" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Sparkles className="h-2 w-2 animate-spin" />
                    Generating
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full max-w-md bg-muted/60 animate-pulse rounded" />
                  <div className="h-3 w-4/5 max-w-lg bg-muted/60 animate-pulse rounded" />
                  <div className="h-3 w-3/5 max-w-sm bg-muted/60 animate-pulse rounded" />
                </div>
                <div className="text-xs text-muted-foreground">
                  Characters are thinking and responding...
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Interject Button */}
      {isSending && (
        <div className="fixed bottom-24 right-8 z-10">
          <Button
            onClick={handleInterject}
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg"
            variant="destructive"
          >
            <Hand className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Enhanced Input Area */}
      <div className="border-t bg-background/80 backdrop-blur-sm p-4">
        <div className="mx-auto max-w-4xl space-y-3">
          {/* Quick Actions */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Quick actions:</span>
            {characters.slice(0, 3).map((char) => (
              <Button
                key={char.id}
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs hover:bg-muted"
                onClick={() => {
                  setMessage(`@${char.name} `)
                  inputRef.current?.focus()
                }}
              >
                @{char.name}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs hover:bg-muted"
              onClick={() => setMessage("*narrates* ")}
            >
              Narrate
            </Button>
          </div>

          {/* Input Field */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  isSending
                    ? "AI characters are responding..."
                    : characters.length > 0
                      ? `Speak to ${characters.map(c => c.name).join(", ")}...`
                      : "Type your message..."
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                disabled={isSending}
                className="pr-12 min-h-[44px] resize-none"
              />
              {isSending && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>
            <Button
              onClick={sendMessage}
              disabled={isSending || !message.trim()}
              size="icon"
              className="h-11 w-11 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Status Bar */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Press Enter to send</span>
              {session && (
                <>
                  <span>•</span>
                  <span>{characters.length} characters active</span>
                  <span>•</span>
                  <span>{displayMessages.length} messages</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isSending && (
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="h-3 w-3 animate-spin" />
                  AI Thinking
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Character Panel Dialog */}
      {selectedCharacter && (
        <Dialog open={showCharacterPanel} onOpenChange={setShowCharacterPanel}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedCharacter.avatarUrl || selectedCharacter.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{selectedCharacter.name[0]}</AvatarFallback>
                </Avatar>
                {selectedCharacter.name}
              </DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Info</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
                <TabsTrigger value="stats">Stats</TabsTrigger>
              </TabsList>
              <TabsContent value="info" className="space-y-4">
                <div>
                  <h4 className="mb-2 font-semibold">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedCharacter.description || "No description available"}
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">Personality</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedCharacter.personality || "No personality defined"}
                  </p>
                </div>
                {selectedCharacter.scenario && (
                  <div>
                    <h4 className="mb-2 font-semibold">Scenario</h4>
                    <p className="text-sm text-muted-foreground">{selectedCharacter.scenario}</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="gallery">
                <ScrollArea className="h-96">
                  <div className="grid grid-cols-2 gap-4">
                    {selectedCharacter.gallery && selectedCharacter.gallery.length > 0 ? (
                      selectedCharacter.gallery.map((item, idx) => (
                        <Card
                          key={idx}
                          className="overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                          onClick={() => openCharacterGallery(selectedCharacter, idx)}
                        >
                          <CardContent className="p-0">
                            <img
                              src={item.url || "/placeholder.svg"}
                              alt={`Gallery ${idx + 1}`}
                              className="h-48 w-full object-cover"
                            />
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-2 py-12 text-center text-muted-foreground">No gallery items</div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="stats" className="space-y-4">
                <div>
                  <h4 className="mb-2 font-semibold">Messages in Session</h4>
                  <p className="text-2xl font-bold">
                    {displayMessages.filter((m) => m.characterId === selectedCharacter.id).length}
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">Relationships</h4>
                  <div className="space-y-2">
                    {characters
                      .filter((c) => c.id !== selectedCharacter.id)
                      .map((c) => {
                        const rel = getRelationship(selectedCharacter.id, c.id)
                        return (
                          <div key={c.id} className="flex items-center justify-between">
                            <span className="text-sm">{c.name}</span>
                            <span className="text-sm text-muted-foreground">{rel || "Undefined"}</span>
                          </div>
                        )
                      })}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* Focus Mode Dialog */}
      <Dialog open={showFocusDialog} onOpenChange={setShowFocusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Focus Mode</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select 1-2 characters for an intimate scene. Other characters will be temporarily excluded.
            </p>
            <div className="space-y-2">
              {characters.map((char) => (
                <div
                  key={char.id}
                  className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all ${
                    focusCharacters.includes(char.id)
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => {
                    if (focusCharacters.includes(char.id)) {
                      setFocusCharacters(focusCharacters.filter((id) => id !== char.id))
                    } else if (focusCharacters.length < 2) {
                      setFocusCharacters([...focusCharacters, char.id])
                    }
                  }}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={char.avatarUrl || char.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{char.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{char.name}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowFocusDialog(false)}>
                Cancel
              </Button>
              <Button onClick={startFocusMode} disabled={focusCharacters.length === 0 || focusCharacters.length > 2}>
                Start Focus
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Node Management Dialog (renamed from Node Dialog) */}
      <Dialog open={showNodeManager} onOpenChange={setShowNodeManager}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Nodes</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-96">
            <div className="space-y-3">
              {session.nodes.map((node) => (
                <Card key={node.id} className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{node.title}</h4>
                    <p className="text-sm text-muted-foreground">{node.messages.length} messages</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => switchNode(node.id)}>
                      Switch
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteNode(node.id)}>
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
          <div className="mt-4 flex justify-end gap-2">
            <Input
              value={newNodeTitle}
              onChange={(e) => setNewNodeTitle(e.target.value)}
              placeholder="New node title"
              className="max-w-xs"
            />
            <Button onClick={createNewNode}>Create Node</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Scenario Dialog */}
      <Dialog open={showScenarioDialog} onOpenChange={setShowScenarioDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Scenario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="scenario">Scenario Description</Label>
              <Textarea
                id="scenario"
                value={scenarioText}
                onChange={(e) => setScenarioText(e.target.value)}
                placeholder="Describe the setting, situation, and mood..."
                rows={6}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowScenarioDialog(false)}>
                Cancel
              </Button>
              <Button onClick={updateScenario}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showRelationshipManager} onOpenChange={setShowRelationshipManager}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Character Relationships</DialogTitle>
            <DialogDescription>Define how characters relate to each other in this session</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {characters.map((charA, idxA) =>
              characters.slice(idxA + 1).map((charB) => {
                const relationshipKey = `${charA.id}_${charB.id}`
                const currentRelation = session?.relationshipMap?.[relationshipKey] || ""

                return (
                  <Card key={relationshipKey}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar>
                          <AvatarImage src={charA.avatarUrl || charA.avatar} />
                          <AvatarFallback>{charA.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-semibold">{charA.name}</span>
                        <ArrowRight className="h-4 w-4" />
                        <Avatar>
                          <AvatarImage src={charB.avatarUrl || charB.avatar} />
                          <AvatarFallback>{charB.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-semibold">{charB.name}</span>
                      </div>
                      <div className="space-y-2">
                        <Label>Relationship Type</Label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            "Sister",
                            "Brother",
                            "Mother",
                            "Father",
                            "Daughter",
                            "Son",
                            "Wife",
                            "Husband",
                            "Partner",
                            "Friend",
                            "Best Friend",
                            "Rival",
                            "Enemy",
                            "Stranger",
                            "Colleague",
                            "Mentor",
                            "Student",
                            "Lover",
                            "Ex-Lover",
                          ].map((type) => (
                            <Badge
                              key={type}
                              variant={
                                currentRelation.toLowerCase().includes(type.toLowerCase()) ? "default" : "outline"
                              }
                              className="cursor-pointer"
                              onClick={() => {
                                if (!session) return
                                const updatedMap = {
                                  ...session.relationshipMap,
                                  [relationshipKey]: type,
                                }
                                const updatedSession = {
                                  ...session,
                                  relationshipMap: updatedMap,
                                  updatedAt: Date.now(),
                                }
                                saveSessionState(updatedSession)
                              }}
                            >
                              {type}
                            </Badge>
                          ))}
                        </div>
                        <Input
                          placeholder="Or enter custom relationship..."
                          value={currentRelation}
                          onChange={(e) => {
                            if (!session) return
                            const updatedMap = {
                              ...session.relationshipMap,
                              [relationshipKey]: e.target.value,
                            }
                            const updatedSession = {
                              ...session,
                              relationshipMap: updatedMap,
                              updatedAt: Date.now(),
                            }
                            setSession(updatedSession) // Update state immediately for responsiveness
                          }}
                          onBlur={() => session && saveMultiCharSession(session)} // Save on blur
                        />
                      </div>
                    </CardContent>
                  </Card>
                )
              }),
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showLorebookManager} onOpenChange={setShowLorebookManager}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Attach Lorebooks</DialogTitle>
            <DialogDescription>Select lorebooks to provide context for this roleplay session</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {getLorebooks().map((lorebook) => {
                const isAttached = session?.attachedLorebookIds?.includes(lorebook.id)
                return (
                  <Card
                    key={lorebook.id}
                    className={`cursor-pointer transition-all ${isAttached ? "border-primary" : ""}`}
                    onClick={() => {
                      if (!session) return
                      const currentIds = session.attachedLorebookIds || []
                      const updatedIds = isAttached
                        ? currentIds.filter((id) => id !== lorebook.id)
                        : [...currentIds, lorebook.id]
                      const updatedSession = {
                        ...session,
                        attachedLorebookIds: updatedIds,
                        updatedAt: Date.now(),
                      }
                      saveSessionState(updatedSession)
                      toast.success(isAttached ? "Lorebook removed" : "Lorebook attached")
                    }}
                  >
                    <CardContent className="flex items-center gap-3 p-4">
                      <Checkbox
                        checked={isAttached}
                        onCheckedChange={(checked) => {
                          if (!session) return
                          const currentIds = session.attachedLorebookIds || []
                          const updatedIds = checked
                            ? [...currentIds, lorebook.id]
                            : currentIds.filter((id) => id !== lorebook.id)
                          const updatedSession = {
                            ...session,
                            attachedLorebookIds: updatedIds,
                            updatedAt: Date.now(),
                          }
                          saveSessionState(updatedSession)
                          toast.success(checked ? "Lorebook attached" : "Lorebook removed")
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{lorebook.name}</h4>
                        <p className="text-sm text-muted-foreground">{lorebook.description}</p>
                      </div>
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Session Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 text-sm font-semibold">AI Model</h4>
              <Button
                variant="outline"
                className="w-full justify-between bg-transparent"
                onClick={() => setShowModelSelector(true)}
              >
                <span className="truncate">{session.modelId || "Select model"}</span>
                <Edit2 className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold">Narrator AI</h4>
                <p className="text-xs text-muted-foreground">Add a narrator to describe scenes</p>
              </div>
              <Button variant={narratorEnabled ? "default" : "outline"} size="sm" onClick={toggleNarrator}>
                {narratorEnabled ? "Enabled" : "Disabled"}
              </Button>
            </div>
            <div>
              <Label htmlFor="global-system-prompt">Global System Prompt</Label>
              <Textarea
                id="global-system-prompt"
                value={settings?.globalSystemPrompt || ""}
                onChange={(e) => setSettings((prev) => (prev ? { ...prev, globalSystemPrompt: e.target.value } : prev))}
                onBlur={() =>
                  settings &&
                  saveMultiCharSession({
                    ...session,
                    globalSystemPrompt: settings.globalSystemPrompt,
                  } as MultiCharSession)
                } // Crude save, needs proper settings save
                placeholder="Enter global instructions for all AI characters..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="temperature">Response Creativity (Temperature)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={settings?.temperature ?? 0.7}
                onChange={(e) => {
                  const value = Number.parseFloat(e.target.value)
                  setSettings((prev) =>
                    prev ? { ...prev, temperature: isNaN(value) ? 0.7 : Math.max(0, Math.min(1, value)) } : prev,
                  )
                }}
                onBlur={() =>
                  settings &&
                  saveMultiCharSession({ ...session, temperature: settings.temperature } as MultiCharSession)
                } // Crude save
                placeholder="0.0 - 1.0"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Model Selector */}
      {showModelSelector && (
        <ModelSelectorDialog
          open={showModelSelector}
          onOpenChange={setShowModelSelector}
          currentModel={session.modelId || ""}
          onSelectModel={updateModel}
        />
      )}

      {/* OracleViewer */}
      {showOracleViewer && viewerMedia && (
        <OracleViewer media={viewerMedia} onClose={() => setShowOracleViewer(false)} />
      )}
    </div>
  )
}
