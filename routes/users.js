const { User, Todo } = require('../models/todoSchema');

const addUser = async (email, username, password) => {
  try {
    const result = await User.create({
      username: username,
      email: email,
      password: password
    });
    await Todo.create({
      userId: result._id,
    })
    return result;
  } catch (error) {
    console.error("Error in addUser function:", error);
    if (error.code === 11000) {
      throw new Error('Username or email already exists');
    }
    throw error;
  }
}

const checkUser = async (username, password) => {
  try {
    console.log("user gte : ", username, password);
    const user = await User.findOne({ username: username });

    console.log("after : ", user);

    if (!user)
      return null;

    if (user.password == password)
      return user;

    else
      return false;

  } catch (error) {
    console.error("Error in checkUser function:", error);
    throw error;
  }
};

const checkEmail = async (email) => {
  try {
    const user = await User.findOne({ email });

    if (user)
      return user;

    else return false;
  } catch (error) {
    console.error("Error in checkEmail function:", error);
    throw error;
  }
}

module.exports = { addUser, checkUser, checkEmail };