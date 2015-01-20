# GtalkLog

GtalkLog allows you to keep receiving an email informing you that someone spoke to you on Gmail while you were offline

Get the script to work following few easy steps:

1. Upload gtalk-logs-script.ods spreadsheet to Google Docs (https://docs.google.com/spreadsheets/u/0/)

2. Fill the fields in the spreadsheet as indicated.
	
	In general it is enough to replace "yourmail@gmail.com" with your own address,all other fields can remain with their default values.

3. Create an script associated to the spreadsheet

	3.1 Tools -> Script editor
	
	3.2 Paste the content of gtalk-logs-script.gs  file on the editor
	
	3.3 Save the script

4. Create the associated triggers to schedule the script

	4.1 Resources -> Current project triggers
	
	4.2 Create time-driven trigger to run the function "sendEmail" (every 15 or 30 minutes is a good interval)
	
	4.3 Save the trigger, save the script and finally save the spreadsheet.
	
5. Enjoy.
