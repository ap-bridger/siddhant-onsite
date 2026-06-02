import { getPendingTransactions } from "@/server/modules/accounts/api";
import {
  getClientCategories,
  getClientVendors,
} from "@/server/modules/clients/api";
import { createSchema, createYoga } from "graphql-yoga";

const { handleRequest } = createYoga({
  schema: createSchema({
    typeDefs: /* GraphQL */ `
      type Category {
        id: ID!
        name: String!
      }

      type Vendor {
        id: ID!
        name: String!
      }

      type Transaction {
        id: ID!
        qboId: String
        date: String!
        description: String!
        amountCents: Int!
      }

      type Query {
        clientCategories(clientId: ID!): [Category!]!
        clientVendors(clientId: ID!): [Vendor!]!
        accountPending(bankAccountId: ID!): [Transaction!]!
      }
    `,
    resolvers: {
      Query: {
        clientCategories: (_parent: unknown, args: { clientId: string }) =>
          getClientCategories(args.clientId),
        clientVendors: (_parent: unknown, args: { clientId: string }) =>
          getClientVendors(args.clientId),
        accountPending: (_parent: unknown, args: { bankAccountId: string }) =>
          getPendingTransactions(args.bankAccountId),
      },
    },
  }),

  // While using Next.js file convention for routing, we need to configure Yoga to use the correct endpoint
  graphqlEndpoint: "/api/graphql",

  // Yoga needs to know how to create a valid Next response
  fetchAPI: { Response },
});

// Wrap the Yoga handler so the exported route handlers match Next.js's
// expected signature. Yoga's `handleRequest` second argument
// (`Partial<ServerAdapterInitialContext>`) is incompatible with the
// `{ params }` context Next.js's route-type validation expects, so we only
// forward the request and pass an empty server context.
function handler(request: Request) {
  return handleRequest(request, {});
}

export { handler as GET, handler as POST, handler as OPTIONS };
