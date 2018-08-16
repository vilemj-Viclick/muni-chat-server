const express = require('express');
const uuid = require('uuid/v4');
const path = require('path');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000;

let messages = [];

function isString(arg) {
  return typeof arg === 'string';
}

try {
  express()
    .use(express.static(path.join(__dirname, 'public')))
    .use(bodyParser.json())
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .get('/', (req, res) => res.render('pages/index'))
    .get('/messages', (req, res) => res.send(JSON.stringify(messages, null, 4)))
    .post('/message', (req, res) => {
      try {
        console.log(req.body);
        const message = req.body;
        if (isString(message.text) && isString(message.nick)) {
          messages.push({
            ...message,
            id: uuid(),
          });
          while (messages.length > 50) {
            messages.shift();
          }
          res.end();
        }
        else {
          res.writeHead(400, 'The message does not contain a string text and a string nick.');
          res.end();
        }
      }
      catch {
        res.writeHead(400, 'Body is not a valid JSON.');
        res.end();
      }
    })
    .listen(PORT, () => console.log(`Listening on ${ PORT }`));
}
catch (error) {
  console.log(error);
}
