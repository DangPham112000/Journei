export const typeDefs = `#graphql
  type Location {
    id: ID!
    name: String!
    lat: Float!
    lng: Float!
    googleMapsUrl: String
  }

  type Journey {
    id: ID!
    title: String!
    startDate: String!
    endDate: String!
    locations: [Location!]!
    googleCalendarEventId: String
  }

  type Query {
    journeys: [Journey!]!
    journey(id: ID!): Journey
  }

  type Mutation {
    createJourney(title: String!, startDate: String!, endDate: String!): Journey!
    addLocationToJourney(journeyId: ID!, name: String!, lat: Float, lng: Float, googleMapsUrl: String): Location!

    # TODO: Add mutation to sync with Google Calendar
    # syncJourneyToCalendar(journeyId: ID!): Journey!
  }
`;
