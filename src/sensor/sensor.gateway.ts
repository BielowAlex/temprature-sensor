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
    // Save the sensor data
    await this.sensorService.saveData(payload);

    // Retrieve the updated sensor data list for the given sensor ID
    const sensorDataList: SensorData[] =
      await this.sensorService.getAllSensorDataBySensorId(payload.sensorId);

    // Broadcast the updated sensor data list to clients
    this.server.emit(`sensor_data_list_${payload.sensorId}`, {
      data: sensorDataList,
    });
  }

  /**
   * Handles the 'createSensor' event from a WebSocket client.
   * Creates a new sensor and then broadcasts the new sensor information.
   * @param payload - The sensor data for creating a new sensor.
   */
  @SubscribeMessage('createSensor')
  public async handleCreateSensor(
    @MessageBody() payload: SensorDataDto,
  ): Promise<void> {
    // Create and save the new sensor data
    const newSensor: SensorData = await this.sensorService.saveData(payload);

    // Broadcast the new sensor data to clients
    this.server.emit('new_sensor', { sensor: newSensor });
  }

  /**
   * Handles the 'getSensorDataList' event from a WebSocket client.
   * Retrieves and broadcasts the sensor data list for the given sensor ID.
   * @param payload - The sensor data for fetching the list.
   */
  @SubscribeMessage('getSensorDataList')
  public async handleGetSensorDataList(
    @MessageBody() payload: SensorDataDto,
  ): Promise<void> {
    // Retrieve and broadcast the sensor data list for the given sensor ID
    const sensorDataList: SensorData[] =
      await this.sensorService.getAllSensorDataBySensorId(payload.sensorId);

    // Broadcast the sensor data list to clients
    this.server.emit(`sensor_data_list_${payload.sensorId}`, {
      data: sensorDataList,
    });
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
    // Retrieve and broadcast all sensor data for the given sensor ID
    const sensorDataList: SensorData[] =
      await this.sensorService.getAllSensorDataBySensorId(id);

    // Broadcast the sensor data list to clients
    this.server.emit(`sensor_data_list_${id}`, {
      data: sensorDataList,
    });
  }

  /**
   * Handles the 'getAllSensors' event from a WebSocket client.
   * Retrieves and broadcasts a list of all sensors.
   */
  @SubscribeMessage('getAllSensors')
  public async handleGetAllSensors(): Promise<void> {
    // Retrieve and broadcast the list of all sensors
    const sensorList: Sensor[] = await this.sensorService.getAllSensors();

    // Broadcast the sensor list to clients
    this.server.emit(`sensor_list`, {
      data: sensorList,
    });
  }
}
