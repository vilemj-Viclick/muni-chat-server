const express = require('express');
const uuid = require('uuid/v4');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = process.env.PORT || 5000;

let messages = [];

function isString(arg) {
  return typeof arg === 'string';
}

const originWhitelist = [/https?:\/\/localhost(:[0-9]+)?[/]?/];

try {
  express()
    .use(express.static(path.join(__dirname, 'public')))
    .use(bodyParser.json())
    .use(cors({
      origin: (origin, callback) => {
        if (!origin || originWhitelist.some(originRegex => originRegex.test(origin))) {
          callback(null, true);
        }
        else {
          console.log(`Origin '${origin}' not allowed by CORS.`);
          callback(new Error(`Origin '${origin}' not allowed by CORS.`));
        }
      }
    }))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .get('/', (req, res) => res.render('pages/index'))
    .get('/messages', (req, res) => res.send(JSON.stringify(messages, null, 4)))
    .delete('/messages', (req, res) => {
      if(req.header('X-Pass') === 'please') {
        res.send(JSON.stringify({message: 'Aye aye captain!'}));
        messages = [];
      }
      else {
        res.send(JSON.stringify({message: 'Close but no cigar!'}));
      }
    })
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
