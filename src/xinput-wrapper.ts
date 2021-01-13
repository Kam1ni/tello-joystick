import HID = require("node-hid");

interface IControllerConfig {
	verticalAxis:number;
	yawAxis:number;
	rollAxis:number;
	pitchAxis:number;
	takeOffIndex:number;
	takeOffBit:number;
	landIndex:number;
	landBit:number;
}

import controllerConfig = require("./controller-config.json");

export interface IDeviceListing {
	vendorId:number;
	productId:number;
	product:string;
}

export interface IXinputDevice {
	vertical:number;
	yaw:number;
	roll:number;
	pitch:number;
	takeOff:boolean;
	land:boolean;
	onupdate?:(data:IXinputDevice)=>void;
}

export const XinputWrapper = {
	list():IDeviceListing[] {
		return HID.devices();
	},
	getDevice(vendorId:number, productId:number):IXinputDevice {
		let hid = new HID.HID(vendorId, productId);
		let values:IXinputDevice = {
			vertical: 0,
			yaw: 0,
			roll: 0,
			pitch: 0,
			takeOff: false,
			land: false,
		};

		hid.on("data", (data:Buffer)=>{
			//process.stdout.write(`\rGot data: ${JSON.stringify(data)}`);
			let vertical = data.readUInt8(controllerConfig.verticalAxis);
			let roll = data.readUInt8(controllerConfig.rollAxis);
			let pitch = data.readUInt8(controllerConfig.pitchAxis);
			let yaw = data.readUInt8(controllerConfig.yawAxis);
			let landValue = data.readUInt8(controllerConfig.landIndex);
			let takeOffValue = data.readUInt8(controllerConfig.takeOffIndex);

			values.vertical = 128 - vertical;
			values.yaw = 128 - yaw;
			values.roll = 128 - roll;
			values.pitch = 128 - pitch;

			let landBit = controllerConfig.landBit;
			let takeOffBit = controllerConfig.takeOffBit;
			values.land = (landValue & (1 << landBit)) > 0;
			values.takeOff = (takeOffValue & (1 << takeOffBit)) > 0;

			if (values.onupdate){
				values.onupdate(values);
			}
		});

		return values;
	}
};