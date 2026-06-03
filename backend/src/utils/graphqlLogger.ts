import { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server';
import { logger } from './logger';

export const graphqlLoggerPlugin: ApolloServerPlugin = {
  async requestDidStart(requestContext): Promise<GraphQLRequestListener<any>> {
    const { request } = requestContext;
    const operationName = request.operationName || 'UnnamedOperation';

    // Ignore introspection queries to avoid log spam
    if (operationName === 'IntrospectionQuery') {
      return {};
    }

    logger.info(
      {
        graphql: {
          operationName,
          variables: request.variables,
          // Only log the query in development to avoid huge logs in production
          ...(process.env.NODE_ENV !== 'production' && { query: request.query }),
        },
      },
      `GraphQL Request Started: ${operationName}`
    );

    const startTime = Date.now();

    return {
      async willSendResponse(requestContext) {
        const { errors } = requestContext;
        const duration = Date.now() - startTime;

        if (errors && errors.length > 0) {
          logger.error(
            {
              graphql: {
                operationName,
                errors: errors.map((e) => ({
                  message: e.message,
                  locations: e.locations,
                  path: e.path,
                })),
                durationMs: duration,
              },
            },
            `GraphQL Request Failed: ${operationName} (${duration}ms)`
          );
        } else {
          logger.info(
            {
              graphql: {
                operationName,
                durationMs: duration,
              },
            },
            `GraphQL Request Completed: ${operationName} (${duration}ms)`
          );
        }
      },
    };
  },
};
