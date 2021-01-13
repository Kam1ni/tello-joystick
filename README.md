# Tello Joystick

This app lets you control your Tello drone with a HID controller. I tested this with my Trust GXT 545 in XInput mode so I assume it works with Xbox controllers.

## Build

To build the project make sure you have all dependencies installed first.

```$ npm install```

Once installed you can build the project by running the following command.

```$ npm run build```

## Run

To run the project execute the following command. Make sure you're connected to your Tellos Wi-Fi before running.

```$ npm run start```

At first you will receive a list of available HID devices. Type the number corresponding to your controller and press enter.
Once you start receiving the drones status you can take off.

## Controls

| description | binding |
| --- | --- |
| takeoff | A button|
| land | B button |
| ascend/descend | left analog stick y axis |
| yaw | left analog stick x axis |
| forward/backward | right analog stick y axis |
| strafe left/right | right analog stick x axis |

You can edit the bindings in src/controller-config.json. Make sure you rebuild the project if you do so.
The keys "verticalAxis", "yawAxis", "rollAxis", "pitchAxis", "takeOffIndex" and "landIndex" correspond to the index of the byte inside the buffer that is received from your HID device.
The keys "takeOffBit" and "landBit" corresponds to the bit that should be watched for those actions.