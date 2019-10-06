const graphql = require('graphql');
const _ = require('lodash');
const fetch = require('node-fetch');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList
} = graphql;

const CompanyType = new GraphQLObjectType({
    name: 'Company',
    fields: () => ({
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        desc: { type: GraphQLString },
        users: {
            type: new GraphQLList(UserType),
            resolve(parentValue, args) {
                return fetch(`http://localhost:3010/companies/${parentValue.id}/users`)
                    .then(response => response.json());
            }
        }
    })
});

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLString },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        company: {
            type: CompanyType,
            resolve(parentValue, args) {
                return fetch(`http://localhost:3010/companies/${parentValue.companyId}`)
                    .then(response => response.json());
            }
        }
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        user: {
            type: UserType,
            args: { id: { type: GraphQLString } },
            resolve(parentValue, args) {
                return fetch(`http://localhost:3010/users/${args.id}`)
                    .then(result => result.json())
            }
        },
        company: {
            type: CompanyType,
            args: { id: { type: GraphQLString } },
            resolve(parentValue, args) {
                return fetch(`http://localhost:3010/companies/${args.id}`)
                    .then(result => result.json())
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
})