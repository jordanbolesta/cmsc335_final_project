const path = require("path");

const express = require("express");
const routes = require("./routes/expressRoutes");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/", routes);

app.use(express.static(path.join(__dirname, "css")));

app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));


const portNumber = 8064;

// check arg length:
if (process.argv.length !== 2) {

	process.stdout.write(`Usage script.js portNumber argument length error\n`);
	process.exit();
}


// render main page:
app.get("/", (request, response) => { 

	response.sendFile(path.join(__dirname, "main_page.html"));
});


// display in terminal:
app.listen(portNumber); 
console.log(`Web server started and is running at http://localhost:${portNumber}`);
process.stdout.write("Stop to shutdown the server: ");

process.stdin.setEncoding("utf8"); 

process.stdin.on('readable', () => {  
	const dataInput = process.stdin.read();
	
	if (dataInput !== null) {
		const command = dataInput.trim();

		if (command === "stop") {
			
			process.stdout.write("Shutting down the server\n"); 
            process.exit(0);

        } else {

			process.stdout.write(`Invalid command: ${command}\n`);
            process.stdout.write("Type stop to shutdown the server: ");
		}
		process.stdin.resume(); 
    }
});
