const Agent = require('../models/Agent');
const bcrypt = require('bcryptjs');

exports.createAgent = async (req, res) => {
  const { name, email, mobileNumber, password } = req.body;

  try {
    // Check if agent already exists
    let agent = await Agent.findOne({ email });
    if (agent) {
      return res.status(400).json({ message: 'Agent already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new agent
    agent = new Agent({
      name,
      email,
      mobileNumber,
      password: hashedPassword
    });

    await agent.save();

    res.status(201).json({ message: 'Agent created successfully', agent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllAgents = async (req, res) => {
  try {
    const agents = await Agent.find().select('-password');
    res.json(agents);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};