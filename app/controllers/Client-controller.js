const Client = require('../models/Client-model');
const User = require('../models/User-model');
const Trainer = require('../models/Trainer-model');
const { clientValidationSchema} = require ('../validations/Client-validation');
const populateAll = require('../utils/populateHelper');

const clientsCtrl = {};

//create
clientsCtrl.create = async(req,res)=>{
    try{
        const {error} = clientValidationSchema.validate(req.body,{abortEarly:false});
        if(error){
            return res.status(400).json({errors:error.details});
        }

        const {trainerId,goal,subscriptionStatus,progressId} = req.body;

        //userId from token
        const userId = req.userId;

        //check if user exists
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({errors:'User not found'});
        }

        //check if client already exists for user
        const existingClient = await Client.findOne({userId});
        if(existingClient){
            return res.status(400).json({errors:'Client is already exists'})
        }


        if (trainerId) {
      const trainer = await Trainer.findById(trainerId);
      if (!trainer) {
        return res.status(404).json({ errors: 'Trainer not found' });
      }
    }

        const client = new Client({
            userId,
            trainerId,
            goal,
            subscriptionStatus,
            progressId
        });
        await client.save();
        res.status(201).json(client);
    }
    catch(err){
        console.log(err);
        res.status(500).json({errors:'server error'})
    }
};

//List clients(Admin)

clientsCtrl.list=async(req,res)=>{
    try{
    const clients =await Client.find().populate(populateAll('Client'));
    res.json(clients);
}
catch(err){
    console.log(err);
    res.status(500).json({errors:'server error'})
}
}

//show client

clientsCtrl.show =async(req,res)=>{
    try{
        const {id} =req.params;
        const client = await Client.findById(id).populate(populateAll('Client'));
       


        if(!client){
            return res.status(404).json({errors:'Client not found'});
            
        }
        res.json(client);
    }
        catch(err){
            console.log(err);
            res.status(500).json({errors:'server error'})

        }

    };


    //Update client
    clientsCtrl.update =async (req,res)=>{
        try{
            const {id} =req.params;
            const updates =req.body;
            const client = await Client.findByIdAndUpdate(id, updates, { new: true });
    if (!client){ 
        return res.status(404).json({ errors: 'Client not found' });
    }
    res.json(client);
  } 
  catch (err) {
    console.log(err);
    res.status(500).json({ errors: 'Server error while updating client' });
  }
};



// Delete Client
clientsCtrl.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findByIdAndDelete(id);
    if (!client) return res.status(404).json({ errors: 'Client not found' });
    res.json({ message: 'Client deleted successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: 'Server error while deleting client' });
  }
};

module.exports = clientsCtrl;
        

