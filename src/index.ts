import { Collection, Db, Document, MongoClient } from 'mongodb'

// connection with mongodb instance running locally
const client = new MongoClient('mongodb://test:test@db:27017/');

async function connectToDb() {
  await client.connect();
  console.log('db connected successfully')
  return client.db();
}

function getCollection(collection: string, db: Db) {
  return db.collection(collection);
}

function getInitData() {
  const names = ["Lex", "Dana", "Joe", "Sam", "Tata", "Stephen", "Modi", "Amit", "Iman", "Conor"];
  const ages = [18, 19, 20, 21, 22, 23, 24, 25, 26, 27];
  const countries = ["India", "USA", "China", "France", "Germany", "Japan", "Brazil", "Canada", "Australia", "UK"];

  function selectRandomElement(array: Array<string | number>) {
    return array[Math.floor(Math.random() * array.length)];
  };

  let data = [];

  for (let i = 0; i< 200; i++) {
    data.push({
      name: selectRandomElement(names),
      age: selectRandomElement(ages),
      country: selectRandomElement(countries)
    })
  };

  console.log('created sample data of length: ', data.length);
  return data;
}

async function insertData(collection: Collection<Document>, data: any) {
  const deleteResult = await collection.deleteMany({});
  console.log('deleted previously existing data: ', deleteResult.deletedCount);
  const result = await collection.insertMany(data);
  console.log('data insertion result of length', result.insertedCount);
}

/**
 * I have implemented what I have interpreted the question and here's my interpretation:
 * calculate the total number of users, average age of all users, group all users by country,
 * calculate the total users.
 * 
 * @param collection: mognodb collection
 */
async function performAggregateQuery(collection: Collection<Document>) {
  const query = [
    {
      $group: {
        _id: "$country",
        count: { $sum: 1 },
        avgAge: { $avg: "$age" }
      }
    },
    {
      $group: {
        _id: "null",
        total: { $sum: "$count" },
        averageAge: { $avg: "$avgAge" }, 
        countries: { $push: "$$ROOT" },
      }
    },
  ];

  const result = await collection.aggregate(query).toArray();

  console.log('aggregation result', result);
  console.log('countries list: ', result[0].countries)
}

async function initAggregationApp() {

  const db = await connectToDb();

  const collection = getCollection("users", db);

  const data = getInitData();

  await insertData(collection, data);

  await performAggregateQuery(collection);
};

// push all the async callbacks to event loop
initAggregationApp();