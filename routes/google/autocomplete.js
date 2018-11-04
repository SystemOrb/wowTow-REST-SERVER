const express = require('express');
const app = express();

app.get('/:query', (request, response) => {
    try {
        let search = request.params.query;

    } catch (error) {
        throw new Error(error);
    }
});

module.exports = app;