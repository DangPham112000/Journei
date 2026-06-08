import { GoogleGenerativeAI, FunctionDeclaration, SchemaType } from '@google/generative-ai';
import { Plan } from '../models/Plan';
import { User } from '../models/User';
import mongoose from 'mongoose';

// Define tool schemas for Gemini
const getUserProfileDeclaration: FunctionDeclaration = {
  name: 'getUserProfile',
  description: 'Gets the current user\'s profile information (name, email, etc.)',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  },
};

const getUserPlansDeclaration: FunctionDeclaration = {
  name: 'getUserPlans',
  description: 'Gets all plans/trips created by the user.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  },
};

const draftPlanDeclaration: FunctionDeclaration = {
  name: 'draftPlan',
  description: 'Drafts a new plan or updates an existing one based on the user\'s request. The user must explicitly ask to create or update a plan before calling this. Always call this when drafting a plan.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      title: {
        type: SchemaType.STRING,
        description: 'The title of the plan.',
      },
      description: {
        type: SchemaType.STRING,
        description: 'The description of the plan.',
      },
      startDate: {
        type: SchemaType.STRING,
        description: 'The start date of the plan in ISO 8601 format.',
      },
      endDate: {
        type: SchemaType.STRING,
        description: 'The end date of the plan in ISO 8601 format.',
      },
      location: {
        type: SchemaType.STRING,
        description: 'The location of the plan.',
      },
    },
    required: ['title', 'startDate', 'endDate'],
  },
};

// Implement the actual functions that will be called
async function getUserProfile(userId: string) {
  const user = await User.findById(userId);
  if (!user) return { error: 'User not found' };
  return {
    name: user.name,
    email: user.email,
  };
}

async function getUserPlans(userId: string) {
  const myPlans = await Plan.find({ userId }).populate('destinations');

  return {
    myPlans: myPlans.map((p: any) => ({
      id: p._id.toString(),
      title: p.title,
      startDate: p.startDate.toISOString(),
      endDate: p.endDate.toISOString(),
      destinations: p.destinations.map((d: any) => d.name),
    }))
  };
}

export async function processAssistantMessage(userId: string, message: string, history?: any[]) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not configured on the server.');
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  // We use the 1.5 flash model as it supports tool calling and is fast/free-tier eligible
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    tools: [{
      functionDeclarations: [
        getUserProfileDeclaration,
        getUserPlansDeclaration,
        draftPlanDeclaration,
      ],
    }],
    systemInstruction: "You are a helpful journey planner AI assistant. You help the user manage their planned events and trips. You have access to tools to fetch the user's profile and their plans. If the user asks to create or update a plan, use the draftPlan tool to propose the details to them for confirmation. When calling draftPlan, also provide a helpful text response confirming you are drafting it."
  });

  const chat = model.startChat({ history: history || [] });

  let response = await chat.sendMessage(message);
  let draftEvent = null; // using draftEvent property to match graphql schema AssistantResponse

  // Handle function calling
  const functionCalls = response.response.functionCalls();
  if (functionCalls && functionCalls.length > 0) {
    for (const call of functionCalls) {
      let functionResponse;

      if (call.name === 'getUserProfile') {
        const profile = await getUserProfile(userId);
        functionResponse = { response: profile };
      } else if (call.name === 'getUserPlans') {
        const plans = await getUserPlans(userId);
        functionResponse = { response: plans };
      } else if (call.name === 'draftPlan') {
        // If the AI calls draftPlan, we extract the args and stop the loop,
        // sending it back to the client to confirm.
        const args = call.args as any;
        draftEvent = {
          title: args.title,
          description: args.description || null,
          startDate: args.startDate,
          endDate: args.endDate,
          location: args.location || null,
        };
        // We still need to return a dummy response to the model for the tool call
        functionResponse = { response: { status: 'Draft sent to user for confirmation.' } };
      }

      if (functionResponse) {
        response = await chat.sendMessage([{
          functionResponse: {
            name: call.name,
            response: functionResponse,
          }
        }]);
      }
    }
  }

  // If the AI called draftPlan on the *second* pass (rare, but possible), check again
  const secondFunctionCalls = response.response.functionCalls();
  if (!draftEvent && secondFunctionCalls && secondFunctionCalls.length > 0) {
    for (const call of secondFunctionCalls) {
       if (call.name === 'draftPlan') {
        const args = call.args as any;
        draftEvent = {
          title: args.title,
          description: args.description || null,
          startDate: args.startDate,
          endDate: args.endDate,
          location: args.location || null,
        };
       }
    }
  }

  return {
    text: response.response.text(),
    draftEvent,
  };
}
