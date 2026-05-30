import { GoogleGenerativeAI, FunctionDeclaration, SchemaType } from '@google/generative-ai';
import { Event, IEvent } from '../models/Event';
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

const getUserEventsDeclaration: FunctionDeclaration = {
  name: 'getUserEvents',
  description: 'Gets all events relevant to the user, including events they created, joined, or followed.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  },
};

const draftEventDeclaration: FunctionDeclaration = {
  name: 'draftEvent',
  description: 'Drafts a new event or updates an existing one based on the user\'s request. The user must explicitly ask to create or update an event before calling this. Always call this when drafting an event.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      title: {
        type: SchemaType.STRING,
        description: 'The title of the event.',
      },
      description: {
        type: SchemaType.STRING,
        description: 'The description of the event.',
      },
      startDate: {
        type: SchemaType.STRING,
        description: 'The start date of the event in ISO 8601 format.',
      },
      endDate: {
        type: SchemaType.STRING,
        description: 'The end date of the event in ISO 8601 format.',
      },
      location: {
        type: SchemaType.STRING,
        description: 'The location of the event.',
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

async function getUserEvents(userId: string) {
  const createdEvents = await Event.find({ creator: userId }).populate('creator followers participants');
  const joinedEvents = await Event.find({ participants: userId }).populate('creator followers participants');
  const followedEvents = await Event.find({ followers: userId }).populate('creator followers participants');

  return {
    createdEvents: createdEvents.map((e: any) => ({
      id: e._id.toString(),
      title: e.title,
      description: e.description,
      startDate: e.startDate.toISOString(),
      endDate: e.endDate.toISOString(),
      location: e.location,
    })),
    joinedEvents: joinedEvents.map((e: any) => ({
      id: e._id.toString(),
      title: e.title,
      description: e.description,
      startDate: e.startDate.toISOString(),
      endDate: e.endDate.toISOString(),
      location: e.location,
    })),
    followedEvents: followedEvents.map((e: any) => ({
      id: e._id.toString(),
      title: e.title,
      description: e.description,
      startDate: e.startDate.toISOString(),
      endDate: e.endDate.toISOString(),
      location: e.location,
    })),
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
        getUserEventsDeclaration,
        draftEventDeclaration,
      ],
    }],
    systemInstruction: "You are a helpful journey planner AI assistant. You help the user manage their planned events and trips. You have access to tools to fetch the user's profile and their events. If the user asks to create or update an event, use the draftEvent tool to propose the details to them for confirmation. When calling draftEvent, also provide a helpful text response confirming you are drafting it."
  });

  const chat = model.startChat({ history: history || [] });

  let response = await chat.sendMessage(message);
  let draftEvent = null;

  // Handle function calling
  const functionCalls = response.response.functionCalls();
  if (functionCalls && functionCalls.length > 0) {
    for (const call of functionCalls) {
      let functionResponse;

      if (call.name === 'getUserProfile') {
        const profile = await getUserProfile(userId);
        functionResponse = { response: profile };
      } else if (call.name === 'getUserEvents') {
        const events = await getUserEvents(userId);
        functionResponse = { response: events };
      } else if (call.name === 'draftEvent') {
        // If the AI calls draftEvent, we extract the args and stop the loop,
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

  // If the AI called draftEvent on the *second* pass (rare, but possible), check again
  const secondFunctionCalls = response.response.functionCalls();
  if (!draftEvent && secondFunctionCalls && secondFunctionCalls.length > 0) {
    for (const call of secondFunctionCalls) {
       if (call.name === 'draftEvent') {
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