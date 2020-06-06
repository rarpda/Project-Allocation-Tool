/**
 * This file is the main manager of the client side.
 * It is responsible for setting up the button clicks and loading the required modules.
 * @module ClientMain
 * */
/* eslint-env browser, es6 */
/*Library imports*/
import * as table from "./TableCreator.js";
import {getData, saveData, uploadData} from "./Communications.js";
import {generateGraph} from "./Visualisations.js";

/*Setup toast */
$('.toast').toast({animation: true, autohide: false});


/* Variables used in script.*/
let dissertationData = [];
let moduleData = [];
let projectAllocationData = [];
let supervisorData = [];



/**
 * This function handles the saving data on the server.
 * @return Promise Jquery promise with status of operation.
 **/
const saveDataFunction = function () {
    /* Issue PUT requests for updating data on server side. */
    let supervisorSave = saveData(supervisorData, 'supervisor');
    let projectSave = saveData(projectAllocationData, 'projectAllocation');
    /*When all are done, load the data into the global variables. */
    //TODO add success mechanism for communication.
    return $.when(supervisorSave, projectSave).fail((error) => {
        console.error(error.message);
        displayToast("Staff and/or Project Allocation Data were not saved!");
    });
};

/**
 * This function handles the exporting of data to the client.
 * @param filename The filename of the data to retrieve (i.e. file data).
 *
 **/
const exportDataFunction = function (filename) {
    /*Save data*/
    saveDataFunction().done(() => {
        /*Get file by opening window.*/
        window.open("dataExport?filename=" + filename);
    });
};


/**
 * Method used for checking if the 4 data parameters were loaded:
 * Project allocation, Module, Supervisor, Dissertation data.
 * @return boolean True if all arrays contain data.
 * */
let wasDataLoaded = function () {
    const projectDataLoaded = projectAllocationData.length > 0;
    const moduleDataLoaded = moduleData.length > 0;
    const supervisorDataLoaded = supervisorData.length > 0;
    const dissertationDataLoaded = dissertationData.length > 0;
    return projectDataLoaded && moduleDataLoaded && supervisorDataLoaded && dissertationDataLoaded;
};

/**
 * Function to display toast message.
 * @param message Message to dispaly
 * */
const displayToast = function (message) {
    $('#toastMessage').text(message);
    $('#toastDiv').attr("hidden", false);
    $('.toast').toast('show');
};
$("#toastButton").click(function () {
    $('#toastDiv').attr("hidden", true);
    $('.toast').toast('hide');
});



/**
 * Function that is used to refresh ALL the data currently on the client side.
 *
 * */
const getAllocationData = function () {
    /*Create GET requests for fetching data from server. */
    let projectRequest = getData({dataType: 'projectAllocation'});
    let staffRequest = getData({dataType: 'staff'});
    let moduleRequest = getData({dataType: 'modules'});
    let dissertationRequest = getData({dataType: 'dissertation'});

    /*When all are done, load the data into the global variables. */
    $.when(projectRequest, staffRequest, moduleRequest, dissertationRequest).done((projectReq, staffDataReq, moduleDataReq, dissertationDataReq) => {
        /*Get the data received -> stored at index 0 of request. */
        projectAllocationData = projectReq[0];
        supervisorData = staffDataReq[0];
        moduleData = moduleDataReq[0];
        dissertationData = dissertationDataReq[0];
    }).fail((error) => {
        /*Clear data arrays*/
        projectAllocationData.length = 0;
        supervisorData.length = 0;
        moduleData.length = 0;
        dissertationData.length = 0;
        console.error(error.message);
        displayToast("Staff and/or Project Allocation Data were not loaded!");
    });
};
/*Issue data requests whilst page is loading*/
getAllocationData();


//TODO figure out how to move this to the html

/*Create listeners for data uploads */
$("#stu-upload").change((e) => {
    uploadData('student', e.target.files[0], "stu-upload", false).then(() => {
        getAllocationData();
    });
});

$("#sup-upload").change((e) => {
    uploadData('supervisor', e.target.files[0], "sup-upload").then(() => {
        getAllocationData();
    });
});

$("#inputSavedProgressSetUp").change((e) => {
    uploadData('savedProgress', e.target.files[0], "savedProgress", false).then(() => {
        getAllocationData();
    });
});


$("#dissertationUpload").change((e) => {
    uploadData('dissertationUpload', e.target.files[0], "dissertationUpload", false).then(() => {
        getAllocationData();
    });
});

$("#moduleOptionsUpload").change((e) => {
    uploadData('moduleUpload', e.target.files[0], "moduleOptionsUpload", false).then(() => {
        getAllocationData();
    });
});

$("#studentReupload").change((e) => {
    uploadData('student', e.target.files[0], "studentReupload", true).then(() => {
        getAllocationData();
    });
});

$("#supervisorReupload").change((e) => {
    uploadData('staff', e.target.files[0], "supervisorReupload", true).then(() => {
        getAllocationData();
    });
});

/*Create listeners for data uploads */
$('#saveButton').click(() => {
    saveDataFunction();
});


$('#download').click(() => {
    exportDataFunction("savedProgress");
});

$('#csvExportButton').click(() => {
    exportDataFunction("tableData");
});

$('#csvMmsGroupButton').click(() => {
    exportDataFunction("mmsGroupCsv");
});


$('#csvMmsSupervisorButton').click(() => {
    exportDataFunction("mmsSupervisorCsv");
});

$('#pdfExportDataButton').click(() => {
    exportDataFunction("pdfData");
});


$(document).ready(() => {
    /* Listeners for navigation menu*/
    $('#allocationNav').click(() => {
        /*Delete existing table */
        table.removeTableData("allocationTable");
        const projectPage = $('#projectAllocationPage');
        if (wasDataLoaded()) {
            try {
                table.createProjectAllocationTable("allocationTable", moduleData, supervisorData, projectAllocationData);
                table.enableTableSearch($("#searchTable"), 'allocationTable');
                $('main').attr("hidden", true);
                projectPage.children('.alert').attr("hidden", true);
                projectPage.attr("hidden", false);
            } catch (error) {
                console.log(error);
                alert("Error occurred! Press F12 and check dev console!");
                projectPage.children('.alert').attr("hidden", true);
            }
        } else {
            projectPage.children('.alert').attr("hidden", false);
            projectPage.attr("hidden", false);
        }
    });

    $('#staffNav').click(() => {
        table.removeTableData("staffTotalsTable");
        const facultyPage = $('#facultyStaffPage');
        if (wasDataLoaded()) {
            try {
                table.createStaffTable("staffTotalsTable", dissertationData, projectAllocationData, supervisorData);
                table.enableTableSearch($("#searchTable"), 'staffTotalsTable');
                $('main').attr("hidden", true);
                facultyPage.children('.alert').attr("hidden", true);
                facultyPage.attr("hidden", false);
            } catch (error) {
                console.log(error);
                alert("Error occurred! Press F12 and check dev console!");
                facultyPage.children('.alert').attr("hidden", true);
            }
        } else {
            facultyPage.children('.alert').attr("hidden", false);
            facultyPage.attr("hidden", false);
        }
    });

    $('#importDataNav').click(() => {
        $('main').attr("hidden", true);
        $('#importPage').attr("hidden", false);
        $('#searchTable').attr("disabled", true);
    });


    $('#visualisationNav').click(() => {
        const visualisationPage = $('#visualisationPage');
        if (wasDataLoaded()) {
            try {
                generateGraph(projectAllocationData, supervisorData);
                $('main').attr("hidden", true);
                visualisationPage.attr("hidden", false);
                $('#searchTable').attr("disabled", true);
                visualisationPage.children('.alert').attr("hidden", true);
            } catch (error) {
                console.log(error);
                alert("Error occurred! Press F12 and check dev console!");
                visualisationPage.children('.alert').attr("hidden", true);
            }
        } else {
            visualisationPage.children('.alert').attr("hidden", false);
            visualisationPage.attr("hidden", false);
        }
    });
});





