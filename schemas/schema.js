const graphql = require('graphql');
const _ = require('lodash');
const fetch = require('node-fetch');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull,
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

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addUser: {
            type: UserType,
            args: {
                firstName: { type: new GraphQLNonNull(GraphQLString) },
                age: { type: new GraphQLNonNull(GraphQLInt) },
                companyId: { type: GraphQLString },
            },
            resolve(parentValue, { firstName, age }) {
                return fetch('http://localhost:3010/users', {
                    method: 'post',
                    body: JSON.stringify({ firstName, age }),
                    headers: { 'Content-Type': 'application/json' },
                })
                    .then(response => response.json());
            }
        },
        deleteUser: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve(parentValue, { id }) {
                return fetch(`http://localhost:3010/users/${id}`, {
                    method: 'delete',
                    headers: { 'Content-Type': 'application/json' },
                })
                    .then(response => response.json());
            }
        },
        editUser: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLString) },
                firstName: { type: GraphQLString },
                age: { type: GraphQLInt },
                companyId: { type: GraphQLString },
            },
            resolve(parentValue, args) {
                return fetch(`http://localhost:3010/users/${args.id}`, {
                    method: 'patch',
                    body: JSON.stringify(args),
                    headers: { 'Content-Type': 'application/json' },
                })
                    .then(response => response.json());
            }
        }
    }
})

module.exports = new GraphQLSchema({
    mutation,
    query: RootQuery,
})