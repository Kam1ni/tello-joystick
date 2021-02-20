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

async function selectDevice():Promise<IXinputDevice>{
	let devices = XinputWrapper.list();
	if (devices.length == 0){
		throw new Error("No controllers attached");
	}
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	for (let i = 0; i < devices.length; i++){
		console.log(`${i+1}: ${devices[i].product}`);
	}

	while(true){
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
		let device = devices[number-1];
		return XinputWrapper.getDevice(device.vendorId, device.productId);
	}
}


// eslint-disable-next-line max-lines-per-function
async function main(){
	let hid = await selectDevice();

	let drone = new Tello();

	let connected = false;
	let landedPressed = false;
	let takeOffPressed = false;

	drone.on("connection", ()=>{
		connected = true;
		drone.send("speed", {value: speed});
		if (process.argv.indexOf("--stream") != -1){
			console.log("Running with stream");
			drone.send("streamon");
		}else{
			console.log("Running without stream");
			drone.send("streamoff");
		}
	});

	drone.on("state", (state:any)=>{
		process.stdout.write(`\rReceived drone state: ${JSON.stringify(state)}`);
	});

	drone.on("message", (...message:any)=>{
		console.log(`Received drone message: ${message}`);
	});


	setInterval(async ()=>{
		if (!connected) return;
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
		//process.stdout.write(`\r${JSON.stringify({a: roll, b: pitch, c: vertical, d: yaw})}`);
		drone.send("rc", {a: -roll, b: pitch, c: vertical, d: -yaw});
	}, interval);
}

main();