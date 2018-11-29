/* eslint no-console: 0 */
const express = require('express');
const fs = require('fs');
const formidable = require('formidable');
const glob = require('glob');

const isDeveloping = process.env.NODE_ENV !== 'production';
const port = isDeveloping ? 4001 : process.env.PORT;
const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/', function response(req, res) {
  res.send('file service');
});

// serving the output files
app.use('/files', express.static('outputs'));

// get file list
app.get('/files', (req, res) => {
  glob('*.ogg', {cwd: `./outputs`}, (err, files) => {
    if (!err) res.status(200).send(files);
    else res.status(204).send({});
  });
});

// save files
app.post('/savefile', (req, res) => {
  const form = new formidable.IncomingForm();

  form.parse(req, (err, fields) => {
    if (fields.audio_data) {
      fs.writeFileSync(`./outputs/${new Date(Date.now()).toISOString()}.ogg`, Buffer.from(fields.audio_data.replace('data:audio/ogg;base64,', ''), 'base64'));
      console.log('files saved');
      res.status(200).send('files saved!');
    } else {
      console.log('no audio found');
      res.status(204).send('no audio found');
    }
  });
});


app.listen(port, '0.0.0.0', function onStart(err) {
  if (err) {
    console.log(err);
  }
  console.info('==> 🌎 Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
});
