const express = require('express');
const router = express.Router();
const { Todo, User } = require('../models/todoSchema');

// Middleware for authentication
const authMiddleware = (req, res, next) => {
    if (req.session && req.session.isAuthenticated && req.session.username) {
        next();
    } else if (req.cookies && req.cookies.user_id) {
        req.session = req.session || {};
        req.session.username = req.cookies.user_id;
        req.session.isAuthenticated = true;
        next();
    } else {
        res.status(401).json({ error: 'User not authenticated' });
    }
};

router.use(authMiddleware);

// GET all tasks for the user
router.get('/tasks', async (req, res) => {
    try {
        const userId = req.cookies.user_id;
        const tasks = await Todo.findOne({ userId });
        console.log("user tasks : ", tasks.userTasks);
        res.json(tasks.userTasks);
    } catch (err) {
        console.error('Error in GET /tasks:', err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

// POST add a new task
router.post('/add-task', async (req, res) => {
    try {
        const userId = req.cookies.user_id;   // gmail
        console.log("user id : ", userId);
        const user = await Todo.findOne({ userId: userId });
        console.log('find user :', user);
        // console.log("userId : ", userId);
        const { task } = req.body;
        console.log("task : ", task);
        if (task) {
            const newTask = {
                id: Date.now(),
                title: task,
                isDone: false
            }
            user.userTasks.push(newTask);

            await user.save();
            res.json(newTask);
        } else {
            res.status(400).json({ error: 'Title is required' });
        }
    } catch (err) {
        console.error('Error in POST /add-task:', err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

// POST toggle task completion

router.post('/toggle-task', async (req, res) => {
    try {
        const userId = req.cookies.user_id;
        const { completed, id } = req.body;
        const taskId = id;

        const task = await Todo.findOneAndUpdate(
            { userId: userId, "userTasks.id": taskId },
            { $set: { "userTasks.$.isDone": completed } }
        );

        console.log("update task : ", task);
        if (task) {
            res.json(completed);
        } else {
            res.status(404).json({ error: 'Task not found' });
        }
    } catch (err) {
        console.error('Error in POST /toggle-task/:id:', err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});


// POST edit a task
router.post('/edit-task', async (req, res) => {
    try {
        const userId = req.cookies.user_id;
        const { newText, id } = req.body;
        const taskId = id;

        const task = await Todo.findOneAndUpdate(
            { userId: userId, "userTasks.id": taskId },
            { $set: { "userTasks.$.title": newText } }
        );

        console.log("update task : ", task);
        if (task) {
            res.json(newText);
        } else {
            res.status(404).json({ error: 'Task not found' });
        }

    } catch (err) {
        console.error('Error in POST /edit-task/:id:', err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

router.post('/delete-task', async (req, res) => {
    try {
        const taskId = req.body.id;
        const userId = req.cookies.user_id;

        console.log("task id :", taskId);
        console.log("user id : ", userId);

        const result = await Todo.updateOne(
            { userId: userId },
            { $pull: { userTasks: { id: taskId } } }
        );

        console.log("result : ", result);

        if (result.modifiedCount > 0) {
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Task not found' });
        }
    } catch (err) {
        console.error('Error in DELETE /delete-task/:id:', err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});


module.exports = router;
