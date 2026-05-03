export const typeDefs = `#graphql
  type User {
    id: ID!
    email: String!
    name: String!
    picture: String
  }

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
    hello: String!
    me: User
    journeys: [Journey!]!
    journey(id: ID!): Journey
  }

  type Mutation {
    loginWithGoogle(code: String!): User!
    createJourney(title: String!, startDate: String!, endDate: String!): Journey!
    addLocationToJourney(journeyId: ID!, name: String!, lat: Float, lng: Float, googleMapsUrl: String): Location!
  }
`;
