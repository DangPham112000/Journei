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

  type User {
    id: ID!
    googleId: String!
    email: String!
    name: String!
    picture: String
  }

  type Query {
    journeys: [Journey!]!
    journey(id: ID!): Journey
    me: User
  }

  type Mutation {
    createJourney(title: String!, startDate: String!, endDate: String!): Journey!
    addLocationToJourney(journeyId: ID!, name: String!, lat: Float, lng: Float, googleMapsUrl: String): Location!
    loginWithGoogle(code: String!): User!

    # TODO: Add mutation to sync with Google Calendar
    # syncJourneyToCalendar(journeyId: ID!): Journey!
  }
`;
