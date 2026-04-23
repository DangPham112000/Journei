export const resolvers = {
  Query: {
    journeys: async () => {
      // TODO: Fetch from MongoDB
      return [];
    },
    journey: async (_: any, { id }: { id: string }) => {
      // TODO: Fetch from MongoDB
      return null;
    },
  },
  Mutation: {
    createJourney: async (_: any, args: { title: string; startDate: string; endDate: string }) => {
      // TODO: Save to MongoDB
      // TODO: Call Google Calendar API to check for overlap / create event if authorized
      console.log('Creating journey', args);
      return {
        id: '1',
        ...args,
        locations: []
      };
    },
    addLocationToJourney: async (_: any, args: { journeyId: string; name: string; lat?: number; lng?: number; googleMapsUrl?: string }) => {
      // TODO: If googleMapsUrl is provided (especially short links like goo.gl),
      // we need to resolve the URL to get lat/lng coordinates if they aren't provided.
      // This might involve making a fetch request to the short URL and parsing the redirect.
      console.log('Adding location', args);
      return {
        id: '1',
        name: args.name,
        lat: args.lat || 0,
        lng: args.lng || 0,
        googleMapsUrl: args.googleMapsUrl
      };
    }
  },
};
