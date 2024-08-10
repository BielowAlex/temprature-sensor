import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SensorService } from './sensor.service';
import { SensorDataDto } from './dto/sensor-data.dto';
import { SensorData } from './schemas/sensor-data.schema';
import { Sensor } from './schemas/sensor.schema';
import { CreateSensorDto } from './dto/create-sensor.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'sensor',
})
export class SensorGateway {
  @WebSocketServer()
  server: Server;

  constructor(protected readonly sensorService: SensorService) {}

  /**
   * Handles a new client connection to the WebSocket server.
   * @param client - The connected WebSocket client.
   */
  public handleConnection(@ConnectedSocket() client: Socket): void {
    console.log('Client connected', client.id); // Log the client connection
  }

  /**
   * Handles a client disconnection from the WebSocket server.
   * @param client - The disconnected WebSocket client.
   */
  public handleDisconnect(@ConnectedSocket() client: Socket): void {
    console.log('Client disconnected', client.id); // Log the client disconnection
  }

  /**
   * Handles the 'saveSensorData' event from a WebSocket client.
   * Saves sensor data and then broadcasts the updated sensor data list.
   * @param client - The WebSocket client sending the message.
   * @param payload - The sensor data to be saved.
   */
  @SubscribeMessage('saveSensorData')
  public async handleSaveSensorData(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SensorDataDto,
  ): Promise<void> {
    try {
      // Save the sensor data
      await this.sensorService.saveData(payload);

      // Retrieve the updated sensor data list for the given sensor ID
      const sensorDataList: SensorData[] =
        await this.sensorService.getAllSensorDataBySensorId(payload.sensorId);

      // Broadcast the updated sensor data list to clients
      this.server.emit(`sensor_data_list_${payload.sensorId}`, {
        data: sensorDataList,
      });
    } catch (error) {
      // Log the error to the server console
      console.error('Error saving sensor data:', error.message);

      // Send an error message back to the client
      client.emit('error', {
        message: 'Failed to save sensor data',
        details: error.message,
      });
    }
  }

  /**
   * Handles the 'createSensor' event from a WebSocket client.
   * Creates a new sensor and then broadcasts the new sensor information.
   * @param payload - The sensor data for creating a new sensor.
   */
  @SubscribeMessage('createSensor')
  public async handleCreateSensor(
    @MessageBody() payload: CreateSensorDto,
  ): Promise<void> {
    try {
      // Create and save the new sensor
      const newSensor: Sensor = await this.sensorService.createSensor(payload);

      // Broadcast the new sensor data to clients
      this.server.emit('new_sensor', newSensor);
    } catch (error) {
      // Log the error to the server console
      console.error('Error creating sensor:', error.message);

      // Send an error message to all clients
      this.server.emit('error', {
        message: 'Failed to create sensor',
        details: error.message,
      });
    }
  }

  /**
   * Handles the 'getSensorLastData' event from a WebSocket client.
   * Retrieves and broadcasts the sensor last data for the given sensor ID.
   * @param sensorId string
   */
  @SubscribeMessage('getSensorLastData')
  public async handleGetSensorDataList(
    @MessageBody('sensorId') sensorId: string,
  ): Promise<void> {
    try {
      // Retrieve and broadcast the sensor last data for the given sensor ID
      const sensorLastData: SensorData =
        await this.sensorService.getLastSensorData(sensorId);
      console.log(sensorLastData);
      // Broadcast the sensor last data
      this.server.emit(`sensor_last_data_${sensorId}`, sensorLastData);
    } catch (error) {
      // Log the error to the server console
      console.error('Error retrieving last sensor data:', error.message);

      // Send an error message to all clients
      this.server.emit('error', {
        message: `Failed to retrieve last data for sensor ${sensorId}`,
        details: error.message,
      });
    }
  }

  /**
   * Handles the 'getAllSensorDataBySensorId' event from a WebSocket client.
   * Retrieves and broadcasts all sensor data for a specific sensor ID.
   * @param id - The sensor ID for which to fetch data.
   */
  @SubscribeMessage('getAllSensorDataBySensorId')
  public async handleGetAllSensorDataBySensorId(
    @MessageBody('sensorId') id: string,
  ): Promise<void> {
    try {
      // Retrieve and broadcast all sensor data for the given sensor ID
      const sensorDataList: SensorData[] =
        await this.sensorService.getAllSensorDataBySensorId(id);

      // Broadcast the sensor data list to clients
      this.server.emit(`sensor_data_list_${id}`, {
        data: sensorDataList,
      });
    } catch (error) {
      // Log the error to the server console
      console.error('Error retrieving sensor data:', error.message);

      // Send an error message to all clients
      this.server.emit('error', {
        message: `Failed to retrieve data for sensor ${id}`,
        details: error.message,
      });
    }
  }

  /**
   * Handles the 'getAllSensors' event from a WebSocket client.
   * Retrieves and broadcasts a list of all sensors.
   */
  @SubscribeMessage('getAllSensors')
  public async handleGetAllSensors(): Promise<void> {
    try {
      // Retrieve and broadcast the list of all sensors
      const sensorList: Sensor[] = await this.sensorService.getAllSensors();

      // Broadcast the sensor list to clients
      this.server.emit('sensor_list', {
        data: sensorList,
      });
    } catch (error) {
      // Log the error to the server console
      console.error('Error retrieving all sensors:', error.message);

      // Send an error message to all clients
      this.server.emit('error', {
        message: 'Failed to retrieve sensors',
        details: error.message,
      });
    }
  }

  /**
   * Handles the 'getAllSensorsData' event from a WebSocket client.
   * Retrieves and broadcasts a list of all sensor data.
   */
  @SubscribeMessage('getAllSensorsData')
  public async handleGetAllSensorsData(): Promise<void> {
    try {
      // Retrieve and broadcast the list of all sensors
      const sensorList: SensorData[] =
        await this.sensorService.getAllSensorData();

      // Broadcast the sensor list to clients
      this.server.emit('sensor_data_list', {
        data: sensorList,
      });
    } catch (error) {
      // Log the error to the server console
      console.error('Error retrieving all sensor data:', error.message);

      // Send an error message to all clients
      this.server.emit('error', {
        message: 'Failed to retrieve sensor data',
        details: error.message,
      });
    }
  }
}
