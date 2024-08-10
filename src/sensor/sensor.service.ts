import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SensorData, SensorDataDocument } from './schemas/sensor-data.schema';
import { Model } from 'mongoose';
import { SensorDataDto } from './dto/sensor-data.dto';
import { Sensor, SensorDocument } from './schemas/sensor.schema';
import { CreateSensorDto } from './dto/create-sensor.dto';

@Injectable()
export class SensorService {
  constructor(
    @InjectModel('sensorData')
    protected readonly sensorDataModel: Model<SensorDataDocument>,
    @InjectModel('sensors')
    protected readonly sensorModel: Model<SensorDocument>,
  ) {}

  /**
   * Creates a new sensor using the provided data.
   * @param data - Data for creating a new sensor.
   * @returns The created sensor.
   */
  public async createSensor(data: CreateSensorDto): Promise<Sensor> {
    return await this.sensorModel.create(data);
  }

  /**
   * Saves sensor data for a specific sensor.
   * @param data - Sensor data to be saved.
   * @returns The saved sensor data.
   * @throws NotFoundException if the sensor is not found.
   */
  public async saveData(data: SensorDataDto): Promise<SensorData> {
    const { sensorId, ...rest } = data;

    // Retrieve the sensor by its ID.
    const currentSensor = await this.getSensorById(sensorId);

    // Save the sensor data with the associated sensor reference.

    return await this.sensorDataModel.create({
      ...rest,
      sensor: currentSensor._id,
    });
  }

  /**
   * Retrieves all sensor data associated with a specific sensor ID.
   * @param sensorId - ID of the sensor for which data is to be retrieved.
   * @returns An array of sensor data.
   * @throws NotFoundException if the sensor is not found.
   */
  public async getAllSensorDataBySensorId(
    sensorId: string,
  ): Promise<SensorData[]> {
    const sensor: Sensor = await this.getSensorById(sensorId);

    // Find all sensor data entries associated with the given sensor ID.
    return await this.sensorDataModel.find({ sensor: sensor._id }).exec();
  }

  /**
   * Retrieves all sensor data from the database.
   * @returns An array of all sensor data.
   */
  public async getAllSensorData(): Promise<SensorData[]> {
    return await this.sensorDataModel.find().exec();
  }

  /**
   * Retrieves a sensor by its ID.
   * @param id - ID of the sensor to be retrieved.
   * @returns The sensor object.
   * @throws NotFoundException if no sensor is found with the given ID.
   */
  public async getSensorById(id: string): Promise<Sensor> {
    const currentSensor: Sensor = await this.sensorModel
      .findOne({ _id: id })
      .exec();

    if (!currentSensor) {
      throw new NotFoundException(`Sensor with id ${id} not found`);
    }

    return currentSensor;
  }

  /**
   * Retrieves all sensors from the database.
   * @returns An array of all sensors.
   */
  public async getAllSensors(): Promise<Sensor[]> {
    return await this.sensorModel.find().exec();
  }

  /**
   * Retrieves the most recent sensor data for a specific sensor.
   * @param sensorId - ID of the sensor for which the last data entry is to be retrieved.
   * @returns The most recent sensor data entry.
   * @throws NotFoundException if the sensor is not found.
   */
  public async getLastSensorData(sensorId: string): Promise<SensorData> {
    const sensor: Sensor = await this.getSensorById(sensorId);

    // Find the most recent sensor data entry for the given sensor.
    return await this.sensorDataModel
      .findOne({ sensor: sensor._id })
      .sort({ createdAt: -1 })
      .exec();
  }
}
