
'use server';
/**
 * @fileOverview A project assistant AI flow for clients.
 */

import { config } from 'dotenv';
config(); // Load environment variables

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import * as admin from 'firebase-admin';
import { getApps, ServiceAccount } from 'firebase-admin/app';

// Helper function to get Firestore instance on the server
function getDb() {
  if (getApps().length === 0) {
    // Service Account credentials provided in setup
    const serviceAccount: ServiceAccount = {
        projectId: "geminiestimate",
        clientEmail: "firebase-adminsdk-fbsvc@geminiestimate.iam.gserviceaccount.com",
        privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC03YBeIiU/Nvj9\n6pGuhydwzFMw33C+mdq0yAhBRhFme2UFIuHNOTciHny+nFmjNbPwhRWFptbEOPTy\nurAr35vNAYI46MuS6+xxhfr2nzm9HQZJgL2V8efDpv53ocQvBSm40rHOmm6lmlJS\ncpNXBB3FUq4suhOdQXW8ZXhpTxA1QkjY8Pdld3e5J/CgYlx9Kdgh6uTkpj2IaNMd\ns+Y04UNXzLod2N8FfEopbYaERZCGl7JujbXvX5MyfG4cbnk2i41gIyv4Jnz3Y/fG\nNjtcEWXripkd48+sQTwwhOp55ubM6ys0yyDqicOD4Mk0OzO1VD6+Gswg9etIctLS\nkY7cw+r9AgMBAAECggEADjStnfcpnMb5FJyFd8NW1jW+PQL3zIiyFGv3tgTGXhnI\nC/i66o8ZZP0nCCOoqLiRmw0g7R/3E29z0dLW/oMwLhB1xXmHb9FG/32qAg/sjY2H\njmNlwK7A6O2nZAcZLSZHKiSmYZdgpHI0EBS+vOFuYy7Ezm+JFdtr33HK3N6gY8Zg\nQTi5/NXNqAVs1rcIrIOf5HOOQbQ+d2JJTgEO4o7rCWAmzIXv0oFsXggMGXTtbXLg\nHHhi+zl11XK90xRuIYZGdX1WR9PuwMgKTedyi0GhzB22tRGuWxvk5vRS8PDm1A9L\nIObtSDxVTtRI/1kZhzc/dT5gH27bJHWw0ZiVMz/wUwKBgQD+ndjQjYHcLZQL+L6F\n6KOzG3oH7jcq1uzSFIksvaPCoq1dXTFRA+nAGtdzvScG6HxK5OQJRRnAgoPo0CKJ\nYjRomMmG31Q/fh8x3jOZTe7xwxxGFCjNSXK35AUmq/QWuLUE34KKFGjLSvnec+2J\ngCalGD88gnJxhlOWWuJZRMkYowKBgQC12RJfT+zt/Hegg4pOT0fu9jSmsO6hHzUZ\ntrdy/Q5tBgdOyzYFsPF195bJuFKJ/yuqA28REf5anKVUMhl/SURezcae/xlHjw/a\nX8eHMHdlE5ei5RuYJGEnVKs8kU6bNv5dbW0Vf30F5Ac6JKJ3MOMqkeXv3KGJD3Co\n8g6bbhkH3wKBgEVkNYPZHQwpq9B7cUlDduHIWkCxDn3xZ0d161CzOl9AQKlSTa97\ntofxiMh1Q56hW8Z5jSBtobASoeqgVtlEV24uPbYxRV+sesn3ee6NC9L9zsXWlqwk\nGUy+qxy3/mT23/a9B3GkUE8fVuvmglVYBLA35HwUPSZtanhuuoODuJ6rAoGAMdTd\nQv8c9w5THcpOES2KkcIoJXGgwshRfc1jMgCEfn3DbOUk1aRqVqBVUsvO2n/xUDKG\nsg/TOrNoXs0nzYifUrdi8VkIbWKXvoi2naY7YZhf2kScLjHx6Zw7HGrZNpF4XNPK\nq7R25zFYhadaWf0skxLOBs/X+D4h6joCpLcj5tMCgYEA34ZUNDaoEEQ9zS6OnBp1\nxaaQWbzNcpAW9WyIYWXgQp/pHrRnKI1m4wBMRyNpNWfv2ct1MdgGtU+LNyXdWr66\n4l9TtCKOEdqsrFP5lk5OyGMCXMki1mqowNuh0WLW0n6PV+gRZxf/bHzp2P9618tu\nwAvOJaRURY8zdLUzoCtOOfU=\n-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n'),
    };
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://geminiestimate-default-rtdb.asia-southeast1.firebasedatabase.app"
    });
  }
  return admin.firestore();
}

// TOOL: Get project IDs for a given user ID
const getProjectsForUser = ai.defineTool(
  {
    name: 'getProjectsForUser',
    description: "Get a list of project IDs and names for a given user ID. This is the first step to answer any user query.",
    inputSchema: z.object({ userId: z.string().describe("The user's Firebase UID.") }),
    outputSchema: z.array(z.object({ id: z.string(), name: z.string() })),
  },
  async ({ userId }) => {
    const db = getDb();
    const projects: { id: string; name: string }[] = [];
    const projectsQuery = db.collection('projects').where('userId', '==', userId);
    const snapshot = await projectsQuery.get();
    snapshot.forEach(doc => {
      projects.push({ id: doc.id, name: doc.data().projectName });
    });
    return projects;
  }
);


// TOOL: Get payment transactions for a given project ID
const getProjectTransactions = ai.defineTool(
  {
    name: 'getProjectTransactions',
    description: 'Get financial transactions (payments and expenses) for a specific project.',
    inputSchema: z.object({ projectId: z.string().describe('The ID of the project.') }),
    outputSchema: z.array(z.object({
      type: z.string(),
      category: z.string(),
      amount: z.number(),
      date: z.string(),
      description: z.string(),
    })),
  },
  async ({ projectId }) => {
    const db = getDb();
    const transactions: any[] = [];
    const transQuery = db.collection(`projects/${projectId}/transactions`);
    const snapshot = await transQuery.get();
    snapshot.forEach(doc => {
      const data = doc.data();
      // Ensure date is valid before converting
      const dateString = data.date && data.date.seconds 
        ? new Date(data.date.seconds * 1000).toLocaleDateString()
        : 'N/A';
      transactions.push({
        type: data.type,
        category: data.category,
        amount: data.amount,
        date: dateString,
        description: data.description,
      });
    });
    return transactions;
  }
);


// TOOL: Get labor information for a given project ID
const getProjectLaborers = ai.defineTool(
  {
    name: 'getProjectLaborers',
    description: 'Get aggregated information about laborer attendance and payments for a specific project. Use this to answer questions about total labor costs, payments, and workdays.',
    inputSchema: z.object({ projectId: z.string().describe('The ID of the project.') }),
    outputSchema: z.object({
        totalWorkDays: z.number(),
        totalLaborers: z.number(),
        totalBill: z.number(),
        totalPaid: z.number(),
        balanceDue: z.number(),
    }),
  },
  async ({ projectId }) => {
    const db = getDb();
    let totalWorkDays = 0;
    let totalLaborers = 0;
    let totalBill = 0;

    // 1. Calculate total bill from daily attendance
    const attendanceQuery = db.collection(`projects/${projectId}/dailyAttendances`);
    const attendanceSnapshot = await attendanceQuery.get();
    
    totalWorkDays = attendanceSnapshot.size;
    attendanceSnapshot.forEach(doc => {
        const att = doc.data();
        totalLaborers += att.numberOfLaborers || 0;
        totalBill += (att.numberOfLaborers || 0) * (att.wagePerLaborer || 0);
    });

    // 2. Calculate total paid from labor expenses
    const paymentsQuery = db.collection(`projects/${projectId}/transactions`)
        .where('category', '==', 'Labor')
        .where('type', '==', 'Expense');
    const paymentsSnapshot = await paymentsQuery.get();
    const totalPaid = paymentsSnapshot.docs.reduce((sum, doc) => sum + doc.data().amount, 0);

    // 3. Calculate balance
    const balanceDue = totalBill - totalPaid;

    return {
        totalWorkDays,
        totalLaborers,
        totalBill,
        totalPaid,
        balanceDue
    };
  }
);


export const ProjectChatInputSchema = z.object({
  userId: z.string().describe('The Firebase UID of the current user.'),
  query: z.string().describe("The user's question about their project."),
});
export type ProjectChatInput = z.infer<typeof ProjectChatInputSchema>;

export const ProjectChatOutputSchema = z.object({
  answer: z.string().describe('A helpful and concise answer to the user\'s question, formatted in Markdown.'),
});
export type ProjectChatOutput = z.infer<typeof ProjectChatOutputSchema>;

const chatPrompt = ai.definePrompt({
    name: 'projectChatPrompt',
    system: `You are a friendly and helpful construction project assistant for a company named "ROY Construction & Consultant". Your goal is to answer the client's questions about their project(s).
    - You are an expert in analyzing the provided data from the tools. Do not hallucinate or make up information.
    - First, use the 'getProjectsForUser' tool to find the user's project(s). Most users will only have one project. If they have more than one and their question isn't specific, ask them which project they are referring to by name.
    - Once you know the project, use the available tools ('getProjectTransactions', 'getProjectLaborers') to find the information needed to answer the user's question.
    - You must only use the tools provided to answer questions.
    - Answer concisely and clearly. Use Markdown for formatting, such as lists, bold text, and tables, to make the information easy to read.
    - Always be polite and professional.
    - If you can't find the information or a question is outside your scope (e.g., asking for legal advice), politely state that you cannot answer and suggest they contact the project manager.
    - When presenting financial data, format it clearly (e.g., "Total Paid: ৳50,000").
    - DO NOT share the user's UID in your response.`,
    tools: [getProjectsForUser, getProjectTransactions, getProjectLaborers],
    input: { schema: z.object({ query: z.string(), userId: z.string() }) },
    output: { schema: ProjectChatOutputSchema },
  });
  

const projectChatFlow = ai.defineFlow(
  {
    name: 'projectChatFlow',
    inputSchema: ProjectChatInputSchema,
    outputSchema: ProjectChatOutputSchema,
  },
  async (input) => {
    const llmResponse = await chatPrompt(input);
    return llmResponse.output!;
  }
);

export async function getProjectChatResponse(
  input: ProjectChatInput
): Promise<ProjectChatOutput> {
  return projectChatFlow(input);
}
