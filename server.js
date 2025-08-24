// This file is for deploying on Render.
import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';
import fetch from 'node-fetch'; // Required for streaming in Node.js < 18 or for specific scenarios

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API Proxy Route
app.post('/api/gemini', async (req, res) => {
    const { action, model, payload } = req.body;
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API key is not configured on the server.' });
    }
    
    try {
        const ai = new GoogleGenAI({ apiKey });

        switch (action) {
            case 'generateContent': {
                const result = await ai.models.generateContent(payload);
                return res.json(result);
            }
            case 'generateContentStream': {
                const result = await ai.models.generateContentStream(payload);
                res.setHeader('Content-Type', 'application/x-ndjson');
                for await (const chunk of result) {
                    res.write(JSON.stringify(chunk) + '\n');
                }
                return res.end();
            }
            case 'generateImages': {
                const result = await ai.models.generateImages(payload);
                return res.json(result);
            }
            case 'generateVideos': {
                const result = await ai.models.generateVideos(payload);
                return res.json(result);
            }
            case 'getVideosOperation': {
                const result = await ai.operations.getVideosOperation(payload);
                return res.json(result);
            }
            case 'fetchVideo': {
                const { downloadLink } = payload;
                if (!downloadLink) return res.status(400).json({ error: 'Download link is missing.' });

                const videoUrl = `${downloadLink}&key=${apiKey}`;
                const fetchRes = await fetch(videoUrl);

                if (!fetchRes.ok) {
                    throw new Error(`Failed to fetch video: ${fetchRes.statusText}`);
                }
                
                res.setHeader('Content-Type', 'video/mp4');
                // The body from node-fetch is already a Node.js Readable stream
                fetchRes.body.pipe(res);
                return; // End response by piping
            }
            default:
                return res.status(400).json({ error: `Unknown action: ${action}` });
        }
    } catch (error) {
        console.error(`Error in action ${action}:`, error);
        res.status(500).json({ error: error.message || 'An error occurred while processing the request.' });
    }
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// For any other request, serve the index.html file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});