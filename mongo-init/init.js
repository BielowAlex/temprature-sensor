db = db.getSiblingDB('sensor_database');

db.sensors.insertMany([
  {
    _id: ObjectId('66b74d18ab7bbe32a73a6ce0'),
    name: 'Sensor 1',
    createdAt: ISODate('2024-08-10T14:53:03.221Z'),
    updatedAt: ISODate('2024-08-10T14:53:03.221Z'),
    __v: 0,
  },
  {
    _id: ObjectId('66b768731357b7a1d02bfd3f'),
    name: 'Sensor 2',
    createdAt: ISODate('2024-08-10T14:53:03.221Z'),
    updatedAt: ISODate('2024-08-10T14:53:03.221Z'),
    __v: 0,
  },
]);

db.sensorData.insertMany([
  {
    _id: ObjectId('66b74e4dad5764d61a160847'),
    temperature: 25,
    humidity: 60,
    sensor: ObjectId('66b74d18ab7bbe32a73a6ce0'),
    createdAt: ISODate('2024-08-10T14:53:03.221Z'),
    updatedAt: ISODate('2024-08-10T14:53:03.221Z'),
    __v: 0,
  },
  {
    _id: ObjectId('66b75415b13216acb94e7902'),
    temperature: 24,
    humidity: 58,
    sensor: ObjectId('66b74d18ab7bbe32a73a6ce0'),
    createdAt: ISODate('2024-08-10T14:53:03.221Z'),
    updatedAt: ISODate('2024-08-10T14:53:03.221Z'),
    __v: 0,
  },
  {
    _id: ObjectId('66b7540fb13216acb94e78ff'),
    temperature: 27,
    humidity: 55,
    sensor: ObjectId('66b768731357b7a1d02bfd3f'),
    createdAt: ISODate('2024-08-10T14:53:03.221Z'),
    updatedAt: ISODate('2024-08-10T14:53:03.221Z'),
    __v: 0,
  },
  {
    _id: ObjectId('66b75415b13216acb94e7905'),
    temperature: 27,
    humidity: 55,
    sensor: ObjectId('66b768731357b7a1d02bfd3f'),
    createdAt: ISODate('2024-08-10T14:53:03.221Z'),
    updatedAt: ISODate('2024-08-10T14:53:03.221Z'),
    __v: 0,
  },
]);
