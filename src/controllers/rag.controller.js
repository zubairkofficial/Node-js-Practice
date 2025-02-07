import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { TextLoader } from "langchain/document_loaders/fs/text";
// Updated import path
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { UnstructuredLoader } from "@langchain/community/document_loaders/fs/unstructured";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// PostgreSQL connection configuration
const CONNECTION_STRING = process.env.DATABASE_URL;
const PGVECTOR_STORE = {
    postgresConnectionOptions: {
        connectionString: CONNECTION_STRING,
    },
    tableName: 'documents', // Table name for storing embeddings
    columns: {
        idColumn: 'id',
        vectorColumn: 'embedding',
        contentColumn: 'text', // Updated column name
        metadataColumn: 'metadata',
    },
};

// Helper function to dynamically load and split documents
const loadAndSplitDocument = async (filePath, fileType) => {
    let loader;
    switch (fileType) {
        case 'pdf':
            loader = new PDFLoader(filePath);
            break;
        case 'docx':
            loader = new DocxLoader(filePath);
            break;
        case 'txt':
            loader = new TextLoader(filePath); // Updated loader
            break;
        default:
            throw new Error('Unsupported file type');
    }
    return await loader.load();

};

console.log("docx", loadAndSplitDocument)



// Helper function to load and split web pages
const loadAndSplitWebPage = async (url, selector = "p") => {
    const loader = new CheerioWebBaseLoader(url, {
        selector: selector,
    });

    const docs = await loader.load();

    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 0,
    });

    const splits = await textSplitter.splitDocuments(docs);
    return splits;
};

class RAGController {
    async processDocument(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const filePath = req.file.path;
            const fileExtension = path.extname(filePath).toLowerCase().slice(1);

            // Load and split the document
            const splits = await loadAndSplitDocument(filePath, fileExtension);
            console.log("splits", splits)
            // Initialize OpenAI embeddings

            const embeddings = new OpenAIEmbeddings({
                openAIApiKey: process.env.OPENAI_API_KEY,
            });
            console.log("embeddings", embeddings)
            const filteredSplits = splits.filter(doc => doc.pageContent && doc.pageContent.trim() !== '');
            if (filteredSplits.length === 0) {
                throw new Error("No valid content extracted from document.");
            }
            console.log("Filtered splits:", filteredSplits);

            // Store embeddings in PostgreSQL
            const vectorStore = await PGVectorStore.initialize(
                embeddings,
                PGVECTOR_STORE
            );
            // console.log("vectorStore", vectorStore)
            // Add documents to vector store
            await vectorStore.addDocuments(filteredSplits);


            // Clean up uploaded file
            fs.unlinkSync(filePath);

            res.status(200).json({
                message: 'Document processed successfully',
                chunksCount: splits.length
            });

        } catch (error) {
            console.error('Error processing document:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async processWebPage(req, res) {
        try {
            const { url, selector = "p" } = req.body;

            if (!url) {
                return res.status(400).json({ error: 'URL is required' });
            }

            // Load and split the web page
            const splits = await loadAndSplitWebPage(url, selector);

            // Initialize OpenAI embeddings
            const embeddings = new OpenAIEmbeddings({
                openAIApiKey: process.env.OPENAI_API_KEY,
            });

            // Store embeddings in PostgreSQL
            const vectorStore = await PGVectorStore.initialize(
                embeddings,
                PGVECTOR_STORE
            );

            // Add documents to vector store
            await vectorStore.addDocuments(splits);

            res.status(200).json({
                message: 'Web page processed successfully',
                chunksCount: splits.length
            });

        } catch (error) {
            console.error('Error processing web page:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

export default RAGController;