const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.status(200).json({ message: 'hello from the server', app: 'Natours' });
});

const port = 3000;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
