const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  const currentDir = __dirname;
  fs.readdir(currentDir, (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error reading directory');
      return;
    }

    const fileDetails = [];
    files.forEach((file) => {
      const stats = fs.statSync(file);
      fileDetails.push({
        name: file,
        isDirectory: stats.isDirectory(),
        timestamp: stats.mtime.toUTCString(),
      });
    });

    res.render('index', { files: fileDetails });
  });
});

app.post('/create-folder', (req, res) => {
  const folderName = req.body.folderName;
  const folderPath = path.join(__dirname, folderName);

  fs.mkdir(folderPath, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error creating folder');
    } else {
      res.redirect('/');
    }
  });
});

app.post('/create-file', (req, res) => {
  const fileName = req.body.fileName;
  const filePath = path.join(__dirname, fileName);

  fs.writeFile(filePath, '', (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error creating file');
    } else {
      res.redirect('/');
    }
  });
});



app.post('/rename', (req, res) => {
  const oldName = req.body.oldName;
  const newName = req.body.newName;

  fs.rename(oldName, newName, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error renaming file or folder');
    } else {
      res.redirect('/');
    }
  });
});

app.post('/delete', (req, res) => {
  const name = req.body.name;

  fs.stat(name, (err, stats) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error finding file or folder');
      return;
    }

    if (stats.isDirectory()) {
      fs.rmdir(name, { recursive: true }, (err) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error deleting folder');
        } else {
          res.redirect('/');
        }
      });
    } else {
      fs.unlink(name, (err) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error deleting file');
        } else {
          res.redirect('/');
        }
      });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
