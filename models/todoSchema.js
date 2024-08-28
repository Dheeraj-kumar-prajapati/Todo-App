const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/TodoDB')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

const taskSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    userTasks: []
});

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const Todo = mongoose.model('Todo', taskSchema);
const User = mongoose.model('User', userSchema);

module.exports = {
    Todo,
    User
};
