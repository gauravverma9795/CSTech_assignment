const List = require('../models/List');
const Agent = require('../models/Agent');
const csv = require('csv-parser');
const fs = require('fs');

exports.uploadAndDistributeList = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const results = [];

  // Read CSV file
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        // Get all agents
        const agents = await Agent.find();
        
        if (agents.length === 0) {
          return res.status(400).json({ message: 'No agents available' });
        }

        // Distribute lists equally
        const distributedLists = distributeListsToAgents(results, agents);

        // Save distributed lists
        const savedLists = await List.insertMany(distributedLists);

        // Remove uploaded file
        fs.unlinkSync(req.file.path);

        res.status(201).json({ 
          message: 'Lists uploaded and distributed successfully', 
          lists: savedLists 
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
      }
    });
};

function distributeListsToAgents(lists, agents) {
  const distributedLists = [];
  const agentCount = agents.length;

  lists.forEach((item, index) => {
    const agentIndex = index % agentCount;
    distributedLists.push({
      firstName: item.FirstName,
      phone: item.Phone,
      notes: item.Notes,
      assignedAgent: agents[agentIndex]._id
    });
  });

  return distributedLists;
}

exports.getDistributedLists = async (req, res) => {
  try {
    const lists = await List.aggregate([
      {
        $lookup: {
          from: 'agents',
          localField: 'assignedAgent',
          foreignField: '_id',
          as: 'agent'
        }
      },
      {
        $unwind: '$agent'
      },
      {
        $project: {
          firstName: 1,
          phone: 1,
          notes: 1,
          'agent.name': 1,
          'agent.email': 1
        }
      }
    ]);

    res.json(lists);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};