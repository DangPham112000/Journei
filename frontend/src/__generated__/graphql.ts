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

export type AssistantResponse = {
  __typename?: 'AssistantResponse';
  draftEvent?: Maybe<DraftEvent>;
  text: Scalars['String']['output'];
};

export type Category = {
  __typename?: 'Category';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type Destination = {
  __typename?: 'Destination';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type DraftEvent = {
  __typename?: 'DraftEvent';
  description?: Maybe<Scalars['String']['output']>;
  endDate: Scalars['String']['output'];
  location?: Maybe<Scalars['String']['output']>;
  startDate: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type MessageInput = {
  parts: Array<MessagePartInput>;
  role: Scalars['String']['input'];
};

export type MessagePartInput = {
  text: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  askAssistant: AssistantResponse;
  createCategory: Category;
  createDestination: Destination;
  createPlace: Place;
  createPlan: Plan;
  createScheduledActivity: ScheduledActivity;
  deletePlace: Scalars['Boolean']['output'];
  deletePlan: Scalars['Boolean']['output'];
  deleteScheduledActivity: Scalars['Boolean']['output'];
  loginWithGoogle: User;
  updatePlace: Place;
  updatePlan: Plan;
  updateScheduledActivity: ScheduledActivity;
};


export type MutationAskAssistantArgs = {
  history?: InputMaybe<Array<MessageInput>>;
  message: Scalars['String']['input'];
};


export type MutationCreateCategoryArgs = {
  name: Scalars['String']['input'];
};


export type MutationCreateDestinationArgs = {
  name: Scalars['String']['input'];
};


export type MutationCreatePlaceArgs = {
  categoryId: Scalars['ID']['input'];
  destinationId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  planId: Scalars['ID']['input'];
  priceRange?: InputMaybe<Scalars['String']['input']>;
  reviewLinks?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type MutationCreatePlanArgs = {
  destinationIds: Array<Scalars['ID']['input']>;
  endDate: Scalars['String']['input'];
  startDate: Scalars['String']['input'];
  title: Scalars['String']['input'];
};


export type MutationCreateScheduledActivityArgs = {
  endTime: Scalars['String']['input'];
  placeId: Scalars['ID']['input'];
  startTime: Scalars['String']['input'];
};


export type MutationDeletePlaceArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeletePlanArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteScheduledActivityArgs = {
  id: Scalars['ID']['input'];
};


export type MutationLoginWithGoogleArgs = {
  code: Scalars['String']['input'];
};


export type MutationUpdatePlaceArgs = {
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  priceRange?: InputMaybe<Scalars['String']['input']>;
  reviewLinks?: InputMaybe<Array<Scalars['String']['input']>>;
  visitStatus?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdatePlanArgs = {
  destinationIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  startDate?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateScheduledActivityArgs = {
  endTime?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  placeId?: InputMaybe<Scalars['ID']['input']>;
  startTime?: InputMaybe<Scalars['String']['input']>;
};

export type Place = {
  __typename?: 'Place';
  category: Category;
  destination: Destination;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  planId: Scalars['ID']['output'];
  priceRange?: Maybe<Scalars['String']['output']>;
  reviewLinks: Array<Scalars['String']['output']>;
  visitStatus: Scalars['String']['output'];
};

export type Plan = {
  __typename?: 'Plan';
  destinations: Array<Destination>;
  endDate: Scalars['String']['output'];
  googleEventId?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  startDate: Scalars['String']['output'];
  title: Scalars['String']['output'];
  userId: Scalars['ID']['output'];
};

export type Query = {
  __typename?: 'Query';
  categories: Array<Category>;
  destinations: Array<Destination>;
  hello: Scalars['String']['output'];
  me?: Maybe<User>;
  myPlans: Array<Plan>;
  placesForPlan: Array<Place>;
  plan?: Maybe<Plan>;
  recommendedPlaces: Array<Place>;
  scheduledActivitiesForPlan: Array<ScheduledActivity>;
};


export type QueryPlacesForPlanArgs = {
  planId: Scalars['ID']['input'];
};


export type QueryPlanArgs = {
  id: Scalars['ID']['input'];
};


export type QueryRecommendedPlacesArgs = {
  destinationId: Scalars['ID']['input'];
};


export type QueryScheduledActivitiesForPlanArgs = {
  planId: Scalars['ID']['input'];
};

export type ScheduledActivity = {
  __typename?: 'ScheduledActivity';
  endTime: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  place: Place;
  startTime: Scalars['String']['output'];
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

export type LoginWithGoogleMutationVariables = Exact<{
  code: string;
}>;


export type LoginWithGoogleMutation = { loginWithGoogle: { id: string, name: string, email: string, picture: string | null } };

export type GetMyPlansQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyPlansQuery = { myPlans: Array<{ id: string, title: string, startDate: string, endDate: string, destinations: Array<{ id: string, name: string }> }> };

export type GetPlanQueryVariables = Exact<{
  id: string | number;
}>;


export type GetPlanQuery = { plan: { id: string, title: string, startDate: string, endDate: string, destinations: Array<{ id: string, name: string }> } | null };

export type GetDestinationsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDestinationsQuery = { destinations: Array<{ id: string, name: string }> };

export type GetCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCategoriesQuery = { categories: Array<{ id: string, name: string }> };

export type CreatePlanMutationVariables = Exact<{
  title: string;
  startDate: string;
  endDate: string;
  destinationIds: Array<string | number> | string | number;
}>;


export type CreatePlanMutation = { createPlan: { id: string, title: string, startDate: string, endDate: string, destinations: Array<{ id: string, name: string }> } };

export type DeletePlanMutationVariables = Exact<{
  id: string | number;
}>;


export type DeletePlanMutation = { deletePlan: boolean };

export type GetPlacesForPlanQueryVariables = Exact<{
  planId: string | number;
}>;


export type GetPlacesForPlanQuery = { placesForPlan: Array<{ id: string, name: string, priceRange: string | null, reviewLinks: Array<string>, notes: string | null, visitStatus: string, destination: { id: string, name: string }, category: { id: string, name: string } }> };

export type GetRecommendedPlacesQueryVariables = Exact<{
  destinationId: string | number;
}>;


export type GetRecommendedPlacesQuery = { recommendedPlaces: Array<{ id: string, name: string, priceRange: string | null, reviewLinks: Array<string>, notes: string | null, category: { id: string, name: string } }> };

export type CreatePlaceMutationVariables = Exact<{
  name: string;
  planId: string | number;
  destinationId: string | number;
  categoryId: string | number;
  priceRange?: string | null | undefined;
  reviewLinks?: Array<string> | string | null | undefined;
  notes?: string | null | undefined;
}>;


export type CreatePlaceMutation = { createPlace: { id: string, name: string } };

export type GetScheduledActivitiesForPlanQueryVariables = Exact<{
  planId: string | number;
}>;


export type GetScheduledActivitiesForPlanQuery = { scheduledActivitiesForPlan: Array<{ id: string, startTime: string, endTime: string, place: { id: string, name: string, category: { name: string }, destination: { name: string } } }> };

export type CreateScheduledActivityMutationVariables = Exact<{
  placeId: string | number;
  startTime: string;
  endTime: string;
}>;


export type CreateScheduledActivityMutation = { createScheduledActivity: { id: string, startTime: string, endTime: string, place: { id: string, name: string } } };

export type DeleteScheduledActivityMutationVariables = Exact<{
  id: string | number;
}>;


export type DeleteScheduledActivityMutation = { deleteScheduledActivity: boolean };

export type UpdatePlaceVisitStatusMutationVariables = Exact<{
  id: string | number;
  visitStatus: string;
}>;


export type UpdatePlaceVisitStatusMutation = { updatePlace: { id: string, visitStatus: string } };

export type CreateCategoryMutationVariables = Exact<{
  name: string;
}>;


export type CreateCategoryMutation = { createCategory: { id: string, name: string } };

export type CreateDestinationMutationVariables = Exact<{
  name: string;
}>;


export type CreateDestinationMutation = { createDestination: { id: string, name: string } };

export type UpdateScheduledActivityMutationVariables = Exact<{
  id: string | number;
  placeId?: string | number | null | undefined;
  startTime?: string | null | undefined;
  endTime?: string | null | undefined;
}>;


export type UpdateScheduledActivityMutation = { updateScheduledActivity: { id: string, startTime: string, endTime: string, place: { id: string, name: string } } };

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
export const GetMyPlansDocument = gql`
    query GetMyPlans {
  myPlans {
    id
    title
    startDate
    endDate
    destinations {
      id
      name
    }
  }
}
    `;

/**
 * __useGetMyPlansQuery__
 *
 * To run a query within a React component, call `useGetMyPlansQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMyPlansQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMyPlansQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetMyPlansQuery(baseOptions?: Apollo.QueryHookOptions<GetMyPlansQuery, GetMyPlansQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetMyPlansQuery, GetMyPlansQueryVariables>(GetMyPlansDocument, options);
      }
export function useGetMyPlansLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMyPlansQuery, GetMyPlansQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetMyPlansQuery, GetMyPlansQueryVariables>(GetMyPlansDocument, options);
        }
// @ts-ignore
export function useGetMyPlansSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetMyPlansQuery, GetMyPlansQueryVariables>): Apollo.UseSuspenseQueryResult<GetMyPlansQuery, GetMyPlansQueryVariables>;
export function useGetMyPlansSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetMyPlansQuery, GetMyPlansQueryVariables>): Apollo.UseSuspenseQueryResult<GetMyPlansQuery | undefined, GetMyPlansQueryVariables>;
export function useGetMyPlansSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetMyPlansQuery, GetMyPlansQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetMyPlansQuery, GetMyPlansQueryVariables>(GetMyPlansDocument, options);
        }
export type GetMyPlansQueryHookResult = ReturnType<typeof useGetMyPlansQuery>;
export type GetMyPlansLazyQueryHookResult = ReturnType<typeof useGetMyPlansLazyQuery>;
export type GetMyPlansSuspenseQueryHookResult = ReturnType<typeof useGetMyPlansSuspenseQuery>;
export type GetMyPlansQueryResult = Apollo.QueryResult<GetMyPlansQuery, GetMyPlansQueryVariables>;
export const GetPlanDocument = gql`
    query GetPlan($id: ID!) {
  plan(id: $id) {
    id
    title
    startDate
    endDate
    destinations {
      id
      name
    }
  }
}
    `;

/**
 * __useGetPlanQuery__
 *
 * To run a query within a React component, call `useGetPlanQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPlanQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPlanQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetPlanQuery(baseOptions: Apollo.QueryHookOptions<GetPlanQuery, GetPlanQueryVariables> & ({ variables: GetPlanQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPlanQuery, GetPlanQueryVariables>(GetPlanDocument, options);
      }
export function useGetPlanLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPlanQuery, GetPlanQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPlanQuery, GetPlanQueryVariables>(GetPlanDocument, options);
        }
// @ts-ignore
export function useGetPlanSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetPlanQuery, GetPlanQueryVariables>): Apollo.UseSuspenseQueryResult<GetPlanQuery, GetPlanQueryVariables>;
export function useGetPlanSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPlanQuery, GetPlanQueryVariables>): Apollo.UseSuspenseQueryResult<GetPlanQuery | undefined, GetPlanQueryVariables>;
export function useGetPlanSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPlanQuery, GetPlanQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetPlanQuery, GetPlanQueryVariables>(GetPlanDocument, options);
        }
export type GetPlanQueryHookResult = ReturnType<typeof useGetPlanQuery>;
export type GetPlanLazyQueryHookResult = ReturnType<typeof useGetPlanLazyQuery>;
export type GetPlanSuspenseQueryHookResult = ReturnType<typeof useGetPlanSuspenseQuery>;
export type GetPlanQueryResult = Apollo.QueryResult<GetPlanQuery, GetPlanQueryVariables>;
export const GetDestinationsDocument = gql`
    query GetDestinations {
  destinations {
    id
    name
  }
}
    `;

/**
 * __useGetDestinationsQuery__
 *
 * To run a query within a React component, call `useGetDestinationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDestinationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDestinationsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetDestinationsQuery(baseOptions?: Apollo.QueryHookOptions<GetDestinationsQuery, GetDestinationsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetDestinationsQuery, GetDestinationsQueryVariables>(GetDestinationsDocument, options);
      }
export function useGetDestinationsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetDestinationsQuery, GetDestinationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetDestinationsQuery, GetDestinationsQueryVariables>(GetDestinationsDocument, options);
        }
// @ts-ignore
export function useGetDestinationsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetDestinationsQuery, GetDestinationsQueryVariables>): Apollo.UseSuspenseQueryResult<GetDestinationsQuery, GetDestinationsQueryVariables>;
export function useGetDestinationsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetDestinationsQuery, GetDestinationsQueryVariables>): Apollo.UseSuspenseQueryResult<GetDestinationsQuery | undefined, GetDestinationsQueryVariables>;
export function useGetDestinationsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetDestinationsQuery, GetDestinationsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetDestinationsQuery, GetDestinationsQueryVariables>(GetDestinationsDocument, options);
        }
export type GetDestinationsQueryHookResult = ReturnType<typeof useGetDestinationsQuery>;
export type GetDestinationsLazyQueryHookResult = ReturnType<typeof useGetDestinationsLazyQuery>;
export type GetDestinationsSuspenseQueryHookResult = ReturnType<typeof useGetDestinationsSuspenseQuery>;
export type GetDestinationsQueryResult = Apollo.QueryResult<GetDestinationsQuery, GetDestinationsQueryVariables>;
export const GetCategoriesDocument = gql`
    query GetCategories {
  categories {
    id
    name
  }
}
    `;

/**
 * __useGetCategoriesQuery__
 *
 * To run a query within a React component, call `useGetCategoriesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCategoriesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCategoriesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetCategoriesQuery(baseOptions?: Apollo.QueryHookOptions<GetCategoriesQuery, GetCategoriesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCategoriesQuery, GetCategoriesQueryVariables>(GetCategoriesDocument, options);
      }
export function useGetCategoriesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCategoriesQuery, GetCategoriesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCategoriesQuery, GetCategoriesQueryVariables>(GetCategoriesDocument, options);
        }
// @ts-ignore
export function useGetCategoriesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetCategoriesQuery, GetCategoriesQueryVariables>): Apollo.UseSuspenseQueryResult<GetCategoriesQuery, GetCategoriesQueryVariables>;
export function useGetCategoriesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCategoriesQuery, GetCategoriesQueryVariables>): Apollo.UseSuspenseQueryResult<GetCategoriesQuery | undefined, GetCategoriesQueryVariables>;
export function useGetCategoriesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCategoriesQuery, GetCategoriesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetCategoriesQuery, GetCategoriesQueryVariables>(GetCategoriesDocument, options);
        }
export type GetCategoriesQueryHookResult = ReturnType<typeof useGetCategoriesQuery>;
export type GetCategoriesLazyQueryHookResult = ReturnType<typeof useGetCategoriesLazyQuery>;
export type GetCategoriesSuspenseQueryHookResult = ReturnType<typeof useGetCategoriesSuspenseQuery>;
export type GetCategoriesQueryResult = Apollo.QueryResult<GetCategoriesQuery, GetCategoriesQueryVariables>;
export const CreatePlanDocument = gql`
    mutation CreatePlan($title: String!, $startDate: String!, $endDate: String!, $destinationIds: [ID!]!) {
  createPlan(
    title: $title
    startDate: $startDate
    endDate: $endDate
    destinationIds: $destinationIds
  ) {
    id
    title
    startDate
    endDate
    destinations {
      id
      name
    }
  }
}
    `;
export type CreatePlanMutationFn = Apollo.MutationFunction<CreatePlanMutation, CreatePlanMutationVariables>;

/**
 * __useCreatePlanMutation__
 *
 * To run a mutation, you first call `useCreatePlanMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreatePlanMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createPlanMutation, { data, loading, error }] = useCreatePlanMutation({
 *   variables: {
 *      title: // value for 'title'
 *      startDate: // value for 'startDate'
 *      endDate: // value for 'endDate'
 *      destinationIds: // value for 'destinationIds'
 *   },
 * });
 */
export function useCreatePlanMutation(baseOptions?: Apollo.MutationHookOptions<CreatePlanMutation, CreatePlanMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreatePlanMutation, CreatePlanMutationVariables>(CreatePlanDocument, options);
      }
export type CreatePlanMutationHookResult = ReturnType<typeof useCreatePlanMutation>;
export type CreatePlanMutationResult = Apollo.MutationResult<CreatePlanMutation>;
export type CreatePlanMutationOptions = Apollo.BaseMutationOptions<CreatePlanMutation, CreatePlanMutationVariables>;
export const DeletePlanDocument = gql`
    mutation DeletePlan($id: ID!) {
  deletePlan(id: $id)
}
    `;
export type DeletePlanMutationFn = Apollo.MutationFunction<DeletePlanMutation, DeletePlanMutationVariables>;

/**
 * __useDeletePlanMutation__
 *
 * To run a mutation, you first call `useDeletePlanMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeletePlanMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deletePlanMutation, { data, loading, error }] = useDeletePlanMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeletePlanMutation(baseOptions?: Apollo.MutationHookOptions<DeletePlanMutation, DeletePlanMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeletePlanMutation, DeletePlanMutationVariables>(DeletePlanDocument, options);
      }
export type DeletePlanMutationHookResult = ReturnType<typeof useDeletePlanMutation>;
export type DeletePlanMutationResult = Apollo.MutationResult<DeletePlanMutation>;
export type DeletePlanMutationOptions = Apollo.BaseMutationOptions<DeletePlanMutation, DeletePlanMutationVariables>;
export const GetPlacesForPlanDocument = gql`
    query GetPlacesForPlan($planId: ID!) {
  placesForPlan(planId: $planId) {
    id
    name
    priceRange
    reviewLinks
    notes
    visitStatus
    destination {
      id
      name
    }
    category {
      id
      name
    }
  }
}
    `;

/**
 * __useGetPlacesForPlanQuery__
 *
 * To run a query within a React component, call `useGetPlacesForPlanQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPlacesForPlanQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPlacesForPlanQuery({
 *   variables: {
 *      planId: // value for 'planId'
 *   },
 * });
 */
export function useGetPlacesForPlanQuery(baseOptions: Apollo.QueryHookOptions<GetPlacesForPlanQuery, GetPlacesForPlanQueryVariables> & ({ variables: GetPlacesForPlanQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPlacesForPlanQuery, GetPlacesForPlanQueryVariables>(GetPlacesForPlanDocument, options);
      }
export function useGetPlacesForPlanLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPlacesForPlanQuery, GetPlacesForPlanQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPlacesForPlanQuery, GetPlacesForPlanQueryVariables>(GetPlacesForPlanDocument, options);
        }
// @ts-ignore
export function useGetPlacesForPlanSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetPlacesForPlanQuery, GetPlacesForPlanQueryVariables>): Apollo.UseSuspenseQueryResult<GetPlacesForPlanQuery, GetPlacesForPlanQueryVariables>;
export function useGetPlacesForPlanSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPlacesForPlanQuery, GetPlacesForPlanQueryVariables>): Apollo.UseSuspenseQueryResult<GetPlacesForPlanQuery | undefined, GetPlacesForPlanQueryVariables>;
export function useGetPlacesForPlanSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPlacesForPlanQuery, GetPlacesForPlanQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetPlacesForPlanQuery, GetPlacesForPlanQueryVariables>(GetPlacesForPlanDocument, options);
        }
export type GetPlacesForPlanQueryHookResult = ReturnType<typeof useGetPlacesForPlanQuery>;
export type GetPlacesForPlanLazyQueryHookResult = ReturnType<typeof useGetPlacesForPlanLazyQuery>;
export type GetPlacesForPlanSuspenseQueryHookResult = ReturnType<typeof useGetPlacesForPlanSuspenseQuery>;
export type GetPlacesForPlanQueryResult = Apollo.QueryResult<GetPlacesForPlanQuery, GetPlacesForPlanQueryVariables>;
export const GetRecommendedPlacesDocument = gql`
    query GetRecommendedPlaces($destinationId: ID!) {
  recommendedPlaces(destinationId: $destinationId) {
    id
    name
    priceRange
    reviewLinks
    notes
    category {
      id
      name
    }
  }
}
    `;

/**
 * __useGetRecommendedPlacesQuery__
 *
 * To run a query within a React component, call `useGetRecommendedPlacesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRecommendedPlacesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRecommendedPlacesQuery({
 *   variables: {
 *      destinationId: // value for 'destinationId'
 *   },
 * });
 */
export function useGetRecommendedPlacesQuery(baseOptions: Apollo.QueryHookOptions<GetRecommendedPlacesQuery, GetRecommendedPlacesQueryVariables> & ({ variables: GetRecommendedPlacesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRecommendedPlacesQuery, GetRecommendedPlacesQueryVariables>(GetRecommendedPlacesDocument, options);
      }
export function useGetRecommendedPlacesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRecommendedPlacesQuery, GetRecommendedPlacesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRecommendedPlacesQuery, GetRecommendedPlacesQueryVariables>(GetRecommendedPlacesDocument, options);
        }
// @ts-ignore
export function useGetRecommendedPlacesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetRecommendedPlacesQuery, GetRecommendedPlacesQueryVariables>): Apollo.UseSuspenseQueryResult<GetRecommendedPlacesQuery, GetRecommendedPlacesQueryVariables>;
export function useGetRecommendedPlacesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRecommendedPlacesQuery, GetRecommendedPlacesQueryVariables>): Apollo.UseSuspenseQueryResult<GetRecommendedPlacesQuery | undefined, GetRecommendedPlacesQueryVariables>;
export function useGetRecommendedPlacesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRecommendedPlacesQuery, GetRecommendedPlacesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetRecommendedPlacesQuery, GetRecommendedPlacesQueryVariables>(GetRecommendedPlacesDocument, options);
        }
export type GetRecommendedPlacesQueryHookResult = ReturnType<typeof useGetRecommendedPlacesQuery>;
export type GetRecommendedPlacesLazyQueryHookResult = ReturnType<typeof useGetRecommendedPlacesLazyQuery>;
export type GetRecommendedPlacesSuspenseQueryHookResult = ReturnType<typeof useGetRecommendedPlacesSuspenseQuery>;
export type GetRecommendedPlacesQueryResult = Apollo.QueryResult<GetRecommendedPlacesQuery, GetRecommendedPlacesQueryVariables>;
export const CreatePlaceDocument = gql`
    mutation CreatePlace($name: String!, $planId: ID!, $destinationId: ID!, $categoryId: ID!, $priceRange: String, $reviewLinks: [String!], $notes: String) {
  createPlace(
    name: $name
    planId: $planId
    destinationId: $destinationId
    categoryId: $categoryId
    priceRange: $priceRange
    reviewLinks: $reviewLinks
    notes: $notes
  ) {
    id
    name
  }
}
    `;
export type CreatePlaceMutationFn = Apollo.MutationFunction<CreatePlaceMutation, CreatePlaceMutationVariables>;

/**
 * __useCreatePlaceMutation__
 *
 * To run a mutation, you first call `useCreatePlaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreatePlaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createPlaceMutation, { data, loading, error }] = useCreatePlaceMutation({
 *   variables: {
 *      name: // value for 'name'
 *      planId: // value for 'planId'
 *      destinationId: // value for 'destinationId'
 *      categoryId: // value for 'categoryId'
 *      priceRange: // value for 'priceRange'
 *      reviewLinks: // value for 'reviewLinks'
 *      notes: // value for 'notes'
 *   },
 * });
 */
export function useCreatePlaceMutation(baseOptions?: Apollo.MutationHookOptions<CreatePlaceMutation, CreatePlaceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreatePlaceMutation, CreatePlaceMutationVariables>(CreatePlaceDocument, options);
      }
export type CreatePlaceMutationHookResult = ReturnType<typeof useCreatePlaceMutation>;
export type CreatePlaceMutationResult = Apollo.MutationResult<CreatePlaceMutation>;
export type CreatePlaceMutationOptions = Apollo.BaseMutationOptions<CreatePlaceMutation, CreatePlaceMutationVariables>;
export const GetScheduledActivitiesForPlanDocument = gql`
    query GetScheduledActivitiesForPlan($planId: ID!) {
  scheduledActivitiesForPlan(planId: $planId) {
    id
    startTime
    endTime
    place {
      id
      name
      category {
        name
      }
      destination {
        name
      }
    }
  }
}
    `;

/**
 * __useGetScheduledActivitiesForPlanQuery__
 *
 * To run a query within a React component, call `useGetScheduledActivitiesForPlanQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetScheduledActivitiesForPlanQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetScheduledActivitiesForPlanQuery({
 *   variables: {
 *      planId: // value for 'planId'
 *   },
 * });
 */
export function useGetScheduledActivitiesForPlanQuery(baseOptions: Apollo.QueryHookOptions<GetScheduledActivitiesForPlanQuery, GetScheduledActivitiesForPlanQueryVariables> & ({ variables: GetScheduledActivitiesForPlanQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetScheduledActivitiesForPlanQuery, GetScheduledActivitiesForPlanQueryVariables>(GetScheduledActivitiesForPlanDocument, options);
      }
export function useGetScheduledActivitiesForPlanLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetScheduledActivitiesForPlanQuery, GetScheduledActivitiesForPlanQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetScheduledActivitiesForPlanQuery, GetScheduledActivitiesForPlanQueryVariables>(GetScheduledActivitiesForPlanDocument, options);
        }
// @ts-ignore
export function useGetScheduledActivitiesForPlanSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetScheduledActivitiesForPlanQuery, GetScheduledActivitiesForPlanQueryVariables>): Apollo.UseSuspenseQueryResult<GetScheduledActivitiesForPlanQuery, GetScheduledActivitiesForPlanQueryVariables>;
export function useGetScheduledActivitiesForPlanSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetScheduledActivitiesForPlanQuery, GetScheduledActivitiesForPlanQueryVariables>): Apollo.UseSuspenseQueryResult<GetScheduledActivitiesForPlanQuery | undefined, GetScheduledActivitiesForPlanQueryVariables>;
export function useGetScheduledActivitiesForPlanSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetScheduledActivitiesForPlanQuery, GetScheduledActivitiesForPlanQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetScheduledActivitiesForPlanQuery, GetScheduledActivitiesForPlanQueryVariables>(GetScheduledActivitiesForPlanDocument, options);
        }
export type GetScheduledActivitiesForPlanQueryHookResult = ReturnType<typeof useGetScheduledActivitiesForPlanQuery>;
export type GetScheduledActivitiesForPlanLazyQueryHookResult = ReturnType<typeof useGetScheduledActivitiesForPlanLazyQuery>;
export type GetScheduledActivitiesForPlanSuspenseQueryHookResult = ReturnType<typeof useGetScheduledActivitiesForPlanSuspenseQuery>;
export type GetScheduledActivitiesForPlanQueryResult = Apollo.QueryResult<GetScheduledActivitiesForPlanQuery, GetScheduledActivitiesForPlanQueryVariables>;
export const CreateScheduledActivityDocument = gql`
    mutation CreateScheduledActivity($placeId: ID!, $startTime: String!, $endTime: String!) {
  createScheduledActivity(
    placeId: $placeId
    startTime: $startTime
    endTime: $endTime
  ) {
    id
    startTime
    endTime
    place {
      id
      name
    }
  }
}
    `;
export type CreateScheduledActivityMutationFn = Apollo.MutationFunction<CreateScheduledActivityMutation, CreateScheduledActivityMutationVariables>;

/**
 * __useCreateScheduledActivityMutation__
 *
 * To run a mutation, you first call `useCreateScheduledActivityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateScheduledActivityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createScheduledActivityMutation, { data, loading, error }] = useCreateScheduledActivityMutation({
 *   variables: {
 *      placeId: // value for 'placeId'
 *      startTime: // value for 'startTime'
 *      endTime: // value for 'endTime'
 *   },
 * });
 */
export function useCreateScheduledActivityMutation(baseOptions?: Apollo.MutationHookOptions<CreateScheduledActivityMutation, CreateScheduledActivityMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateScheduledActivityMutation, CreateScheduledActivityMutationVariables>(CreateScheduledActivityDocument, options);
      }
export type CreateScheduledActivityMutationHookResult = ReturnType<typeof useCreateScheduledActivityMutation>;
export type CreateScheduledActivityMutationResult = Apollo.MutationResult<CreateScheduledActivityMutation>;
export type CreateScheduledActivityMutationOptions = Apollo.BaseMutationOptions<CreateScheduledActivityMutation, CreateScheduledActivityMutationVariables>;
export const DeleteScheduledActivityDocument = gql`
    mutation DeleteScheduledActivity($id: ID!) {
  deleteScheduledActivity(id: $id)
}
    `;
export type DeleteScheduledActivityMutationFn = Apollo.MutationFunction<DeleteScheduledActivityMutation, DeleteScheduledActivityMutationVariables>;

/**
 * __useDeleteScheduledActivityMutation__
 *
 * To run a mutation, you first call `useDeleteScheduledActivityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteScheduledActivityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteScheduledActivityMutation, { data, loading, error }] = useDeleteScheduledActivityMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteScheduledActivityMutation(baseOptions?: Apollo.MutationHookOptions<DeleteScheduledActivityMutation, DeleteScheduledActivityMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteScheduledActivityMutation, DeleteScheduledActivityMutationVariables>(DeleteScheduledActivityDocument, options);
      }
export type DeleteScheduledActivityMutationHookResult = ReturnType<typeof useDeleteScheduledActivityMutation>;
export type DeleteScheduledActivityMutationResult = Apollo.MutationResult<DeleteScheduledActivityMutation>;
export type DeleteScheduledActivityMutationOptions = Apollo.BaseMutationOptions<DeleteScheduledActivityMutation, DeleteScheduledActivityMutationVariables>;
export const UpdatePlaceVisitStatusDocument = gql`
    mutation UpdatePlaceVisitStatus($id: ID!, $visitStatus: String!) {
  updatePlace(id: $id, visitStatus: $visitStatus) {
    id
    visitStatus
  }
}
    `;
export type UpdatePlaceVisitStatusMutationFn = Apollo.MutationFunction<UpdatePlaceVisitStatusMutation, UpdatePlaceVisitStatusMutationVariables>;

/**
 * __useUpdatePlaceVisitStatusMutation__
 *
 * To run a mutation, you first call `useUpdatePlaceVisitStatusMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePlaceVisitStatusMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePlaceVisitStatusMutation, { data, loading, error }] = useUpdatePlaceVisitStatusMutation({
 *   variables: {
 *      id: // value for 'id'
 *      visitStatus: // value for 'visitStatus'
 *   },
 * });
 */
export function useUpdatePlaceVisitStatusMutation(baseOptions?: Apollo.MutationHookOptions<UpdatePlaceVisitStatusMutation, UpdatePlaceVisitStatusMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdatePlaceVisitStatusMutation, UpdatePlaceVisitStatusMutationVariables>(UpdatePlaceVisitStatusDocument, options);
      }
export type UpdatePlaceVisitStatusMutationHookResult = ReturnType<typeof useUpdatePlaceVisitStatusMutation>;
export type UpdatePlaceVisitStatusMutationResult = Apollo.MutationResult<UpdatePlaceVisitStatusMutation>;
export type UpdatePlaceVisitStatusMutationOptions = Apollo.BaseMutationOptions<UpdatePlaceVisitStatusMutation, UpdatePlaceVisitStatusMutationVariables>;
export const CreateCategoryDocument = gql`
    mutation CreateCategory($name: String!) {
  createCategory(name: $name) {
    id
    name
  }
}
    `;
export type CreateCategoryMutationFn = Apollo.MutationFunction<CreateCategoryMutation, CreateCategoryMutationVariables>;

/**
 * __useCreateCategoryMutation__
 *
 * To run a mutation, you first call `useCreateCategoryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCategoryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCategoryMutation, { data, loading, error }] = useCreateCategoryMutation({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useCreateCategoryMutation(baseOptions?: Apollo.MutationHookOptions<CreateCategoryMutation, CreateCategoryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateCategoryMutation, CreateCategoryMutationVariables>(CreateCategoryDocument, options);
      }
export type CreateCategoryMutationHookResult = ReturnType<typeof useCreateCategoryMutation>;
export type CreateCategoryMutationResult = Apollo.MutationResult<CreateCategoryMutation>;
export type CreateCategoryMutationOptions = Apollo.BaseMutationOptions<CreateCategoryMutation, CreateCategoryMutationVariables>;
export const CreateDestinationDocument = gql`
    mutation CreateDestination($name: String!) {
  createDestination(name: $name) {
    id
    name
  }
}
    `;
export type CreateDestinationMutationFn = Apollo.MutationFunction<CreateDestinationMutation, CreateDestinationMutationVariables>;

/**
 * __useCreateDestinationMutation__
 *
 * To run a mutation, you first call `useCreateDestinationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateDestinationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createDestinationMutation, { data, loading, error }] = useCreateDestinationMutation({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useCreateDestinationMutation(baseOptions?: Apollo.MutationHookOptions<CreateDestinationMutation, CreateDestinationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateDestinationMutation, CreateDestinationMutationVariables>(CreateDestinationDocument, options);
      }
export type CreateDestinationMutationHookResult = ReturnType<typeof useCreateDestinationMutation>;
export type CreateDestinationMutationResult = Apollo.MutationResult<CreateDestinationMutation>;
export type CreateDestinationMutationOptions = Apollo.BaseMutationOptions<CreateDestinationMutation, CreateDestinationMutationVariables>;
export const UpdateScheduledActivityDocument = gql`
    mutation UpdateScheduledActivity($id: ID!, $placeId: ID, $startTime: String, $endTime: String) {
  updateScheduledActivity(
    id: $id
    placeId: $placeId
    startTime: $startTime
    endTime: $endTime
  ) {
    id
    startTime
    endTime
    place {
      id
      name
    }
  }
}
    `;
export type UpdateScheduledActivityMutationFn = Apollo.MutationFunction<UpdateScheduledActivityMutation, UpdateScheduledActivityMutationVariables>;

/**
 * __useUpdateScheduledActivityMutation__
 *
 * To run a mutation, you first call `useUpdateScheduledActivityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateScheduledActivityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateScheduledActivityMutation, { data, loading, error }] = useUpdateScheduledActivityMutation({
 *   variables: {
 *      id: // value for 'id'
 *      placeId: // value for 'placeId'
 *      startTime: // value for 'startTime'
 *      endTime: // value for 'endTime'
 *   },
 * });
 */
export function useUpdateScheduledActivityMutation(baseOptions?: Apollo.MutationHookOptions<UpdateScheduledActivityMutation, UpdateScheduledActivityMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateScheduledActivityMutation, UpdateScheduledActivityMutationVariables>(UpdateScheduledActivityDocument, options);
      }
export type UpdateScheduledActivityMutationHookResult = ReturnType<typeof useUpdateScheduledActivityMutation>;
export type UpdateScheduledActivityMutationResult = Apollo.MutationResult<UpdateScheduledActivityMutation>;
export type UpdateScheduledActivityMutationOptions = Apollo.BaseMutationOptions<UpdateScheduledActivityMutation, UpdateScheduledActivityMutationVariables>;
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