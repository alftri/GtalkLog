//Packs all the missed chats from a contact
function packChats(from,contact,period){
Logger.log("packChats()");
var threads = GmailApp.search('from:"' + from + '" subject:"' + contact + ' spoke to you while you were offline" newer_than:' + period + 'd');
var sumUp = "";
for (var i = 0; i < threads.length; i++){
  var messages = GmailApp.getMessagesForThread(threads[i]);
  for (var j = 0; j < messages.length; j++){
    sumUp = sumUp +  messages[j].getBody();
  }
  GmailApp.moveThreadToTrash(threads[i]);
}
return sumUp;
}

//Splits name and email of the chat´s sender
function splitFrom(from, reqInfo){
  var subStr = from.substring(0,from.length-1);
  var dataArray = subStr.split("<");
  if (reqInfo == "name"){
    return dataArray[0];
  }
  else{
    if (reqInfo == "email"){
      return dataArray[1];
    }
    else{
      return "wrong request";
    }
  }
}

//Finds the last appearance of the account´s owner on a thread
function lastUserMessage(msgs,mail) {
Logger.log("lastUserMessage()");
  var pos = -1;
  for (var i = 0 ; i < msgs.length; i++){
    if (splitFrom(msgs[i].getFrom(),"email") == mail){
    pos=i;
    }
  }
    return pos;
}


function sendEmails() {
  Logger.log("Sendemails()");
  var sheet = SpreadsheetApp.getActiveSheet();
  var lastUpdate = sheet.getRange(1, 2).getValue(); //Last time the sheet has been accessed
  var userEmail = sheet.getRange(2, 2).getValue(); //Gmail account were the chats are located
  var recipient = sheet.getRange(3, 2).getValue();//Email address that will be notified
  var maxThreads = sheet.getRange(4, 2).getValue(); //Maximum retrieved threads
  var startRow = sheet.getRange(5, 2).getValue();  // First row of data to process
  var startColumn = sheet.getRange(6, 2).getValue(); //First column of data to process
  var packPeriod = sheet.getRange(7, 2).getValue(); //Defines how many days of missed chats will pack each email.
  var timeZone = sheet.getRange(8, 2).getValue();
  var threads = GmailApp.getChatThreads(0,maxThreads);//Getting the threads
  var timeTolerance = 15; //define the number of minutes that must exists since the last user intervined to be considered a missed chat
    
  var lastChat=0; // Exits when the last new chat has been found
  var numRows = 0;   // Number of rows to process
  var nameFrom = "";
  var mailFrom = "";
  var i = 0;
  while (i < threads.length && lastChat == 0){
    if (threads[i].getLastMessageDate() > lastUpdate){
      var messages = GmailApp.getMessagesForThread(threads[i]); 
      var lastMsg = lastUserMessage(messages,userEmail);
      Logger.log("Last user message found on position " + lastMsg);

      var formatedData = "";
      numRows++;

      //if (messages[lastMsg+1] && (lastMsg ==-1 || (messages[lastMsg].getDate().getTime()+timeTolerance * 60000) < messages[lastMsg+1].getDate().getTime()))
     if(messages[lastMsg+1]){
        mailFrom = splitFrom(messages[lastMsg+1].getFrom(),"email");
        formatedData = Utilities.formatDate(messages[lastMsg+1].getDate(),timeZone,"EEE MMM d yyyy hh:mm aaa");
        nameFrom = splitFrom(messages[lastMsg+1].getFrom(),"name");
        sheet.getRange(startRow + i, startColumn).setValue(nameFrom);
        sheet.getRange(startRow + i, startColumn + 1).setValue(sheet.getRange(startRow + i, startColumn + 1).getValue() + "<hr><center>" + formatedData + "</center>");
        sheet.getRange(startRow + i, startColumn + 1).setValue(sheet.getRange(startRow + i, startColumn + 1).getValue() + "<br><b>"+nameFrom+"</b><br> ");
        for (var j = lastMsg + 1 ; j < messages.length; j++) {
          if (messages[j].getDate()>sheet.getRange(1, 2).getValue()){
            sheet.getRange(startRow + i, startColumn + 1).setValue(sheet.getRange(startRow + i, startColumn + 1).getValue()+messages[j].getBody()+"<br>");
          } 
        }
      }
    }
    else{
    lastChat = 1;
    }
  i++;
  }
  if (numRows != 0){
    var dataRange = sheet.getRange(startRow, startColumn, numRows, 2)
    // Fetch values for each row in the Range.
    var data = dataRange.getValues();
    var sumUpMessage = "";
    for (i in data) {
      var row = data[i];
      if (row[0] != ""){//discard the threads were the user spoke the last
        var subject = row[0]+" spoke to you while you were offline";
        var message = row[1];// Second column
        sumUpMessage = message + packChats (userEmail,row[0],packPeriod);
        MailApp.sendEmail(recipient, subject, sumUpMessage,{ htmlBody: sumUpMessage });
      }
    }
    //redrawing the sheet
    sheet.deleteColumns(startColumn, 2);
    sheet.insertColumns(startColumn, 2);
  }
var d = new Date();
sheet.getRange(1, 2).setValue(d);// Update the date of the last check
  
}
