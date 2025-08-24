// This file is for deploying on Vercel. Located at /api/gemini.ts
import { GoogleGenAI } from '@google/genai';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }
    
    const { action, model, payload } = await req.json();
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500 });
    }
    
    try {
        const ai = new GoogleGenAI({ apiKey });

        switch (action) {
            case 'generateContent': {
                const result = await ai.models.generateContent(payload);
                return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
            }
            case 'generateContentStream': {
                const result = await ai.models.generateContentStream(payload);
                const stream = new ReadableStream({
                    async start(controller) {
                        for await (const chunk of result) {
                            controller.enqueue(new TextEncoder().encode(JSON.stringify(chunk) + '\n'));
                        }
                        controller.close();
                    },
                });
                return new Response(stream, { headers: { 'Content-Type': 'application/x-ndjson' } });
            }
            case 'generateImages': {
                const result = await ai.models.generateImages(payload);
                return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
            }
            case 'generateVideos': {
                const result = await ai.models.generateVideos(payload);
                return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
            }
            case 'getVideosOperation': {
                const result = await ai.operations.getVideosOperation(payload);
                return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
            }
            case 'fetchVideo': {
                const { downloadLink } = payload;
                if (!downloadLink) {
                    return new Response(JSON.stringify({ error: 'Download link missing' }), { status: 400 });
                }
                const videoUrl = `${downloadLink}&key=${apiKey}`;
                const fetchRes = await fetch(videoUrl);

                if (!fetchRes.ok) {
                    return new Response(JSON.stringify({ error: `Failed to fetch video: ${fetchRes.statusText}` }), { status: fetchRes.status });
                }

                return new Response(fetchRes.body, { 
                    headers: { 'Content-Type': 'video/mp4' } 
                });
            }
            default:
                 return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), { status: 400 });
        }
    } catch (error) {
        console.error(`Error in action ${action}:`, error);
        return new Response(JSON.stringify({ error: error.message || 'An error occurred' }), { status: 500 });
    }
}