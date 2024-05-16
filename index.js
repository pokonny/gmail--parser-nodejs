const fs = require('fs').promise
const path = require('path')
const express = require('express')
const db = require('./queries')
const app = express()
const port = 3001
const bodyParser = require('body-parser')
const array_obj = []


app.use(function (req, res, next) {

  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');

  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers');

  next();

});


const process = require('process')
const {authenticate} = require('@google-cloud/local-auth')

const {google} = require('googleapis')

const SCOPES = ['https://mail.google.com/'];

// The file token.json stores the user's access and refresh tokens, and is

// created automatically when the authorization flow completes for the first

// time.

const TOKEN_PATH = path.join(process.cwd(), 'token.json');

const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');



/**

 * Reads previously authorized credentials from the save file.

 *

 * @return {Promise<OAuth2Client|null>}

 */

async function loadSavedCredentialsIfExist() {

  try {

    const content = await fs.readFile(TOKEN_PATH);

    const credentials = JSON.parse(content);

    return google.auth.fromJSON(credentials);

  } catch (err) {

    return null;

  }

}



/**

 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.

 *

 * @param {OAuth2Client} client

 * @return {Promise<void>}

 */

async function saveCredentials(client) {

  const content = await fs.readFile(CREDENTIALS_PATH);

  const keys = JSON.parse(content);

  const key = keys.installed || keys.web;

  const payload = JSON.stringify({

    type: 'authorized_user',

    client_id: key.client_id,

    client_secret: key.client_secret,

    refresh_token: client.credentials.refresh_token,

  });

  await fs.writeFile(TOKEN_PATH, payload);

}



/**

 * Load or request or authorization to call APIs.

 *

 */

async function authorize() {

  let client = await loadSavedCredentialsIfExist();

  if (client) {

    return client;

  }

  client = await authenticate({

    scopes: SCOPES,

    keyfilePath: CREDENTIALS_PATH,

  });

  if (client.credentials) {

    await saveCredentials(client);

  }

  return client;

}



/**

 * Lists the labels in the user's account.

 *

 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.

 */

async function listlabels(auth){
const gmail = google.gmail({version: 'v1', auth});
 const response = await gmail.users.labels.list({

      userId: 'me' // The authenticated user's ID

    });

    const labels = response.data.labels;

    console.log('Labels:');

    labels.forEach((label) => {

      console.log(label.name+" "+label.id);

    });
}






/*Method opens all emails matching the query requirements. Scraps the necessary data from each email 
then inputs it into  the postgres sql database.

*/
async function listmessages(auth){
const gmail = google.gmail({version: 'v1', auth});
/*** Grabs all emails and then stores the ids in message_id**/
const lista = await gmail.users.messages.list({
	userId:'me', 

	maxResults:125, 
	
	q:"subject: You've Made A AND is:unread",
});


/*Contains the raw data from the email */
message_id = lista.data.messages;
final_array = [];
date_rec = "";


/*Loops through each email using message_id to grab the specific message*/
for (const messages in message_id){
final_array = [];
	const msg = await gmail.users.messages.get(
{userId: 'me',
id: message_id[messages].id
});
/*Decodes the message from base64 to ascii*/

    	message_encoded = msg.data.payload.parts[1].body.data;
	message_decoded = Buffer.from(message_encoded, 'base64').toString('ascii');
	
/*Grabs the date the email arrived. For some reason the date is one day ahead from the actual arrival.
 Will fix later.*/
	grab_date = msg.data.payload["headers"];
	for(item in grab_date){
	if (grab_date[item]["name"]=="Date"){
		date_rec = grab_date[item]["value"].substring(5,16);
}
}

/*
Splits the email along the var first_split to obtain the necessary data. 
Finds index </td> to determine where the data ends
Split's the snipped data along delimeter "\n" into  an array
Affix flag to first line to make later processing easier
Pushes final processed string into final_array then deletes the snippet from the original message_decoded
Loops through email til first_split =-1
*/

 first_split = message_decoded.lastIndexOf('<td style="padding-left: 8px;">');



       	while (first_split != -1){
                hld_str = message_decoded.substring(first_split);

                sec_split = hld_str.indexOf("</td>");

                final_res = hld_str.substring(0,sec_split+6);

                array_la = final_res.split("\n");

                affix_flag = "Title: ";

                array_la[1] = affix_flag.concat(array_la[1].trimStart());

                final_array.push(array_la);

                message_decoded = message_decoded.replace(final_res,"");

                first_split = message_decoded.lastIndexOf('<td style="padding-left: 8px;">');   

}   
/*Final_array is a double array. The below loop removes the html tags from the data then pushes it into the database*/

        for(let i = 0; i < final_array.length; i++){

               	for(let j = final_array[i].length-1; j > 0; j--){

                        proc_string = final_array[i][j];

                	if (proc_string.includes("Size") || proc_string.includes("Your")|| proc_string.includes("Title:")){

                           proc_string = proc_string.replace( /(?<=\d\))|<[^>]*>/g,"");
                           proc_string = proc_string.replace(/:[^()]*\(/g,": ");
                           proc_string = proc_string.replace("\r","");
                           proc_string = proc_string.replace(")","");
                           proc_string = proc_string.replace("US$","");    
                		if(proc_string.includes("Title:")){     
					proc_string = final_array[i][j].replace( /<[^>]+>|[\r]/g,"");

                        		proc_string  =proc_string.replace(/^[^:]*:/,"");

                        		lalal = proc_string.indexOf("of");

                        		redd = proc_string.substring(0,lalal);

                		        final_array[i][j] = proc_string.substring(lalal+3);
		
                      			vicki = redd.split("x");
	
        		                b = vicki[0].trimStart();
	
        		                c = vicki[1].trimStart();

                        		final_array[i].splice(j+1,0,b,c);
                  			}

	                        else{

                        	 	proc_string  = proc_string.replace(/^[^:]*:/,"");
			
                       		 	proc_string = proc_string.replace("%","");

                        		final_array[i][j] =proc_string.trimStart().trimEnd().replace("</p>","");

                        	}



                        }/*closes the larger if statement*/

	else{

	final_array[i].splice(j,1);}
	}
/*closes the inner for loop*/
final_array[i].splice(0,1);
if (final_array[i].length == 6){

final_array[i].splice(3,0, "null");

}
const datetime = new Date();

k = datetime.toISOString().slice(0,10);

final_array[i].push(k);
final_array[i].push(date_rec);
}

db.add_it(final_array);
}
}

authorize().then(listmessages).catch(console.error);


/*Deploys the application to the react front-end*/
app.use(express.json())

app.use(function (req, res, next) {

  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');

  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers');

  next();

});


app.get('/', (req, res) => {

  db.getRecords()

  .then(response => {

    res.status(200).send(response);

  })

  .catch(error => {

    res.status(500).send(error);

  })
})
app.listen(port, () => {

  console.log(`App running on port ${port}.`)

})
