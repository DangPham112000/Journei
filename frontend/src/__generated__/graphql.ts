/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Event = {
  __typename?: 'Event';
  creator: User;
  description?: Maybe<Scalars['String']['output']>;
  endDate: Scalars['String']['output'];
  followers: Array<User>;
  id: Scalars['ID']['output'];
  location?: Maybe<Scalars['String']['output']>;
  participants: Array<User>;
  startDate: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createEvent: Event;
  deleteEvent: Scalars['Boolean']['output'];
  followEvent: Event;
  joinEvent: Event;
  leaveEvent: Event;
  loginWithGoogle: User;
  unfollowEvent: Event;
  updateEvent: Event;
};


export type MutationCreateEventArgs = {
  autoFollow?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  endDate: Scalars['String']['input'];
  location?: InputMaybe<Scalars['String']['input']>;
  startDate: Scalars['String']['input'];
  title: Scalars['String']['input'];
};


export type MutationDeleteEventArgs = {
  id: Scalars['ID']['input'];
};


export type MutationFollowEventArgs = {
  id: Scalars['ID']['input'];
};


export type MutationJoinEventArgs = {
  id: Scalars['ID']['input'];
};


export type MutationLeaveEventArgs = {
  id: Scalars['ID']['input'];
};


export type MutationLoginWithGoogleArgs = {
  code: Scalars['String']['input'];
};


export type MutationUnfollowEventArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateEventArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  location?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type Query = {
  __typename?: 'Query';
  events: Array<Event>;
  followedEvents: Array<Event>;
  hello: Scalars['String']['output'];
  joinedEvents: Array<Event>;
  me?: Maybe<User>;
  myEvents: Array<Event>;
};

export type User = {
  __typename?: 'User';
  email: Scalars['String']['output'];
  googleId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  picture?: Maybe<Scalars['String']['output']>;
};

export type GetHelloQueryVariables = Exact<{ [key: string]: never; }>;


export type GetHelloQuery = { hello: string };

export type GetEventsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetEventsQuery = { events: Array<{ id: string, title: string, description: string | null, startDate: string, endDate: string, location: string | null, creator: { id: string, name: string }, followers: Array<{ id: string, name: string }>, participants: Array<{ id: string, name: string }> }> };

export type GetMyEventsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyEventsQuery = { myEvents: Array<{ id: string, title: string, description: string | null, startDate: string, endDate: string, location: string | null, creator: { id: string, name: string }, followers: Array<{ id: string, name: string }>, participants: Array<{ id: string, name: string }> }> };

export type GetJoinedEventsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetJoinedEventsQuery = { joinedEvents: Array<{ id: string, title: string, description: string | null, startDate: string, endDate: string, location: string | null, creator: { id: string, name: string }, followers: Array<{ id: string, name: string }>, participants: Array<{ id: string, name: string }> }> };

export type GetFollowedEventsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetFollowedEventsQuery = { followedEvents: Array<{ id: string, title: string, description: string | null, startDate: string, endDate: string, location: string | null, creator: { id: string, name: string }, followers: Array<{ id: string, name: string }>, participants: Array<{ id: string, name: string }> }> };

export type CreateEventMutationVariables = Exact<{
  title: string;
  description?: string | null | undefined;
  startDate: string;
  endDate: string;
  location?: string | null | undefined;
  autoFollow?: boolean | null | undefined;
}>;


export type CreateEventMutation = { createEvent: { id: string, title: string } };

export type JoinEventMutationVariables = Exact<{
  id: string | number;
}>;


export type JoinEventMutation = { joinEvent: { id: string } };

export type LeaveEventMutationVariables = Exact<{
  id: string | number;
}>;


export type LeaveEventMutation = { leaveEvent: { id: string } };

export type FollowEventMutationVariables = Exact<{
  id: string | number;
}>;


export type FollowEventMutation = { followEvent: { id: string } };

export type UnfollowEventMutationVariables = Exact<{
  id: string | number;
}>;


export type UnfollowEventMutation = { unfollowEvent: { id: string } };

export type DeleteEventMutationVariables = Exact<{
  id: string | number;
}>;


export type DeleteEventMutation = { deleteEvent: boolean };

export type LoginWithGoogleMutationVariables = Exact<{
  code: string;
}>;


export type LoginWithGoogleMutation = { loginWithGoogle: { id: string, name: string, email: string, picture: string | null } };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { me: { id: string, name: string, email: string, picture: string | null } | null };


export const GetHelloDocument = gql`
    query GetHello {
  hello
}
    `;

/**
 * __useGetHelloQuery__
 *
 * To run a query within a React component, call `useGetHelloQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetHelloQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetHelloQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetHelloQuery(baseOptions?: Apollo.QueryHookOptions<GetHelloQuery, GetHelloQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetHelloQuery, GetHelloQueryVariables>(GetHelloDocument, options);
      }
export function useGetHelloLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetHelloQuery, GetHelloQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetHelloQuery, GetHelloQueryVariables>(GetHelloDocument, options);
        }
// @ts-ignore
export function useGetHelloSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetHelloQuery, GetHelloQueryVariables>): Apollo.UseSuspenseQueryResult<GetHelloQuery, GetHelloQueryVariables>;
export function useGetHelloSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetHelloQuery, GetHelloQueryVariables>): Apollo.UseSuspenseQueryResult<GetHelloQuery | undefined, GetHelloQueryVariables>;
export function useGetHelloSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetHelloQuery, GetHelloQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetHelloQuery, GetHelloQueryVariables>(GetHelloDocument, options);
        }
export type GetHelloQueryHookResult = ReturnType<typeof useGetHelloQuery>;
export type GetHelloLazyQueryHookResult = ReturnType<typeof useGetHelloLazyQuery>;
export type GetHelloSuspenseQueryHookResult = ReturnType<typeof useGetHelloSuspenseQuery>;
export type GetHelloQueryResult = Apollo.QueryResult<GetHelloQuery, GetHelloQueryVariables>;
export const GetEventsDocument = gql`
    query GetEvents {
  events {
    id
    title
    description
    startDate
    endDate
    location
    creator {
      id
      name
    }
    followers {
      id
      name
    }
    participants {
      id
      name
    }
  }
}
    `;

/**
 * __useGetEventsQuery__
 *
 * To run a query within a React component, call `useGetEventsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEventsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEventsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetEventsQuery(baseOptions?: Apollo.QueryHookOptions<GetEventsQuery, GetEventsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetEventsQuery, GetEventsQueryVariables>(GetEventsDocument, options);
      }
export function useGetEventsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetEventsQuery, GetEventsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetEventsQuery, GetEventsQueryVariables>(GetEventsDocument, options);
        }
// @ts-ignore
export function useGetEventsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetEventsQuery, GetEventsQueryVariables>): Apollo.UseSuspenseQueryResult<GetEventsQuery, GetEventsQueryVariables>;
export function useGetEventsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetEventsQuery, GetEventsQueryVariables>): Apollo.UseSuspenseQueryResult<GetEventsQuery | undefined, GetEventsQueryVariables>;
export function useGetEventsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetEventsQuery, GetEventsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetEventsQuery, GetEventsQueryVariables>(GetEventsDocument, options);
        }
export type GetEventsQueryHookResult = ReturnType<typeof useGetEventsQuery>;
export type GetEventsLazyQueryHookResult = ReturnType<typeof useGetEventsLazyQuery>;
export type GetEventsSuspenseQueryHookResult = ReturnType<typeof useGetEventsSuspenseQuery>;
export type GetEventsQueryResult = Apollo.QueryResult<GetEventsQuery, GetEventsQueryVariables>;
export const GetMyEventsDocument = gql`
    query GetMyEvents {
  myEvents {
    id
    title
    description
    startDate
    endDate
    location
    creator {
      id
      name
    }
    followers {
      id
      name
    }
    participants {
      id
      name
    }
  }
}
    `;

/**
 * __useGetMyEventsQuery__
 *
 * To run a query within a React component, call `useGetMyEventsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMyEventsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMyEventsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetMyEventsQuery(baseOptions?: Apollo.QueryHookOptions<GetMyEventsQuery, GetMyEventsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetMyEventsQuery, GetMyEventsQueryVariables>(GetMyEventsDocument, options);
      }
export function useGetMyEventsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMyEventsQuery, GetMyEventsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetMyEventsQuery, GetMyEventsQueryVariables>(GetMyEventsDocument, options);
        }
// @ts-ignore
export function useGetMyEventsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetMyEventsQuery, GetMyEventsQueryVariables>): Apollo.UseSuspenseQueryResult<GetMyEventsQuery, GetMyEventsQueryVariables>;
export function useGetMyEventsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetMyEventsQuery, GetMyEventsQueryVariables>): Apollo.UseSuspenseQueryResult<GetMyEventsQuery | undefined, GetMyEventsQueryVariables>;
export function useGetMyEventsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetMyEventsQuery, GetMyEventsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetMyEventsQuery, GetMyEventsQueryVariables>(GetMyEventsDocument, options);
        }
export type GetMyEventsQueryHookResult = ReturnType<typeof useGetMyEventsQuery>;
export type GetMyEventsLazyQueryHookResult = ReturnType<typeof useGetMyEventsLazyQuery>;
export type GetMyEventsSuspenseQueryHookResult = ReturnType<typeof useGetMyEventsSuspenseQuery>;
export type GetMyEventsQueryResult = Apollo.QueryResult<GetMyEventsQuery, GetMyEventsQueryVariables>;
export const GetJoinedEventsDocument = gql`
    query GetJoinedEvents {
  joinedEvents {
    id
    title
    description
    startDate
    endDate
    location
    creator {
      id
      name
    }
    followers {
      id
      name
    }
    participants {
      id
      name
    }
  }
}
    `;

/**
 * __useGetJoinedEventsQuery__
 *
 * To run a query within a React component, call `useGetJoinedEventsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetJoinedEventsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetJoinedEventsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetJoinedEventsQuery(baseOptions?: Apollo.QueryHookOptions<GetJoinedEventsQuery, GetJoinedEventsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetJoinedEventsQuery, GetJoinedEventsQueryVariables>(GetJoinedEventsDocument, options);
      }
export function useGetJoinedEventsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetJoinedEventsQuery, GetJoinedEventsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetJoinedEventsQuery, GetJoinedEventsQueryVariables>(GetJoinedEventsDocument, options);
        }
// @ts-ignore
export function useGetJoinedEventsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetJoinedEventsQuery, GetJoinedEventsQueryVariables>): Apollo.UseSuspenseQueryResult<GetJoinedEventsQuery, GetJoinedEventsQueryVariables>;
export function useGetJoinedEventsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetJoinedEventsQuery, GetJoinedEventsQueryVariables>): Apollo.UseSuspenseQueryResult<GetJoinedEventsQuery | undefined, GetJoinedEventsQueryVariables>;
export function useGetJoinedEventsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetJoinedEventsQuery, GetJoinedEventsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetJoinedEventsQuery, GetJoinedEventsQueryVariables>(GetJoinedEventsDocument, options);
        }
export type GetJoinedEventsQueryHookResult = ReturnType<typeof useGetJoinedEventsQuery>;
export type GetJoinedEventsLazyQueryHookResult = ReturnType<typeof useGetJoinedEventsLazyQuery>;
export type GetJoinedEventsSuspenseQueryHookResult = ReturnType<typeof useGetJoinedEventsSuspenseQuery>;
export type GetJoinedEventsQueryResult = Apollo.QueryResult<GetJoinedEventsQuery, GetJoinedEventsQueryVariables>;
export const GetFollowedEventsDocument = gql`
    query GetFollowedEvents {
  followedEvents {
    id
    title
    description
    startDate
    endDate
    location
    creator {
      id
      name
    }
    followers {
      id
      name
    }
    participants {
      id
      name
    }
  }
}
    `;

/**
 * __useGetFollowedEventsQuery__
 *
 * To run a query within a React component, call `useGetFollowedEventsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFollowedEventsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFollowedEventsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetFollowedEventsQuery(baseOptions?: Apollo.QueryHookOptions<GetFollowedEventsQuery, GetFollowedEventsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFollowedEventsQuery, GetFollowedEventsQueryVariables>(GetFollowedEventsDocument, options);
      }
export function useGetFollowedEventsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFollowedEventsQuery, GetFollowedEventsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFollowedEventsQuery, GetFollowedEventsQueryVariables>(GetFollowedEventsDocument, options);
        }
// @ts-ignore
export function useGetFollowedEventsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetFollowedEventsQuery, GetFollowedEventsQueryVariables>): Apollo.UseSuspenseQueryResult<GetFollowedEventsQuery, GetFollowedEventsQueryVariables>;
export function useGetFollowedEventsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFollowedEventsQuery, GetFollowedEventsQueryVariables>): Apollo.UseSuspenseQueryResult<GetFollowedEventsQuery | undefined, GetFollowedEventsQueryVariables>;
export function useGetFollowedEventsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFollowedEventsQuery, GetFollowedEventsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetFollowedEventsQuery, GetFollowedEventsQueryVariables>(GetFollowedEventsDocument, options);
        }
export type GetFollowedEventsQueryHookResult = ReturnType<typeof useGetFollowedEventsQuery>;
export type GetFollowedEventsLazyQueryHookResult = ReturnType<typeof useGetFollowedEventsLazyQuery>;
export type GetFollowedEventsSuspenseQueryHookResult = ReturnType<typeof useGetFollowedEventsSuspenseQuery>;
export type GetFollowedEventsQueryResult = Apollo.QueryResult<GetFollowedEventsQuery, GetFollowedEventsQueryVariables>;
export const CreateEventDocument = gql`
    mutation CreateEvent($title: String!, $description: String, $startDate: String!, $endDate: String!, $location: String, $autoFollow: Boolean) {
  createEvent(
    title: $title
    description: $description
    startDate: $startDate
    endDate: $endDate
    location: $location
    autoFollow: $autoFollow
  ) {
    id
    title
  }
}
    `;
export type CreateEventMutationFn = Apollo.MutationFunction<CreateEventMutation, CreateEventMutationVariables>;

/**
 * __useCreateEventMutation__
 *
 * To run a mutation, you first call `useCreateEventMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateEventMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createEventMutation, { data, loading, error }] = useCreateEventMutation({
 *   variables: {
 *      title: // value for 'title'
 *      description: // value for 'description'
 *      startDate: // value for 'startDate'
 *      endDate: // value for 'endDate'
 *      location: // value for 'location'
 *      autoFollow: // value for 'autoFollow'
 *   },
 * });
 */
export function useCreateEventMutation(baseOptions?: Apollo.MutationHookOptions<CreateEventMutation, CreateEventMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateEventMutation, CreateEventMutationVariables>(CreateEventDocument, options);
      }
export type CreateEventMutationHookResult = ReturnType<typeof useCreateEventMutation>;
export type CreateEventMutationResult = Apollo.MutationResult<CreateEventMutation>;
export type CreateEventMutationOptions = Apollo.BaseMutationOptions<CreateEventMutation, CreateEventMutationVariables>;
export const JoinEventDocument = gql`
    mutation JoinEvent($id: ID!) {
  joinEvent(id: $id) {
    id
  }
}
    `;
export type JoinEventMutationFn = Apollo.MutationFunction<JoinEventMutation, JoinEventMutationVariables>;

/**
 * __useJoinEventMutation__
 *
 * To run a mutation, you first call `useJoinEventMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useJoinEventMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [joinEventMutation, { data, loading, error }] = useJoinEventMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useJoinEventMutation(baseOptions?: Apollo.MutationHookOptions<JoinEventMutation, JoinEventMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<JoinEventMutation, JoinEventMutationVariables>(JoinEventDocument, options);
      }
export type JoinEventMutationHookResult = ReturnType<typeof useJoinEventMutation>;
export type JoinEventMutationResult = Apollo.MutationResult<JoinEventMutation>;
export type JoinEventMutationOptions = Apollo.BaseMutationOptions<JoinEventMutation, JoinEventMutationVariables>;
export const LeaveEventDocument = gql`
    mutation LeaveEvent($id: ID!) {
  leaveEvent(id: $id) {
    id
  }
}
    `;
export type LeaveEventMutationFn = Apollo.MutationFunction<LeaveEventMutation, LeaveEventMutationVariables>;

/**
 * __useLeaveEventMutation__
 *
 * To run a mutation, you first call `useLeaveEventMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLeaveEventMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [leaveEventMutation, { data, loading, error }] = useLeaveEventMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useLeaveEventMutation(baseOptions?: Apollo.MutationHookOptions<LeaveEventMutation, LeaveEventMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LeaveEventMutation, LeaveEventMutationVariables>(LeaveEventDocument, options);
      }
export type LeaveEventMutationHookResult = ReturnType<typeof useLeaveEventMutation>;
export type LeaveEventMutationResult = Apollo.MutationResult<LeaveEventMutation>;
export type LeaveEventMutationOptions = Apollo.BaseMutationOptions<LeaveEventMutation, LeaveEventMutationVariables>;
export const FollowEventDocument = gql`
    mutation FollowEvent($id: ID!) {
  followEvent(id: $id) {
    id
  }
}
    `;
export type FollowEventMutationFn = Apollo.MutationFunction<FollowEventMutation, FollowEventMutationVariables>;

/**
 * __useFollowEventMutation__
 *
 * To run a mutation, you first call `useFollowEventMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useFollowEventMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [followEventMutation, { data, loading, error }] = useFollowEventMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useFollowEventMutation(baseOptions?: Apollo.MutationHookOptions<FollowEventMutation, FollowEventMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<FollowEventMutation, FollowEventMutationVariables>(FollowEventDocument, options);
      }
export type FollowEventMutationHookResult = ReturnType<typeof useFollowEventMutation>;
export type FollowEventMutationResult = Apollo.MutationResult<FollowEventMutation>;
export type FollowEventMutationOptions = Apollo.BaseMutationOptions<FollowEventMutation, FollowEventMutationVariables>;
export const UnfollowEventDocument = gql`
    mutation UnfollowEvent($id: ID!) {
  unfollowEvent(id: $id) {
    id
  }
}
    `;
export type UnfollowEventMutationFn = Apollo.MutationFunction<UnfollowEventMutation, UnfollowEventMutationVariables>;

/**
 * __useUnfollowEventMutation__
 *
 * To run a mutation, you first call `useUnfollowEventMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUnfollowEventMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [unfollowEventMutation, { data, loading, error }] = useUnfollowEventMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useUnfollowEventMutation(baseOptions?: Apollo.MutationHookOptions<UnfollowEventMutation, UnfollowEventMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UnfollowEventMutation, UnfollowEventMutationVariables>(UnfollowEventDocument, options);
      }
export type UnfollowEventMutationHookResult = ReturnType<typeof useUnfollowEventMutation>;
export type UnfollowEventMutationResult = Apollo.MutationResult<UnfollowEventMutation>;
export type UnfollowEventMutationOptions = Apollo.BaseMutationOptions<UnfollowEventMutation, UnfollowEventMutationVariables>;
export const DeleteEventDocument = gql`
    mutation DeleteEvent($id: ID!) {
  deleteEvent(id: $id)
}
    `;
export type DeleteEventMutationFn = Apollo.MutationFunction<DeleteEventMutation, DeleteEventMutationVariables>;

/**
 * __useDeleteEventMutation__
 *
 * To run a mutation, you first call `useDeleteEventMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteEventMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteEventMutation, { data, loading, error }] = useDeleteEventMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteEventMutation(baseOptions?: Apollo.MutationHookOptions<DeleteEventMutation, DeleteEventMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteEventMutation, DeleteEventMutationVariables>(DeleteEventDocument, options);
      }
export type DeleteEventMutationHookResult = ReturnType<typeof useDeleteEventMutation>;
export type DeleteEventMutationResult = Apollo.MutationResult<DeleteEventMutation>;
export type DeleteEventMutationOptions = Apollo.BaseMutationOptions<DeleteEventMutation, DeleteEventMutationVariables>;
export const LoginWithGoogleDocument = gql`
    mutation LoginWithGoogle($code: String!) {
  loginWithGoogle(code: $code) {
    id
    name
    email
    picture
  }
}
    `;
export type LoginWithGoogleMutationFn = Apollo.MutationFunction<LoginWithGoogleMutation, LoginWithGoogleMutationVariables>;

/**
 * __useLoginWithGoogleMutation__
 *
 * To run a mutation, you first call `useLoginWithGoogleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginWithGoogleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginWithGoogleMutation, { data, loading, error }] = useLoginWithGoogleMutation({
 *   variables: {
 *      code: // value for 'code'
 *   },
 * });
 */
export function useLoginWithGoogleMutation(baseOptions?: Apollo.MutationHookOptions<LoginWithGoogleMutation, LoginWithGoogleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LoginWithGoogleMutation, LoginWithGoogleMutationVariables>(LoginWithGoogleDocument, options);
      }
export type LoginWithGoogleMutationHookResult = ReturnType<typeof useLoginWithGoogleMutation>;
export type LoginWithGoogleMutationResult = Apollo.MutationResult<LoginWithGoogleMutation>;
export type LoginWithGoogleMutationOptions = Apollo.BaseMutationOptions<LoginWithGoogleMutation, LoginWithGoogleMutationVariables>;
export const MeDocument = gql`
    query Me {
  me {
    id
    name
    email
    picture
  }
}
    `;

/**
 * __useMeQuery__
 *
 * To run a query within a React component, call `useMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useMeQuery(baseOptions?: Apollo.QueryHookOptions<MeQuery, MeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MeQuery, MeQueryVariables>(MeDocument, options);
      }
export function useMeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
// @ts-ignore
export function useMeSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>): Apollo.UseSuspenseQueryResult<MeQuery, MeQueryVariables>;
export function useMeSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>): Apollo.UseSuspenseQueryResult<MeQuery | undefined, MeQueryVariables>;
export function useMeSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeSuspenseQueryHookResult = ReturnType<typeof useMeSuspenseQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;