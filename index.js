const express=require('express');
const cors=require('cors');
const dotenv = require('dotenv');

dotenv.config(); 

const app=express();
const port=process.env.PORT||3333;

//(middlewares)
app.use(cors());
app.use(express.json())


//(connect to DB)
const configureDB=require('./config/DB');
configureDB();


//Controller Imports
const usersCtrl = require('./app/controllers/User-controller');
const trainersCtrl = require('./app/controllers/Trainer-controller')
const authenticateUser = require('./app/middlewares/authenticateUser');
const authorizerUser = require('./app/middlewares/authorizeUser');
const clientsCtrl = require('./app/controllers/Client-controller');
const progressTrackerCtrl = require('./app/controllers/Progress-controller');
const workoutPlansCtrl = require('./app/controllers/Workout-controller');
const dietPlansCtrl = require('./app/controllers/Diet-controller');
const subscriptionsCtrl = require('./app/controllers/Subscription-controller');
const paymentsCtrl = require('./app/controllers/Payment-controller');



//Routes

//Register//Login
app.post('/user/register',usersCtrl.register);
app.post('/user/login',usersCtrl.login);

//( Protected routes)
//Account
app.get('/user/account',authenticateUser,usersCtrl.account);
//admin-route
app.get('/user/list',authenticateUser,authorizerUser(['Admin']),usersCtrl.list);






//Trainer routes
app.post('/trainer/create',authenticateUser,authorizerUser(['Admin','Trainer']),trainersCtrl.create);
app.get('/trainer/list',trainersCtrl.list);
app.get('/trainer/:id',trainersCtrl.show);
app.put('/trainer/:id',authenticateUser,authorizerUser(['Admin','Trainer']),trainersCtrl.update);
app.delete('/trainer/:id',authenticateUser,authorizerUser(['Admin']),trainersCtrl.remove);



//Client Routes
app.post('/client/create',authenticateUser,clientsCtrl.create);
app.get('/client/list',authenticateUser,authorizerUser(['Admin']),clientsCtrl.list);
app.get('/client/:id',clientsCtrl.show);
app.put('/client/:id',authenticateUser,authorizerUser(['Admin','Client']),clientsCtrl.update);
app.delete('/client/:id',authenticateUser,authorizerUser(['Admin']),clientsCtrl.remove);



//Progress Tracker Route
app.post('/progress/create',authenticateUser,authorizerUser(['Trainer','Admin']),progressTrackerCtrl.create);
app.get('/progress/list',authenticateUser,authorizerUser(['Trainer','Admin']),progressTrackerCtrl.list);
app.get('/progress/:id',progressTrackerCtrl.show);
app.put('/progress/:id',authenticateUser,authorizerUser(['Trainer','Admin']),progressTrackerCtrl.update);
app.delete('/progress/:id',authenticateUser,authorizerUser(['Admin']),progressTrackerCtrl.remove);


//Workout plan route
app.post('/workout/create', authenticateUser, authorizerUser(['Trainer', 'Admin']), workoutPlansCtrl.create);
app.get('/workout/list', workoutPlansCtrl.list);
app.get('/workout/:id', workoutPlansCtrl.show);
app.put('/workout/:id', authenticateUser, authorizerUser(['Trainer', 'Admin']), workoutPlansCtrl.update);
app.delete('/workout/:id', authenticateUser, authorizerUser(['Admin']), workoutPlansCtrl.remove);



//Diet plan route
app.post('/diet/create', authenticateUser, authorizerUser(['Trainer', 'Admin']), dietPlansCtrl.create);
app.get('/diet/list', dietPlansCtrl.list);
app.get('/diet/:id', dietPlansCtrl.show);
app.put('/diet/:id', authenticateUser, authorizerUser(['Trainer', 'Admin']), dietPlansCtrl.update);
app.delete('/diet/:id', authenticateUser, authorizerUser(['Admin']), dietPlansCtrl.remove);



// Subscription Routes
app.post('/subscription/create', authenticateUser, authorizerUser(['Admin', 'Trainer']), subscriptionsCtrl.create);
app.get('/subscription/list', authenticateUser, authorizerUser(['Admin', 'Trainer']), subscriptionsCtrl.list);
app.get('/subscription/:id', authenticateUser, subscriptionsCtrl.show);
app.put('/subscription/:id', authenticateUser, authorizerUser(['Admin']), subscriptionsCtrl.update);
app.delete('/subscription/:id', authenticateUser, authorizerUser(['Admin']), subscriptionsCtrl.remove);




// Payment route
app.post('/payment/create', authenticateUser, authorizerUser(['Admin', 'Trainer']), paymentsCtrl.create);
app.get('/payment/list', authenticateUser, authorizerUser(['Admin', 'Trainer']), paymentsCtrl.list);
app.get('/payment/:id', authenticateUser, paymentsCtrl.show);
app.put('/payment/:id', authenticateUser, authorizerUser(['Admin']), paymentsCtrl.update);
app.delete('/payment/:id', authenticateUser, authorizerUser(['Admin']), paymentsCtrl.remove);





app.listen(port,()=>{
    console.log("server is running on port",port);
})