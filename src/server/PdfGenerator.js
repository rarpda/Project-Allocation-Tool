/**
 * File that implements the methods required to generate a PDF file with all the project allocation information to be stored on studres.
 * @module PdfGenerator
 * */

const fs = require("fs");


/*Headers of tables */
const studentHeaders = ["FORENAME", "SURNAME", "PROJECT", "SUPERVISOR", "2ND MARKER", "NOTES"];
const supervisorHeaders = ["FORENAME", "SURNAME", "TOTAL SUPERVISOR COUNT", "TOTAL MARKER COUNT", "NOTES"];

/**
 * Method to add a page and data to pdf document.
 * @param filepath The filepath where the file will be stored.
 * @param document The Document object.
 * @param title The title of the page.
 * @param headers The headers of the table.
 * @param data The data to be loaded onto the body.
 * */
const addDataToPdf = function (filepath, document, title, headers, data) {
    if (typeof data !== "undefined" && data.length > 0) {
        document.text(title, 10, 10);
        document.autoTable({
            head: [headers],
            body: data,
        });
        let outputData = document.output();
        fs.writeFileSync(filepath, outputData);
        document.addPage();
    }
};


/**
 * Function to generate the pdf data for project allocations.
 * @param filepath The filepath where the data will be stored
 * @param document The pdf document created.
 * @param listOfProjects An array of allocated projects to be added.
 * @param listOfDissertations An array of current dissertations available.
 * */
const generateDissertationPdfData = function (filepath, document, listOfProjects, listOfDissertations) {
    let externalProjects = [];
    /*Iterate through list of dissertations.*/
    for (const dissertation of listOfDissertations) {
        let listOfProjectsCsv = [];
        /*Find all projects with the same dissertation option.*/
        listOfProjects.forEach(project => {
            if (project.dissCode === dissertation.code) {
                /*Create csv line in array format. */
                const csvLine = [project.firstName, project.lastName, project.projectTitle, project.supervisor, project.secondMarker, project.notes];
                if (dissertation.external) {
                    externalProjects.push(csvLine);
                } else {
                    listOfProjectsCsv.push(csvLine);
                }
            }
        });

        /*Process all internal projects first*/
        addDataToPdf(filepath, document, dissertation.title, studentHeaders, listOfProjectsCsv);
    }

    /*Process all external projects in the end*/
    addDataToPdf(document, "Code: Joint Projects Managed Externally", studentHeaders, externalProjects);
};


/**
 * Function to create the pdf document with relevant information on student and staff.
 * @param filepath The filepath where the data will be stored.
 * @param projectData An array of data for project allocations.
 * @param supervisorData An array of supervisors available.
 * @param dissertationInformation An array of current dissertations available.
 * @return Promise<Any> A promise which will return the output file or error message.
 * */
exports.generatePdf = function (filepath, projectData, supervisorData, dissertationInformation) {
    return new Promise((resolve, reject) => {
        /*Initiate global parameters so that jspdf can be used on the server side.*/
        try {
            global.window = {
                document: {
                    createElementNS: () => {
                        return {}
                    }
                }
            };
            global.navigator = {};
            global.btoa = () => {
            };
            global.html2pdf = require('html2pdf');

            /*Instantiate pdf document class*/
            let jsPDF = require('jspdf');
            require('jspdf-autotable');
            let doc = new jsPDF('landscape');

            /*Student data*/
            generateDissertationPdfData(filepath, doc, projectData, dissertationInformation);
            let csvData = [];

            /*Supervisors*/
            /*Iterate through list of supervisors.*/
            for (const supervisor of supervisorData) {
                /*Find all projects with the same dissertation option.*/
                const fullName = supervisor.givenNames + " " + supervisor.familyName;

                let totalMarkerCount = 0;
                let totalSupervisorCount = 0;
                projectData.forEach(project => {
                    /*Calculate supervisor counts and marker counts*/
                    if (project.supervisor === fullName) {
                        totalMarkerCount++;
                        totalSupervisorCount++;
                    } else if (project.secondSupervisor === fullName) {
                        totalSupervisorCount++;
                    } else if (project.secondMarker === fullName) {
                        totalMarkerCount++;
                    }
                });
                csvData.push([supervisor.givenNames, supervisor.familyName, totalSupervisorCount, totalMarkerCount, supervisor.notes]);
            }
            addDataToPdf(filepath, doc, "Supervisors with agreed projects", supervisorHeaders, csvData);

            /*Delete all global variables previously initialised.*/
            delete global.window;
            delete global.navigator;
            delete global.btoa;
            delete global.html2pdf;
            resolve(filepath);
        } catch (error) {
            reject(error)
        }
    });
};