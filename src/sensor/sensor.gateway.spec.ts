import { Test, TestingModule } from '@nestjs/testing';
import { SensorGateway } from './sensor.gateway';
import { SensorService } from './sensor.service';
import { SensorDataDto } from './dto/sensor-data.dto';
import { SensorData } from './schemas/sensor-data.schema';
import { Sensor } from './schemas/sensor.schema';
import { Server, Socket } from 'socket.io';
import { Types } from 'mongoose';

const mockPayload: SensorDataDto = {
  sensorId: 'sensorId',
  temperature: 25,
  humidity: 60,
};
const mockSensorId = new Types.ObjectId().toString();

const mockSensorData: SensorData = {
  _id: new Types.ObjectId(),
  temperature: 25,
  humidity: 60,
  sensor: new Types.ObjectId(),
};

const mockSensorList: Sensor[] = [
  { _id: new Types.ObjectId(), name: 'Sensor 1' },
];

const mockSensorDataList: SensorData[] = [
  {
    _id: new Types.ObjectId(),
    temperature: 25,
    humidity: 60,
    sensor: new Types.ObjectId(mockSensorId),
  },
];

describe('SensorGateway', () => {
  let gateway: SensorGateway;
  let sensorService: SensorService;
  let server: Server;

  beforeEach(async () => {
    server = {
      emit: jest.fn(),
    } as unknown as Server;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SensorGateway,
        {
          provide: SensorService,
          useValue: {
            saveData: jest.fn(),
            getAllSensorDataBySensorId: jest.fn(),
            getAllSensors: jest.fn(),
          },
        },
      ],
    }).compile();

    gateway = module.get<SensorGateway>(SensorGateway);
    sensorService = module.get<SensorService>(SensorService);
    gateway.server = server; // Встановіть замоканний сервер в об'єкт gateway
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleSaveSensorData', () => {
    it('should save sensor data and emit updated sensor data list', async () => {
      jest
        .spyOn(sensorService, 'saveData')
        .mockResolvedValue(mockSensorDataList[0]);
      jest
        .spyOn(sensorService, 'getAllSensorDataBySensorId')
        .mockResolvedValue(mockSensorDataList);

      await gateway.handleSaveSensorData({} as Socket, mockPayload);

      expect(sensorService.saveData).toHaveBeenCalledWith(mockPayload);
      expect(sensorService.getAllSensorDataBySensorId).toHaveBeenCalledWith(
        mockPayload.sensorId,
      );
      expect(server.emit).toHaveBeenCalledWith(
        `sensor_data_list_${mockPayload.sensorId}`,
        { data: mockSensorDataList },
      );
    });
  });

  describe('handleCreateSensor', () => {
    it('should create a sensor and emit the new sensor event', async () => {
      jest.spyOn(sensorService, 'saveData').mockResolvedValue(mockSensorData);

      await gateway.handleCreateSensor(mockPayload);

      expect(sensorService.saveData).toHaveBeenCalledWith(mockPayload);
      expect(server.emit).toHaveBeenCalledWith('new_sensor', {
        sensor: mockSensorData,
      });
    });
  });

  describe('handleGetAllSensorDataBySensorId', () => {
    it('should emit all sensor data for a given sensor ID', async () => {
      jest
        .spyOn(sensorService, 'getAllSensorDataBySensorId')
        .mockResolvedValue(mockSensorDataList);

      await gateway.handleGetAllSensorDataBySensorId(mockSensorId);

      expect(sensorService.getAllSensorDataBySensorId).toHaveBeenCalledWith(
        mockSensorId,
      );
      expect(server.emit).toHaveBeenCalledWith(
        `sensor_data_list_${mockSensorId}`,
        {
          data: mockSensorDataList,
        },
      );
    });
  });

  describe('handleGetAllSensors', () => {
    it('should emit all sensors', async () => {
      jest
        .spyOn(sensorService, 'getAllSensors')
        .mockResolvedValue(mockSensorList);

      await gateway.handleGetAllSensors();

      expect(sensorService.getAllSensors).toHaveBeenCalled();
      expect(server.emit).toHaveBeenCalledWith('sensor_list', {
        data: mockSensorList,
      });
    });
  });
});
