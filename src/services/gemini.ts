import { GoogleGenAI } from "@google/genai";
import { Task, TimeBlock } from "../types";
import { addMinutes } from "date-fns";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function suggestSchedule(tasks: Task[], currentBlocks: TimeBlock[]): Promise<TimeBlock[]> {
  const prompt = `
    Analyze these tasks and suggest an optimal time-blocked schedule for a single day starting at 09:00.
    TASKS:
    ${JSON.stringify(tasks.filter(t => t.status !== 'completed').map(t => ({
      id: t.id,
      title: t.title,
      priority: t.priority,
      duration: t.estimatedMinutes,
      weight: t.strategicWeight
    })))}

    PRIORITIZATION RULES (Translate strategy but keep JSON keys technical):
    1. Priorizar tarefas com maior peso estratégico e urgência.
    2. Blocos de trabalho focado (Deep Work) devem ter pelo menos 60 min.
    3. Incluir pausas de 15min entre as tarefas.
    4. Formatar a saída como um array JSON de blocos: [{"taskId": string, "start": "HH:mm", "end": "HH:mm"}]
    5. Retornar APENAS o array JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const text = response.text || "";
    
    // Extract JSON from the potentially markdown-wrapped response
    const jsonMatch = text.match(/\[.*\]/s);
    if (!jsonMatch) throw new Error("Invalid AI response format");
    
    const rawBlocks = JSON.parse(jsonMatch[0]);
    const today = new Date();
    
    return rawBlocks.map((b: any, index: number) => {
      const [startH, startM] = b.start.split(':').map(Number);
      const [endH, endM] = b.end.split(':').map(Number);
      
      const startTime = new Date(today);
      startTime.setHours(startH, startM, 0, 0);
      
      const endTime = new Date(today);
      endTime.setHours(endH, endM, 0, 0);

      return {
        id: `ai-block-${index}`,
        taskId: b.taskId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      };
    });
  } catch (error) {
    console.error("AI Scheduling failed, using fallback:", error);
    return fallbackSchedule(tasks);
  }
}

function fallbackSchedule(tasks: Task[]): TimeBlock[] {
  const sortedTasks = [...tasks]
    .filter(t => t.status !== 'completed')
    .sort((a, b) => b.strategicWeight - a.strategicWeight);
    
  const newBlocks: TimeBlock[] = [];
  let currentStart = new Date();
  currentStart.setHours(9, 0, 0, 0);

  sortedTasks.forEach((task, index) => {
    const startTime = new Date(currentStart);
    const endTime = addMinutes(startTime, task.estimatedMinutes);
    
    newBlocks.push({
      id: `fallback-${task.id}-${index}`,
      taskId: task.id,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    });

    currentStart = addMinutes(endTime, 15);
  });

  return newBlocks;
}
