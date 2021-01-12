import { IDeviceListing, IXinputDevice, XinputWrapper } from "./xinput-wrapper";
import * as readline from "readline";

async function askDeviceNumber(rl:readline.Interface):Promise<number>{
	return new Promise<number>((resolve,reject)=>{
		rl.question("Select a device by number: ", (answer:string)=>{
			let number = parseInt(answer);
			resolve(number);
		});
	});
}

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
		process.stdout.write(`\r${JSON.stringify(data)}`);
	};
}

main();