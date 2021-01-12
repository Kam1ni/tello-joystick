import { IDeviceListing, IXinputDevice, XinputWrapper } from "./xinput-wrapper";
import * as readline from "readline";
import Tello from "tello-drone";

async function askDeviceNumber(rl:readline.Interface):Promise<number>{
	return new Promise<number>((resolve,reject)=>{
		rl.question("Select a device by number: ", (answer:string)=>{
			let number = parseInt(answer);
			resolve(number);
		});
	});
}

let speed = 10;
let interval = 100;
function computeDistance(value:number):number {
	return Math.round(100 / 128 * value);
}

// eslint-disable-next-line max-lines-per-function
async function main(){
	let devices = XinputWrapper.list();
	if (devices.length == 0){
		console.error("No controllers attached");
		return;
	}
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	for (let i = 0; i < devices.length; i++){
		console.log(`${i+1}: ${devices[i].product}`);
	}

	let device:IDeviceListing | null = null;
	while(!device){
		let number = await askDeviceNumber(rl);
		if (isNaN(number)){
			console.log("Invalid number");
			continue;
		}
		if (number < 1){
			console.log("Number may not be smaller then 0");
			continue;
		}
		if (number > devices.length){
			console.log("Number is to high");
			continue;
		}
		device = devices[number-1];
	}

	let hid = XinputWrapper.getDevice(device.vendorId, device.productId);
	hid.onupdate = function(data:IXinputDevice){
		//process.stdout.write(`\r${JSON.stringify(data)}`);
	};

	let drone = new Tello();/*{
		on(data:any, args:any){

		},
		send(data:string, args?:any){
			console.log(`Sending: ${data} ${args.x}`);
		}
	};*/

	let connected = false;
	let landedPressed = false;
	let takeOffPressed = false;

	drone.on("connection", ()=>{
		connected = true;
		console.log("Connected to drone");
		drone.send("speed", {value: speed});
	});

	drone.on("state", (state:any)=>{
		process.stdout.write(`\rReceived drone state: ${JSON.stringify(state)}`);
	});

	drone.on("message", (...message:any)=>{
		console.log(`Received drone message: ${message}`);
	});

	drone.on("send", (...data) => {
		console.log(data);
	});

	// eslint-disable-next-line max-lines-per-function
	setInterval(async ()=>{
		if (!connected) return;
		process.stdout.write(JSON.stringify(hid));

		if (hid.takeOff){
			if (!takeOffPressed){
				drone.send("takeoff");
			}
			takeOffPressed = true;
		}else{
			takeOffPressed = false;
		}

		if (hid.land){
			if (!landedPressed){
				drone.send("land");
			}
			landedPressed = true;
		}else{
			landedPressed = false;
		}

		let vertical = computeDistance(hid.vertical);
		let yaw = computeDistance(hid.yaw);
		let roll = computeDistance(hid.roll);
		let pitch = computeDistance(hid.pitch);

		console.log({a: roll, b: pitch, c: vertical, d: yaw});
		drone.send("rc", {a: roll, b: pitch, c: vertical, d: yaw});

		//if (vertical > 0){
		//	drone.send("up", {value: vertical});
		//}else if (vertical < 0){
		//	drone.send("down", {value: -vertical});
		//}
		//
		//if (yaw > 0){
		//	drone.send("ccw", {value: yaw});
		//}else if (yaw < 0){
		//	drone.send("cw", {value: -yaw});
		//}
		//
		//if (roll > 0){
		//	drone.send("left", {value: roll});
		//}else if (roll < 0){
		//	drone.send("right", {value: -roll});
		//}
		//
		//if (pitch > 0){
		//	drone.send("forward", {value: pitch});
		//}else if (pitch < 0){
		//	drone.send("back", {value: -pitch});
		//}
	}, interval);
}

main();