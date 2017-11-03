'use strict';

const Hapi = require('hapi');
const lodash = require('lodash');
const uuidv4 = require('uuid/v4');
const process = require('process');
const server = new Hapi.Server();

server.connection({port: process.argv[2], host: 'localhost'});

server.start((err) => {
    if (err) {
        throw err;
    }

    console.log(`Server running at: ${server.info.uri}`);
});

let userArray = [
    {
        "id": uuidv4(),
        "firstName": "Tony",
        "lastName": "Stark",
        "email": "ironman@starkenterprises.com",
        "address": {
            "state": "NY"
        }
    },
    {
        "id": uuidv4(),
        "firstName": "Steve",
        "lastName": "Rogers",
        "email": "captain@aol.com",
        "address": {
            "state": "IL"
        }
    }
];

let handlers = {
    create: function (request, reply) {
        let newUser = request.payload;

        newUser.id = uuidv4();
        userArray.push(newUser);
        reply(userArray[userArray.length - 1]);
    },

    update: function (request, reply) {
        let user = userArray.find(function (obj) {
            return obj.id === request.params.id;
        });

        if (user) {
            lodash.assign(user, request.payload);
            reply(user);
        } else {
            reply({});
        }
    },

    getAll: function (request, reply) {
        reply(userArray);
    },

    getById: function (request, reply) {
        let user = userArray.find(function (obj) {
            return obj.id === request.params.id;
        });

        if (user) {
            reply(user);
        } else {
            reply({});
        }
    },

    deleteUser: function (request, reply) {
        let userIndex = userArray.findIndex(function (obj) {
            return obj.id === request.params.id;
        });

        if (userIndex > -1) {
            userArray.splice(userIndex, 1);

            reply({});
        }
    }
};

let configObject = {
    cors: true,
    state: {
        parse: false, // parse and store in request.state
        failAction: 'ignore' // may also be 'ignore' or 'log'
    }
};

server.route([
    {
        path: '/users',
        method: 'POST',
        config: configObject,
        handler: handlers.create
    },
    {
        path: '/users/{id}',
        method: 'PUT',
        config: configObject,
        handler: handlers.update
    },
    {
        path: '/users',
        method: 'GET',
        config: configObject,
        handler: handlers.getAll
    },
    {
        path: '/users/{id}',
        method: 'GET',
        config: configObject,
        handler: handlers.getById
    },
    {
        path: '/users/{id}',
        method: 'DELETE',
        config: configObject,
        handler: handlers.deleteUser
    }
]);

server.on('response', function (request) {
    console.log( '[' + new Date() + ']  ' + request.info.remoteAddress + ': ' + request.method.toUpperCase() + ' ' + request.url.path + ' --> ' + request.response.statusCode);
});