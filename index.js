const fs = require('fs').promises;
const prod_inf = require('./prod_inf')
const path = require('path');

const process = require('process');

const {authenticate} = require('@google-cloud/local-auth');

const {google} = require('googleapis');


// If modifying these scopes, delete token.json.

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

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



async function listmessages(auth){
const gmail = google.gmail({version: 'v1', auth});
/*** Grabs all emails and then stores the ids in message_id**/
const lista = await gmail.users.messages.list({
	userId:'me', 

	maxResults:778, 
	
	q:"subject: You've Made A AND is:unread"
});
array_objs=[];
temp_obj = [];
message_id = lista.data.messages;
final_array = [];
for (const messages in message_id){
	const msg = await gmail.users.messages.get({userId: 'me',id: message_id[messages].id});
	final_array = [];
     	message_encoded = msg.data.payload.parts[1].body.data;
	message_decoded = Buffer.from(message_encoded, 'base64').toString('ascii');
	first_split = message_decoded.lastIndexOf('<td style="padding-left: 8px;">');
	
	while (first_split != -1){
		hld_str = message_decoded.substring(first_split);
		sec_split = hld_str.indexOf("</td>");
		final_res = hld_str.substring(0,sec_split+6);
		array_la = final_res.split("\n");
		affix_flag = "Title: ";
		array_la[1] = affix_flag.concat(array_la[1].trimStart());
		final_array.push.apply(final_array,array_la);
		message_decoded = message_decoded.replace(final_res,"");
		first_split = message_decoded.lastIndexOf('<td style="padding-left: 8px;">');	
	}
for (i in final_array){
	proc_string = final_array[i];
	        if (proc_string.includes("Size") || proc_string.includes("Your")|| proc_string.includes("Title:")){
           		proc_string = proc_string.replace( /(?<=\d\))|<[^>]*>/g,"");
			proc_string = proc_string.replace(/:[^()]*\(/g,": ");
                        proc_string = proc_string.replace("\r","");
			proc_string = proc_string.replace(")","");
                        proc_string = proc_string.replace("US$","");         

if(proc_string.includes("Title:")){     
   proc_string  =proc_string.replace(/^[^:]*:/,"");
   lalal = proc_string.indexOf("of");
   redd = proc_string.substring(0,lalal);
   temp_obj.push(proc_string.substring(lalal+3));
   vicki = redd.split("x");
   temp_obj.push.apply(temp_obj,vicki);
}
else{
proc_string  =proc_string.replace(/^[^:]*:/,"");
temp_obj.push(proc_string.trimStart().trimEnd().replace("</p>",""));}
}
}
objecct = new prod_inf(temp_obj);
array_obj.push(objecct);
console.log(objecct.name);
temp_obj = [];
}

}
authorize().then(listmessages).catch(console.error);

