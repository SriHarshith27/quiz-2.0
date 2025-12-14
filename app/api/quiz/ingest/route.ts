import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import PDFParser from 'pdf2json';

export const config = {
    api: {
        bodyParser: false,
    },
};

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json({ error: 'GEMINI_API_KEY is not set in environment variables.' }, { status: 500 });
    }
    console.log('Ingest route hit (Gemini)');
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const quizId = formData.get('quizId') as string;

        if (!file || !quizId) {
            return NextResponse.json({ error: 'Missing file or quizId' }, { status: 400 });
        }

        // 1. Parse PDF
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const text = await new Promise<string>((resolve, reject) => {
            const pdfParser = new PDFParser(null, true);

            pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
            pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
                // getRawTextContent() returns the text content
                resolve(pdfParser.getRawTextContent());
            });

            pdfParser.parseBuffer(buffer);
        });

        if (!text || text.length < 10) {
            return NextResponse.json({ error: 'PDF content empty or too short' }, { status: 400 });
        }

        // 2. Chunk Text (Simple Character Splitter)
        const chunkSize = 1000;
        const chunks: string[] = [];
        for (let i = 0; i < text.length; i += chunkSize) {
            chunks.push(text.slice(i, i + chunkSize));
        }

        console.log(`Split PDF into ${chunks.length} chunks`);

        // 3. Generate Embeddings & Store in DB
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();

        // Use the embedding model
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

        for (const chunk of chunks) {
            // Gemini Embedding call
            const result = await model.embedContent(chunk);
            const embedding = result.embedding.values;

            const { error } = await supabase.from('quiz_documents').insert({
                quiz_id: quizId,
                content: chunk,
                embedding: embedding,
            });

            if (error) {
                console.error('Error inserting chunk:', error);
            }
        }

        return NextResponse.json({ success: true, chunks: chunks.length });
    } catch (error: any) {
        console.error('Ingest Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
