import { Test, TestingModule } from '@nestjs/testing';
import { SensorService } from './sensor.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Sensor, SensorDocument } from './schemas/sensor.schema';
import { SensorData, SensorDataDocument } from './schemas/sensor-data.schema';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { NotFoundException } from '@nestjs/common';
import { SensorDataDto } from './dto/sensor-data.dto';

const mockSensor: Sensor = {
  _id: new Types.ObjectId(),
  name: 'Sensor 1',
};

const mockPayload: SensorDataDto = {
  sensorId: mockSensor._id.toString(),
  temperature: 25,
  humidity: 60,
};
const mockSensorData: SensorData = {
  _id: new Types.ObjectId(),
  temperature: 25,
  humidity: 60,
  sensor: mockSensor._id,
};
const mockSensorDataList: SensorData[] = [
  {
    _id: new Types.ObjectId(),
    temperature: 25,
    humidity: 60,
    sensor: mockSensor._id,
  },
  {
    _id: new Types.ObjectId(),
    temperature: 27,
    humidity: 55,
    sensor: mockSensor._id,
  },
];

const mockSensorModel = {
  findOne: jest.fn().mockResolvedValue(mockSensor),
  create: jest.fn().mockResolvedValue(mockSensor),
};

const mockSensorDataModel = {
  find: jest.fn().mockResolvedValue(mockSensorDataList),
  findOne: jest.fn().mockResolvedValue(mockSensorDataList[0]), // Mock for getLastSensorData
  create: jest.fn().mockResolvedValue(mockSensorData), // Mock for getLastSensorData
};
describe('SensorService', () => {
  let service: SensorService;
  let sensorModel: Model<SensorDocument>;
  let sensorDataModel: Model<SensorDataDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SensorService,
        {
          provide: getModelToken(Sensor.name),
          useValue: mockSensorModel,
        },
        {
          provide: getModelToken(SensorData.name),
          useValue: mockSensorDataModel,
        },
      ],
    }).compile();

    service = module.get<SensorService>(SensorService);
    sensorModel = module.get<Model<SensorDocument>>(getModelToken(Sensor.name));
    sensorDataModel = module.get<Model<SensorDataDocument>>(
      getModelToken(SensorData.name),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllSensorDataBySensorId', () => {
    it('should return all sensor data for a given sensor ID', async () => {
      mockSensorModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSensor),
      });
      mockSensorDataModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSensorDataList),
      });

      const result = await service.getAllSensorDataBySensorId('someSensorId');

      expect(sensorModel.findOne).toHaveBeenCalledWith({ _id: 'someSensorId' });
      expect(sensorDataModel.find).toHaveBeenCalledWith({
        sensor: mockSensor._id,
      });
      expect(result).toEqual(mockSensorDataList);
    });

    it('should throw NotFoundException if the sensor does not exist', async () => {
      mockSensorModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.getAllSensorDataBySensorId('invalidSensorId'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllSensorData', () => {
    it('should return all sensor data', async () => {
      mockSensorDataModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSensorDataList),
      });

      const result = await service.getAllSensorData();

      expect(sensorDataModel.find).toHaveBeenCalled();
      expect(result).toEqual(mockSensorDataList);
    });
  });

  describe('createSensor', () => {
    it('should create and return a new sensor', async () => {
      const createSensorDto: CreateSensorDto = {
        name: 'Sensor 1',
      };

      mockSensorModel.create.mockResolvedValue(mockSensor);

      const result = await service.createSensor(createSensorDto);

      expect(result).toEqual(mockSensor);
      expect(mockSensorModel.create).toHaveBeenCalledWith(createSensorDto);
    });
  });

  describe('saveData', () => {
    it('should save sensor data and return it', async () => {
      jest.spyOn(sensorModel, 'findOne').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(mockSensor),
      } as any);
      jest
        .spyOn(sensorDataModel, 'create')
        .mockResolvedValue(mockSensorData as any);

      const result = await service.saveData(mockPayload);

      expect(sensorModel.findOne).toHaveBeenCalledWith({
        _id: mockPayload.sensorId,
      });
      expect(sensorDataModel.create).toHaveBeenCalledWith({
        temperature: mockPayload.temperature,
        humidity: mockPayload.humidity,
        sensor: mockSensor, // Ensure we're passing the sensor ID
      });
      expect(result).toEqual(mockSensorData);
    });

    it('should throw NotFoundException if sensor is not found', async () => {
      jest.spyOn(sensorModel, 'findOne').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.saveData(mockPayload)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
