const express = require('express');
const expressGraphQL = require('express-graphql');
const schema = require('./schemas/schema');

const app = express();

app.use('/graphql', expressGraphQL({
    schema,
    graphiql: true
}));

app.listen(3000);