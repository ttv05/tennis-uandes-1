import { invokeLLM } from "./_core/llm";

export interface TimeBlock {
  dayOfWeek: number; // 0=Monday, 4=Friday
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  isAvailable: boolean;
  type: "class" | "free"; // class = occupied, free = available
}

export interface OCRResult {
  blocks: TimeBlock[];
  confidence: number;
  rawText: string;
}

/**
 * Process a calendar image using LLM-based OCR
 * Extracts class schedules and free time blocks
 */
export async function processCalendarImage(imageUrl: string): Promise<OCRResult> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are an expert at reading university class schedules from images. 
          
Your task is to extract the schedule from a calendar image and identify:
1. All class/occupied time blocks
2. All free time blocks

Return ONLY valid JSON with this structure:
{
  "blocks": [
    {
      "dayOfWeek": 0-6 (0=Monday, 6=Sunday),
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "type": "class" or "free"
    }
  ],
  "confidence": 0-1 (how confident you are in the extraction),
  "notes": "any relevant notes about the schedule"
}

IMPORTANT:
- Use 24-hour format for times
- Only include Monday-Friday (0-4)
- If a time slot is not clearly visible, don't include it
- Ensure times are realistic (e.g., classes typically run 8:00-20:00)
- If the image is unclear or not a calendar, return empty blocks array`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please extract the schedule from this calendar image. Focus on identifying class times (occupied) and free time windows.",
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high",
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    // Parse the LLM response
    const content = response.choices[0]?.message.content;
    if (!content || typeof content !== "string") {
      throw new Error("No response from LLM");
    }

    const parsed = JSON.parse(content);

    // Validate and normalize the response
    const blocks: TimeBlock[] = (parsed.blocks || [])
      .filter((block: any) => {
        // Validate required fields
        if (
          typeof block.dayOfWeek !== "number" ||
          typeof block.startTime !== "string" ||
          typeof block.endTime !== "string" ||
          typeof block.type !== "string"
        ) {
          return false;
        }

        // Validate day of week (0-4 for Mon-Fri)
        if (block.dayOfWeek < 0 || block.dayOfWeek > 4) {
          return false;
        }

        // Validate time format
        if (!/^\d{2}:\d{2}$/.test(block.startTime) || !/^\d{2}:\d{2}$/.test(block.endTime)) {
          return false;
        }

        // Validate type
        if (block.type !== "class" && block.type !== "free") {
          return false;
        }

        return true;
      })
      .map((block: any) => ({
        dayOfWeek: block.dayOfWeek,
        startTime: block.startTime,
        endTime: block.endTime,
        isAvailable: block.type === "free",
        type: block.type,
      }));

    return {
      blocks,
      confidence: parsed.confidence || 0.8,
      rawText: parsed.notes || "",
    };
  } catch (error) {
    console.error("[OCR] Error processing calendar image:", error);
    throw new Error(`Failed to process calendar image: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Convert OCR blocks to availability format for database storage
 */
export function convertOCRBlocksToAvailability(
  blocks: TimeBlock[],
  weekNumber: number,
  year: number
): Array<{
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  source: "ocr";
  weekNumber: number;
  year: number;
}> {
  return blocks.map((block) => ({
    dayOfWeek: block.dayOfWeek,
    startTime: block.startTime,
    endTime: block.endTime,
    isAvailable: block.isAvailable,
    source: "ocr" as const,
    weekNumber,
    year,
  }));
}
