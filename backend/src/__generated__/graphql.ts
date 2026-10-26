import { GraphQLResolveInfo } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

/** An event in the user's Event Manager calendar. */
export type CalendarEvent = {
  __typename?: 'CalendarEvent';
  endTime: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  startTime: Scalars['String']['output'];
  title: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

/** A reference to an event in another app of the ecosystem. Only the id is stored, never a copy. */
export type CalendarEventLink = {
  __typename?: 'CalendarEventLink';
  app: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  url: Scalars['String']['output'];
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

export type Mutation = {
  __typename?: 'Mutation';
  createCategory: Category;
  createDestination: Destination;
  createPlace: Place;
  createPlan: Plan;
  createScheduledActivity: ScheduledActivity;
  deletePlace: Scalars['Boolean']['output'];
  deletePlan: Scalars['Boolean']['output'];
  deleteScheduledActivity: Scalars['Boolean']['output'];
  /**
   * Turn copying the plan's activities to the Event Manager calendar on or off. Turning it on (again)
   * creates or updates every activity's event; turning it off deletes them.
   */
  setPlanCalendarSync: Plan;
  updatePlace: Place;
  updatePlan: Plan;
  updateScheduledActivity: ScheduledActivity;
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


export type MutationSetPlanCalendarSyncArgs = {
  enabled: Scalars['Boolean']['input'];
  planId: Scalars['ID']['input'];
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
  /** Whether the plan's activities are copied to the owner's Event Manager calendar. */
  calendarSync: Scalars['Boolean']['output'];
  destinations: Array<Destination>;
  endDate: Scalars['String']['output'];
  googleEventId?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  startDate: Scalars['String']['output'];
  title: Scalars['String']['output'];
  /** Clerk user id of the owner. */
  userId: Scalars['ID']['output'];
};

export type Query = {
  __typename?: 'Query';
  /**
   * The user's joined Event Manager events overlapping a time range, skipping the event of
   * excludeActivityId (the activity being moved). Empty when Event Manager cannot be reached.
   */
  calendarConflicts: Array<CalendarEvent>;
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


export type QueryCalendarConflictsArgs = {
  endTime: Scalars['String']['input'];
  excludeActivityId?: InputMaybe<Scalars['ID']['input']>;
  startTime: Scalars['String']['input'];
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
  /**
   * The user's joined Event Manager events that overlap this activity, other than its own event.
   * Empty when Event Manager cannot be reached.
   */
  calendarConflicts: Array<CalendarEvent>;
  /** The activity's event in Event Manager, or null when it is not on the calendar. */
  calendarEvent?: Maybe<CalendarEventLink>;
  endTime: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  place: Place;
  startTime: Scalars['String']['output'];
};

/** A user from the shared core.users. `id` is the Clerk user id. */
export type User = {
  __typename?: 'User';
  avatar?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;





/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  CalendarEvent: ResolverTypeWrapper<CalendarEvent>;
  CalendarEventLink: ResolverTypeWrapper<CalendarEventLink>;
  Category: ResolverTypeWrapper<Category>;
  Destination: ResolverTypeWrapper<Destination>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  Place: ResolverTypeWrapper<Place>;
  Plan: ResolverTypeWrapper<Plan>;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  ScheduledActivity: ResolverTypeWrapper<ScheduledActivity>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  User: ResolverTypeWrapper<User>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean']['output'];
  CalendarEvent: CalendarEvent;
  CalendarEventLink: CalendarEventLink;
  Category: Category;
  Destination: Destination;
  ID: Scalars['ID']['output'];
  Mutation: Record<PropertyKey, never>;
  Place: Place;
  Plan: Plan;
  Query: Record<PropertyKey, never>;
  ScheduledActivity: ScheduledActivity;
  String: Scalars['String']['output'];
  User: User;
};

export type CalendarEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['CalendarEvent'] = ResolversParentTypes['CalendarEvent']> = {
  endTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  startTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type CalendarEventLinkResolvers<ContextType = any, ParentType extends ResolversParentTypes['CalendarEventLink'] = ResolversParentTypes['CalendarEventLink']> = {
  app?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type CategoryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Category'] = ResolversParentTypes['Category']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type DestinationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Destination'] = ResolversParentTypes['Destination']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createCategory?: Resolver<ResolversTypes['Category'], ParentType, ContextType, RequireFields<MutationCreateCategoryArgs, 'name'>>;
  createDestination?: Resolver<ResolversTypes['Destination'], ParentType, ContextType, RequireFields<MutationCreateDestinationArgs, 'name'>>;
  createPlace?: Resolver<ResolversTypes['Place'], ParentType, ContextType, RequireFields<MutationCreatePlaceArgs, 'categoryId' | 'destinationId' | 'name' | 'planId'>>;
  createPlan?: Resolver<ResolversTypes['Plan'], ParentType, ContextType, RequireFields<MutationCreatePlanArgs, 'destinationIds' | 'endDate' | 'startDate' | 'title'>>;
  createScheduledActivity?: Resolver<ResolversTypes['ScheduledActivity'], ParentType, ContextType, RequireFields<MutationCreateScheduledActivityArgs, 'endTime' | 'placeId' | 'startTime'>>;
  deletePlace?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeletePlaceArgs, 'id'>>;
  deletePlan?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeletePlanArgs, 'id'>>;
  deleteScheduledActivity?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteScheduledActivityArgs, 'id'>>;
  setPlanCalendarSync?: Resolver<ResolversTypes['Plan'], ParentType, ContextType, RequireFields<MutationSetPlanCalendarSyncArgs, 'enabled' | 'planId'>>;
  updatePlace?: Resolver<ResolversTypes['Place'], ParentType, ContextType, RequireFields<MutationUpdatePlaceArgs, 'id'>>;
  updatePlan?: Resolver<ResolversTypes['Plan'], ParentType, ContextType, RequireFields<MutationUpdatePlanArgs, 'id'>>;
  updateScheduledActivity?: Resolver<ResolversTypes['ScheduledActivity'], ParentType, ContextType, RequireFields<MutationUpdateScheduledActivityArgs, 'id'>>;
};

export type PlaceResolvers<ContextType = any, ParentType extends ResolversParentTypes['Place'] = ResolversParentTypes['Place']> = {
  category?: Resolver<ResolversTypes['Category'], ParentType, ContextType>;
  destination?: Resolver<ResolversTypes['Destination'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  notes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  planId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  priceRange?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  reviewLinks?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  visitStatus?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type PlanResolvers<ContextType = any, ParentType extends ResolversParentTypes['Plan'] = ResolversParentTypes['Plan']> = {
  calendarSync?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  destinations?: Resolver<Array<ResolversTypes['Destination']>, ParentType, ContextType>;
  endDate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  googleEventId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  startDate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  calendarConflicts?: Resolver<Array<ResolversTypes['CalendarEvent']>, ParentType, ContextType, RequireFields<QueryCalendarConflictsArgs, 'endTime' | 'startTime'>>;
  categories?: Resolver<Array<ResolversTypes['Category']>, ParentType, ContextType>;
  destinations?: Resolver<Array<ResolversTypes['Destination']>, ParentType, ContextType>;
  hello?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  myPlans?: Resolver<Array<ResolversTypes['Plan']>, ParentType, ContextType>;
  placesForPlan?: Resolver<Array<ResolversTypes['Place']>, ParentType, ContextType, RequireFields<QueryPlacesForPlanArgs, 'planId'>>;
  plan?: Resolver<Maybe<ResolversTypes['Plan']>, ParentType, ContextType, RequireFields<QueryPlanArgs, 'id'>>;
  recommendedPlaces?: Resolver<Array<ResolversTypes['Place']>, ParentType, ContextType, RequireFields<QueryRecommendedPlacesArgs, 'destinationId'>>;
  scheduledActivitiesForPlan?: Resolver<Array<ResolversTypes['ScheduledActivity']>, ParentType, ContextType, RequireFields<QueryScheduledActivitiesForPlanArgs, 'planId'>>;
};

export type ScheduledActivityResolvers<ContextType = any, ParentType extends ResolversParentTypes['ScheduledActivity'] = ResolversParentTypes['ScheduledActivity']> = {
  calendarConflicts?: Resolver<Array<ResolversTypes['CalendarEvent']>, ParentType, ContextType>;
  calendarEvent?: Resolver<Maybe<ResolversTypes['CalendarEventLink']>, ParentType, ContextType>;
  endTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  place?: Resolver<ResolversTypes['Place'], ParentType, ContextType>;
  startTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  avatar?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  CalendarEvent?: CalendarEventResolvers<ContextType>;
  CalendarEventLink?: CalendarEventLinkResolvers<ContextType>;
  Category?: CategoryResolvers<ContextType>;
  Destination?: DestinationResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Place?: PlaceResolvers<ContextType>;
  Plan?: PlanResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  ScheduledActivity?: ScheduledActivityResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
};

