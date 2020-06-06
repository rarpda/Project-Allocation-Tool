# Project Coordination Tool

### Author - tmep, rarpda

### Project Details

This is a project built for the School of Computer Science for assisting in the task of allocation student projects.
This project was initially developed by tmep and later re-engineered by rarpda.
Tests were added (both unit and end-to-end) in order to implement regression testing.
This is a web application running on a Node.js server and a CouchDB server(later provided by the school).
The client side was built using Bootstrap.

##Setup and running application
Steps for initialising the application.
1. Setup up a CouchDB and update the variables located in the env in the root directory namely:
    1. DATABASE_USERNAME = your DB username.
    2. DATABASE_PASSWORD = your DB password.
    3. DEVELOPMENT_DATABASE_NAME
    4. TEST_DATABASE_NAME
    5. PRODUCTION_DATABASE_NAME
2. Create the three databases with the same name as outlined above.
Documents will be saved following the following naming convention:
**Year-CohortName-DataType.**
An example of this is *2019-MASTERS-staff"*.
3. Install dependencies by running:
*npm install*
4. The default port is 9998 for the HTTPS and 8080 for HTTP but its possible to change it: (**Note that this requires updating some tests manually.**)
    1. Go to the .config file located on the root directory.
    2. Modify httpsPort and httpPort on all the cases.
5. Run the application using:
*npm run start*
6. Open Firefox or Chrome and go to <https://locahost:9998>. You should see a login page.

#Using the application#
Using the application should be straightforward however here is a general guide:
1. Once you perform the steps above to run the application enter "*test*" into the password and username fields.
2. Click submit and you'll be redirected to the homepage.
3. Here you can either add a new student cohort or click on a link to an available one.
    1. To create a new cohort just add the **year** and **cohort** name and click on the add button.
    If successful this will be displayed on the available cohorts list and you can click to navigate on it.
    Otherwise you'll see an alert popup. This can happen if you attempt to add an existing cohort.
4. Navigate to the dashboard can be done by clicking the links or via the url by going to **Allocation/Year/Cohort**.
  i.e. <https://locahost:9998/Allocation/2019/MASTERS>. Note this is **case sensitive**.

##Things you can do
Once on the dashboard there are multiple things you can do:

###Different Views
+ Import section where you can load the different types of data.
+ Project allocation section where you see all the project data.
+ Staff view where you can see the staff information.
+ Visualisation view where you can see a graph for the staff data.

###Importing and Exporting data
Export data into various formats PDF (to be uploaded on to studres), CSV and also zipped folders for MMS submissions.
You can also download the current progress as a JSON file which can later be uploaded onto application again.

###Dashboard features
To modify data simply click on a cell and start writing. The only be saved when:
+ Before exporting files, data is saved.
+ When the save button is clicked.
You can also filter the table using the top search bar. This will work for both the staff and the project allocation views.
You can also sort the list(ascending and descending) by clicking on the headers.

