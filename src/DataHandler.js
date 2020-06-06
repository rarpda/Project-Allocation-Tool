/**
 * File responsible for handling and processing incoming and outgoing data.
 * It checks the validity of the requests and redirects them to the database driver.
 * Checks if data is compliant with the data model.
 * @module DataHandler
 * */
/*eslint no-undef: "error"*/
/*eslint-env node*/
const studentData = require("./model/Student");
const supervisorModel = require("./model/Supervisor");
const allocationModel = require("./model/ProjectAllocation");
const pdfGen = require("./server/PdfGenerator");
const fileManager = require("./server/CsvGenerator");
const fs = require("fs");
const path = require("path");
const databaseController = require("../src/DataAccessObject");
const modulesModel = require('./model/Module');

/*Constants*/
const PROJECT_ALLOCATION_DOCUMENT_SUFFIX = "-projectAllocation";
const SUPERVISORS_DOCUMENT_SUFFIX = "-supervisors";
const MODULE_OPTIONS_DOCUMENT_SUFFIX = "-moduleOptions";
const DISSERTATION_OPTIONS_DOCUMENT_SUFFIX = "-dissertationOptions";
const AVAILABLE_COHORTS_DOCUMENT = "StudentCohorts";


/**
 * Function to load staff data from CSV file.
 * @param cohortType The cohort of students requested (i.e. Masters)
 * @param filepath The filepath of the CSV to load data from.
 * @return Promise<Any> the promise with result of the operation.
 * @throws Error due to various reasons (i.e. Data not in the correct format).
 * */
const loadCSVStaffData = function (cohortType, filepath) {
    return supervisorModel.loadFromCsvData(filepath).then(data => {
        /*Save data*/
        return databaseController.saveData(cohortType + SUPERVISORS_DOCUMENT_SUFFIX, data);
    });
};


/**
 * Function to load module information from JSON file.
 * @param cohortType The cohort of students requested (i.e. Masters)
 * @param filepath The filepath of the JSON file to load data from.
 * @return Promise<Any> the promise with result of the operation.
 * @throws Error due to various reasons (i.e. Data not in the correct format).
 * */
const loadJsonModuleOptions = function (cohortType, filepath) {
    try {
        const data = modulesModel.loadModuleInformation(filepath);
        return databaseController.saveData(cohortType + MODULE_OPTIONS_DOCUMENT_SUFFIX, data);
    } catch (error) {
        return Promise.reject(error);
    }
};


/**
 * Function to load dissertation information from JSON file.
 * @param cohortType The cohort of students requested (i.e. Masters)
 * @param filepath The filepath of the JSON file to load data from.
 * @return Promise<Any> the promise with result of the operation.
 * @throws Error due to various reasons (i.e. Data not in the correct format).
 * */
const loadJsonDissertationOptions = function (cohortType, filepath) {
    try {
        const data = modulesModel.loadDissertationOptions(filepath);
        return databaseController.saveData(cohortType + DISSERTATION_OPTIONS_DOCUMENT_SUFFIX, data);
    } catch (error) {
        return Promise.reject(error);
    }
};

/**
 * Function to create new project allocations from a newly inserted list of students.
 * @param cohortType The cohort of students requested (i.e. Masters)
 * @param filepath The filepath of the Json file to load from.
 * @return Promise<Any> the promise with result of the operation.
 * */
const createNewProjectAllocation = function (cohortType, filepath) {
    return studentData.loadFromCsvData(filepath).then(data => {
        const projectList = allocationModel.createNewList(data);
        /*Save data*/
        return databaseController.saveData(cohortType + PROJECT_ALLOCATION_DOCUMENT_SUFFIX, projectList);
    });
};


/**
 * Function to get supervisor data for a particular cohort from the database.
 * Sorting code sourced from: http://www.javascriptkit.com/javatutors/arraysort2.shtml
 * @param cohortType The cohort of students requested (i.e. Masters)
 * @return Promise<Array> a promise with either the data or the error message.
 * */
const getSupervisors = function (cohortType) {
    return databaseController.getData(cohortType + SUPERVISORS_DOCUMENT_SUFFIX).then(data => {
        let listOfSupervisors = supervisorModel.loadFromJsonData(data);
        listOfSupervisors.sort((a, b) => {
            /*Sorting array*/
            let nameA = a.familyName.toLowerCase(), nameB = b.familyName.toLowerCase();
            //sort string ascending
            if (nameA < nameB) {
                return -1;
            } else if (nameA > nameB) {
                return 1;
            } else {
                //default return value (no sorting)
                return 0;
            }
        });
        return listOfSupervisors;
    });
};

/**
 * Function to get module options for a particular cohort from the database.
 * @param cohortType The cohort of students requested (i.e. Masters)
 * @return Promise<Array> a promise with either the data or the error message.
 * */
const getModuleOptions = function (cohortType) {
    return databaseController.getData(cohortType + MODULE_OPTIONS_DOCUMENT_SUFFIX).then(data => {
        return modulesModel.loadModulesFromJsonData(data);
    });
};


/**
 * Function to get dissertations options for a particular cohort from the database.
 * @param cohortType The cohort of students requested (i.e. Masters)
 * @return Promise<Array> a promise with either the data or the error message.
 * */
const getDissertationOptions = function (cohortType) {
    return databaseController.getData(cohortType + DISSERTATION_OPTIONS_DOCUMENT_SUFFIX).then(data => {
        return modulesModel.loadDissertationsFromJsonData(data);
    });
};


/**
 * Function to get project allocation data for a particular cohort from the database.
 * @param cohortType The cohort of students requested (i.e. Masters)
 * @return Promise<Array> a promise with either the data or the error message.
 * */
const getProjectAllocations = function (cohortType) {
    return databaseController.getData(cohortType + PROJECT_ALLOCATION_DOCUMENT_SUFFIX).then(data => {
        let listOfProjects = allocationModel.loadFromJsonData(data);
        listOfProjects.sort((a, b) => {
            /*http://www.javascriptkit.com/javatutors/arraysort2.shtml*/
            let nameA = a.lastName.toLowerCase(), nameB = b.lastName.toLowerCase();
            //sort string ascending
            if (nameA < nameB) {
                return -1;
            } else if (nameA > nameB) {
                return 1;
            } else {
                //default return value (no sorting)
                return 0;
            }
        });
        return listOfProjects;
    });
};


/**
 * Function to load data from the saved progress JSON file.
 * @param cohortType The cohort of students requested (i.e. Masters)
 * @param filepath The filepath of the Json file to load from.
 * @return boolean The result of both operations.
 * */
const loadSavedProgress = async function (cohortType, filepath) {
    /*Read file */
    let rawData = JSON.parse(fs.readFileSync(filepath, 'utf8'));

    const superData = supervisorModel.loadFromJsonData(rawData.staffData);
    const projectData = allocationModel.loadFromJsonData(rawData.tableData);
    const moduleData = modulesModel.loadModulesFromJsonData(rawData.moduleData);
    const dissertationData = modulesModel.loadDissertationsFromJsonData(rawData.dissertationData);
    const projectDataSaved = await databaseController.saveData(cohortType + PROJECT_ALLOCATION_DOCUMENT_SUFFIX, projectData);
    const supervisorDataSaved = await databaseController.saveData(cohortType + SUPERVISORS_DOCUMENT_SUFFIX, superData);
    const moduleOptionsSaved = await databaseController.saveData(cohortType + MODULE_OPTIONS_DOCUMENT_SUFFIX, moduleData);
    const dissertationOptionsSaved = await databaseController.saveData(cohortType + DISSERTATION_OPTIONS_DOCUMENT_SUFFIX, dissertationData);
    return projectDataSaved && supervisorDataSaved && moduleOptionsSaved && dissertationOptionsSaved;
};


/**
 * Function to export the csv for groups to client.
 * Creates the individual csv and compresses them.
 * @param cohortType The cohort of students requested (i.e. Masters)
 * @param filename The cohort of students requested (i.e. Masters)
 * @return Promise<Any> The promise that will result in the zipped folder creation.
 * */
const mmsGroupsCsvExport = async function (cohortType, filename) {
    /*Iterate through module list*/
    let fileCount = 0;
    const headers = ["# username", "group name", "left the module"];
    /*GET data from database.*/
    const listOfProjects = await getProjectAllocations(cohortType);
    const listOfDissertations = await getDissertationOptions(cohortType);
    for (const dissertation of listOfDissertations) {
        /* Create list of csv format lines. */
        let csvLineArray = [];
        /*Find all projects with the same dissertation option.*/
        listOfProjects.forEach(project => {
            if (project.dissCode === dissertation.code) {
                /*Create csv line and add it to array*/
                const groupName = project.firstName + " " + project.lastName;
                /*Add coursework group*/
                csvLineArray.push([project.username, groupName + " (Coursework)", false]);
                /*Add ethics group*/
                csvLineArray.push([project.username, groupName + " (Ethics)", false]);
            }
        });

        /*Create csv file if that is present. */
        if (csvLineArray.length > 0) {
            await fileManager.createCsvFile("dataStorage/tmp/files/", dissertation.code + "-exportGroupsForMMS", headers, csvLineArray)
                .then(() => {
                    fileCount++;
                });
        }
    }

    if (fileCount > 0) {
        /*Compress into zip folder.*/
        return fileManager.createZippedFolder("dataStorage/tmp/files/", "dataStorage/tmp/", filename);
    } else {
        return Promise.reject(new Error("Csv files not generated!"));
    }
};

/**
 * Function to create csv export.
 * @param cohortType The cohort of students requested (i.e. Masters)
 * @return Promise<Any> The promise that will result in the zipped folder creation.
 * */
const csvExport = function (cohortType) {
    const headers = ['Username', 'ID', 'First Name', 'Last Name', 'Degree Intention', 'Module Code', 'Project Title', 'Supervisor', ' Second Supervisor', ' Second Marker', 'Notes'];
    return getProjectAllocations(cohortType).then(listOfProjects => {
        /* Create list of csv format lines. */
        let csvLineArray = [];
        /*Find all projects with the same dissertation option.*/
        listOfProjects.forEach(project => {
            let projectCsvLine = [];
            for (let key of Object.keys(project)) {
                projectCsvLine.push(project[key]);
            }
            csvLineArray.push(projectCsvLine);
        });
        return fileManager.createCsvFile("dataStorage/tmp/", "ProjectAllocation", headers, csvLineArray);
    });
};


/**
 * Function to export the csv for supervisors to client.
 * Creates the individual csv and compresses them.
 * @param cohortType The cohort of students requested (i.e. Masters)
 * @param filename The filename of the output file.
 * @return Promise<Any> The promise that will return the output path.
 * */
const mmsSupervisorsExport = async function (cohortType, filename) {
    /*Iterate through module list*/
    let fileCount = 0;
    const headers = ["# supervisor username", ' group name', ' role'];
    /*Get data from database.*/
    const listOfProjects = await getProjectAllocations(cohortType);
    const listOfSupervisors = await getSupervisors(cohortType);
    const listOfDissertations = await getDissertationOptions(cohortType);
    for (const dissertation of listOfDissertations) {
        let listOfProjectsCsv = [];
        /*Find all projects with the same dissertation option.*/
        listOfProjects.forEach(project => {
            if (project.dissCode === dissertation.code) {
                /*Create group name.*/
                const groupName = project.firstName + " " + project.lastName + " (Coursework)";
                /*Create map with all 3 staff members*/
                let staffMap = new Map();
                staffMap.set("Supervisor", project.supervisor);
                staffMap.set("Second Supervisor", project.secondSupervisor);
                staffMap.set("Marker (Coursework)", project.secondMarker);
                /*Create line for each staff member*/
                for (const [role, staffName] of staffMap) {
                    if (staffName || staffName !== "") {
                        /*Search through supervisor list */
                        const staffMember = listOfSupervisors.find(element => {
                            return (element.givenNames + " " + element.familyName) === staffName
                        });
                        /*If staff member is found*/
                        if (staffMember) {
                            /*Push to array*/
                            listOfProjectsCsv.push([staffMember.username, groupName, role]);
                        }
                    }
                }
            }
        });

        /*Create files*/
        if (listOfProjectsCsv.length > 0) {
            await fileManager.createCsvFile("dataStorage/tmp/files/", dissertation.code + "-exportSupervisorsForMMS", headers, listOfProjectsCsv)
                .then(() => {
                    fileCount++;
                })
        }
    }
    if (fileCount > 0) {
        /*Compress into zip folder.*/
        return fileManager.createZippedFolder("dataStorage/tmp/files/", "dataStorage/tmp/", filename);
    } else {
        return Promise.reject(new Error("Csv files not generated!"));
    }
};


/**
 * Function to generate pdf file.
 * @param cohortType The cohort of students requested (i.e. Masters)
 * @return Promise<Any> The output filepath of the file generated.
 * */
const getPdfFile = async function (cohortType) {
    /*Get data from database.*/
    const listOfProjects = await getProjectAllocations(cohortType);
    const listOfSupervisors = await getSupervisors(cohortType);
    const listOfDissertations = await getDissertationOptions(cohortType);
    return pdfGen.generatePdf(path.join(__dirname, '../dataStorage/tmp/Allocation.pdf'), listOfProjects, listOfSupervisors, listOfDissertations);
};


/**
 * Function to get all the data for a particular student cohort, put it all into a json file and send to client.
 * @param cohortType The cohort of students requested (i.e. Masters)
 * @return String the path to the Json file.
 * */
const getSavedProgress = async function (cohortType) {
    const filepath = "dataStorage/tmp/ProgressSaved.json";
    let combinedData = {
        tableData: await getProjectAllocations(cohortType),
        staffData: await getSupervisors(cohortType),
        moduleData: await getModuleOptions(cohortType),
        dissertationData: await getDissertationOptions(cohortType)
    };
    /*Create json file */
    fs.writeFileSync(filepath, JSON.stringify(combinedData));
    return filepath;
};


/**
 * Function to handle POST to upload data. It reads the file uploaded via multer and it processes the data.
 * It also performs error checking before storing it on the database.
 * @param dataType The type of data being requested. (i.e. staff)
 * @param cohortType The cohort of students requested (i.e. Masters)
 * @param filepath The filepath of where the uploaded data is temporarily stored.
 * @return Promise<Boolean> a promise for the operation which will return a result.
 * @throws Error if file deletion after usage fails.
 * */
exports.dataUpload = function (dataType, cohortType, filepath) {
    let dataUploaded;
    switch (dataType) {
        case 'student':
            dataUploaded = createNewProjectAllocation(cohortType, filepath);
            break;
        case 'supervisor':
            dataUploaded = loadCSVStaffData(cohortType, filepath);
            break;
        case 'savedProgress':
            dataUploaded = loadSavedProgress(cohortType, filepath);
            break;
        case 'dissertationUpload':
            dataUploaded = loadJsonDissertationOptions(cohortType, filepath);
            break;
        case 'moduleUpload':
            dataUploaded = loadJsonModuleOptions(cohortType, filepath);
            break;
        default:
            dataUploaded = false;
            break;
    }
    if ((process.env.NODE_ENV !== 'test') && (fs.existsSync(filepath))) {
        /*Delete temporary file*/
        fs.unlink(filepath, (error => {
            if (error) {
                console.error(error.message);
            }
        }));
    }
    return dataUploaded;
};


/**
 * Function to handle POST save data requests from client.
 * It processes the data and performs error checking before storing it on the database.
 * @param dataType The type of data being requested. (i.e. staff)
 * @param cohortType The cohort of students requested (i.e. Masters)
 * @param dataToBeStored The data array that will be stored
 * @return Promise<Any> array of data requested.
 * @throws Error when request is not valid or data was not loaded.
 * */
exports.dataSave = function (dataType, cohortType, dataToBeStored) {
    if (dataType === 'supervisor') {
        return databaseController.saveData(cohortType + SUPERVISORS_DOCUMENT_SUFFIX, supervisorModel.loadFromJsonData(JSON.parse(dataToBeStored)));
    } else if (dataType === 'projectAllocation') {
        return databaseController.saveData(cohortType + PROJECT_ALLOCATION_DOCUMENT_SUFFIX, allocationModel.loadFromJsonData(JSON.parse(dataToBeStored)));
    } else {
        return Promise.reject(new Error(dataType + " is not valid."))
    }
};


/**
 * Function to handle data reupload via POST requests.
 * There are 3 supported behaviours:
 *  1 - Data gets added without affecting the rest.
 *  2 - Data is removed without affecting the rest.
 *  3 - The same data is uploaded and no changes occur.
 *  The comparison is based on the username which should be unique for each university member type(student and staff).
 * @param dataType The type of data being requested. (i.e. staff)
 * @param cohortType The cohort of students requested (i.e. Masters)
 * @param filepath The filepath where the data is stored.
 * @return Promise<Any> The promise for saving data.
 * */
exports.dataReupload = function (dataType, cohortType, filepath) {
    let outputPromise;
    switch (dataType) {
        case 'staff':
            /*Process incoming data*/
            outputPromise = supervisorModel.loadFromCsvData(filepath).then((dataProcessed) => {
                /*GET data from database. */
                return getSupervisors(cohortType).then((oldData) => {
                    let newDataList = [];
                    /*Compare and change*/
                    for (const supervisor of dataProcessed) {
                        let object = oldData.find(element => {
                            return element.username === supervisor.username;
                        });
                        if (object) {
                            /*To keep*/
                            newDataList.push(object);
                        } else {
                            /*Add new*/
                            newDataList.push(supervisor);
                        }
                    }
                    return databaseController.saveData(cohortType + SUPERVISORS_DOCUMENT_SUFFIX, newDataList);
                });
            });
            break;
        case 'student':
            /*Process incoming data*/
            outputPromise = studentData.loadFromCsvData(filepath).then((dataProcessed) => {
                const newData = allocationModel.createNewList(dataProcessed);
                /*GET data from database. */
                return getProjectAllocations(cohortType).then((oldData) => {
                    let newDataList = [];
                    /*Compare and change*/
                    for (const allocation of newData) {
                        let object = oldData.find(element => {
                            return element.username === allocation.username;
                        });
                        if (object) {
                            /*To keep*/
                            newDataList.push(object);
                        } else {
                            /*Add new*/
                            newDataList.push(allocation);
                        }
                    }
                    return databaseController.saveData(cohortType + PROJECT_ALLOCATION_DOCUMENT_SUFFIX, newDataList);
                });
            });
            break;
        default:
            outputPromise = Promise.reject(new Error(dataType + " is not valid."));
            break;
    }
    return outputPromise;
};


/**
 * Function to handle requests for getting raw data.
 * This method will send a query request to the database driver and fetch the requested data.
 * @param dataType The type of data being requested. (i.e. staff)
 * @param cohortType The cohort of students requested (i.e. Masters)
 * @return Promise<Array> array of data requested.
 * */
exports.dataFetch = function (dataType, cohortType) {
    let dataOutput;
    switch (dataType) {
        case 'projectAllocation':
            dataOutput = getProjectAllocations(cohortType);
            break;
        case 'staff':
            dataOutput = getSupervisors(cohortType);
            break;
        case 'modules':
            dataOutput = getModuleOptions(cohortType);
            break;
        case 'dissertation':
            dataOutput = getDissertationOptions(cohortType);
            break;
        default:
            dataOutput = Promise.reject(new Error(dataType + " is not a valid request"));
            break;
    }
    return dataOutput;
};


/**
 * Function to handle requests for exporting data.
 * There are different types of requests supported and they will generate csv, pdf or tar files.
 * @param dataType The type of request needed.
 * @param cohortType The type of student cohort.
 * @return Promise<String> a promise that will return the filepath to the generated files.
 * **/
exports.dataExport = function (dataType, cohortType) {
    let outputPromise;
    switch (dataType) {
        case "tableData":
            outputPromise = csvExport(cohortType);
            break;
        case "mmsGroupCsv":
            outputPromise = mmsGroupsCsvExport(cohortType, "mmsGroups");
            break;
        case "mmsSupervisorCsv":
            outputPromise = mmsSupervisorsExport(cohortType, "mmsSupervisor");
            break;
        case "pdfData":
            outputPromise = getPdfFile(cohortType);
            break;
        case 'savedProgress':
            /*Create json*/
            outputPromise = getSavedProgress(cohortType);
            break;
        default:
            outputPromise = Promise.reject(new Error(dataType + " is not a supported download type."));
            break;
    }
    return outputPromise;
};

/**
 * Function to get the available cohorts from the database.
 * @return Promise a promise containing the outcome of operation.
 * */
exports.getAvailableCohorts = function () {
    return databaseController.getData(AVAILABLE_COHORTS_DOCUMENT);
};

/**
 * Function to save a new student cohort.
 * @param data The new student cohort list.
 * @return Promise a promise containing the outcome of operation.
 * */
exports.saveNewStudentCohorts = function (data) {
    return databaseController.saveData(AVAILABLE_COHORTS_DOCUMENT, data);
};

exports.getProjectAllocations = getProjectAllocations;
exports.getSupervisors = getSupervisors;