const mongoose = require('mongoose');

const uri = 'mongodb+srv://Shubham:Shubham@9004@cluster0.0dxsi.mongodb.net/new?retryWrites=true&w=majority';

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB successfully');
  mongoose.connection.close(); // Close connection after success
})
.catch(err => {
  console.error('Failed to connect to MongoDB', err);
});
