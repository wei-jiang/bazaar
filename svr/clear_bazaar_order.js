let mongo = require('mongodb'),
MongoClient = mongo.MongoClient,
ObjectId = mongo.ObjectID,
Binary = mongo.Binary,
g_db,
m_url = 'mongodb://freego:freego2016@cninone.com:27017/wxgames';
MongoClient.connect(m_url)
.then(db => {
    g_db = db;
    console.log('connect to mongodb success')
    g_db.collection('bazaar_orders')
    .remove({})
    .then(()=>{
        console.log('all order info have been removed')
    })
})
.catch(err => console.log('connect to mongodb failed', err))