/**
 * This file is responsible for handling the creation of the project allocation and staff tables.
 * @module TableCreator
 * */
/* eslint-env browser, es6 */

/**
 *
 * This functions is responsible for sorting the table elements on header click.
 * Adapted from:https://www.w3schools.com/howto/howto_js_sort_table.asp
 * @param tableId The id of the table to sort
 * @param columnIndex The index of the column who's header was clicker.
 * @param ascendingOrder Boolean flag to control if the sorting should be ascending/descending.
 *
 * */
function sortTable(tableId, columnIndex, ascendingOrder) {
    let table, rows, switching, i, x, y, shouldSwitch;
    table = document.getElementById(tableId);
    switching = true;
    /* Make a loop that will continue until
    no switching has been done: */
    while (switching) {
        // Start by saying: no switching is done:
        switching = false;
        rows = table.children[1].rows;
        /* Loop through all table rows (except the
        first, which contains table headers): */
        for (i = 0; i < (rows.length - 1); i++) {
            // Start by saying there should be no switching:
            shouldSwitch = false;
            /* Get the two elements you want to compare,
            one from current row and one from the next: */
            x = rows[i].getElementsByTagName("TD")[columnIndex];
            y = rows[i + 1].getElementsByTagName("TD")[columnIndex];
            /*Elements must be of the same class type to compare.*/
            if (x.parentElement.className === y.parentElement.className) {
                // Check if the two rows should switch place:
                if (ascendingOrder) {
                    if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                        // If so, mark as a switch and break the loop:
                        shouldSwitch = true;
                        break;
                    }
                } else {
                    if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                        // If so, mark as a switch and break the loop:
                        shouldSwitch = true;
                        break;
                    }
                }
            }
        }
        if (shouldSwitch) {
            /* If a switch has been marked, make the switch
            and mark that a switch has been done: */
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }
}

/**
 * Function used to create the headers for a table.
 * @param  headers Array of headers to be inserted.
 * @param  tableID The id of the table to associate it with.
 * @return HTMLTableRowElement Returns the newly created row element.
 */
const createHeaders = function (headers, tableID) {
    let tr = document.createElement("tr");
    /* Iterate through headers and set them.*/
    for (let index = 0; index < headers.length; index++) {
        let th = document.createElement("th");
        $(th).addClass("secondaryHeaders-" + headers[index]);
        let txt = document.createTextNode(headers[index]);
        th.appendChild(txt);
        let ascendingOrder = true;
        th.addEventListener('click', () => {
            sortTable(tableID, index, ascendingOrder);
            ascendingOrder = !ascendingOrder;
        });
        tr.appendChild(th);

    }
    return tr;
};

/**
 * Function to create generic, basic cell with text.
 * @param text The text to insert in the cell
 * @param attributeType The attribute type of the cell to insert.
 * @return HTMLTableCellElement Returns the newly created cell.
 * */
const createCell = function (text, attributeType) {
    let td = document.createElement("td");
    $(td).attr("id", attributeType);
    td.appendChild(document.createTextNode(text));
    return td;
};

/**
 * Function to add and create a basic cell to a provided row element.
 * @param row The row to add the cell to.
 * @param attributeType The attribute type of the cell to insert.
 * @param text The text to insert in the cell
 * @return HTMLTableCellElement Returns the newly created cell.
 * */
const addCell = function (row, attributeType, text) {
    let td = createCell(text, attributeType);
    row.appendChild(td);
};

/**
 * Function to add and create an editable cell to a provided row element.
 * @param row The row to add the cell to.
 * @param attributeType The attribute type of the cell to insert.
 * @param text The text to insert in the cell
 * @return HTMLTableCellElement Returns the newly created cell.
 * */
const addEditableCell = function (row, attributeType, text) {
    let td = createCell(text, attributeType);
    $(td).addClass("editable");
    $(td).prop('contenteditable', true);
    row.appendChild(td);
};


/**
 * Function to add and create an editable and autocomplete cell to a provided row element.
 * @param row The row to add the cell to.
 * @param attributeType The attribute type of the cell to insert.
 * @param text The text to insert in the cell
 * @param autocompleteSource The source list used by the autocomplete feature.
 * @return HTMLTableCellElement Returns the newly created cell.
 * */
const addAutoCompleteCell = function (row, attributeType, text, autocompleteSource) {
    let td = createCell(text, attributeType);
    $(td).addClass("editable");
    $(td).addClass("autocomplete");
    $(td).prop('contenteditable', true);
    $(td).autocomplete({source: autocompleteSource});
    row.appendChild(td);
};

/**
 * Function to create the totals row for tables.
 * @param tableID The ID of the table where it will be added.
 * @param headers The array of headers for the table.
 * @param startupCount The initial count of the table(takes length of table body).
 * @return HTMLTableRowElement the created row element.
 * */
const createTotalsRow = function (tableID, headers, startupCount) {
    let tableRow = document.createElement("tr");
    $(tableRow).attr('id', "Totals");
    $(tableRow).attr('class', "totals-row");
    addCell(tableRow, "Total text", "Total");
    addCell(tableRow, "dynamicTotal", startupCount);
    for (let index = 0; index < headers.length - 2; index++) {
        addCell(tableRow, "", "");
    }
    return tableRow;
};


/**
 * Function to create staff table from the data sent by the server.
 * @param tableID The HTML id of the table element to where the data will be added.
 * @param modules The array of modules available.
 * @param projectAllocationData The project allocation data received by the server.
 * @param data The staff data used to populate the table.
 * */
function createStaffTable(tableID, modules, projectAllocationData, data) {
    /*Create headers and body*/
    let header = document.createElement("thead");
    let body = document.createElement("tbody");
    let table = $('#' + tableID);
    table.append(header);
    table.append(body);
    let headers = ["Username", "First Name", "Last Name", "Other Load", "Total Supervisor", "Total Marker", "Notes"];
    /*Add modules available after last name. */
    for (let i = 0; i < modules.length; i++) {
        headers.splice(3 + i, 0, modules[i].code);
    }
    header.append(createHeaders(headers, tableID));

    /* Iterate through data array and add data to table*/
    for (let index = 0; index < data.length; index++) {
        const element = data[index];
        /*Create row and add cells*/
        let tableRow = document.createElement("tr");
        $(tableRow).attr('id', element.username);

        /*Prepare data*/
        let countDissertation = new Map();
        /*Get all modules available*/
        for (let i = 0; i < modules.length; i++) {
            countDissertation.set(modules[i].code, 0);
        }

        let totalMarkerCount = 0;
        let totalSupervisorCount = 0;
        const fullName = element.givenNames + " " + element.familyName;
        Object.entries(projectAllocationData).forEach(projectDataTest => {
            /*Check if first or second supervisor*/
            const projectData = projectDataTest[1];
            if (projectData.supervisor === fullName || projectData.secondSupervisor === fullName) {
                /*Check code is valid*/
                if (countDissertation.has(projectData.dissCode)) {
                    /*Increment total count and individual count*/
                    const value = countDissertation.get(projectData.dissCode);
                    countDissertation.set(projectData.dissCode, value + 1);
                }
            }

            /*Calculate supervisor counts and marker counts*/
            if (projectData.supervisor === fullName) {
                totalMarkerCount++;
                totalSupervisorCount++;
            } else if (projectData.secondSupervisor === fullName) {
                totalSupervisorCount++;
            } else if (projectData.secondMarker === fullName) {
                totalMarkerCount++;
            }
        });

        /*Add cells */
        addCell(tableRow, "username", element.username);
        addCell(tableRow, "givenNames", element.givenNames);
        addCell(tableRow, "familyName", element.familyName);
        for (let i = 0; i < modules.length; i++) {
            addCell(tableRow, modules[i], countDissertation.get(modules[i].code));
        }
        addEditableCell(tableRow, "sh_load", 0);
        addCell(tableRow, "Total supervisor", totalSupervisorCount);
        addCell(tableRow, "Total marker", totalMarkerCount);
        addEditableCell(tableRow, "notes", " ");

        /*Add event listeners.*/
        tableRow.addEventListener('focusout', () => {
            /*Get children and update editable data.*/
            const rowElement = $(tableRow).children();
            Object.entries(rowElement).forEach(cell => {
                if (cell[1].isContentEditable) {
                    /*Attribute name*/
                    const propName = cell[1].id;
                    /*Update table */
                    if (typeof element[propName] !== "undefined") {
                        console.log(propName + ": Updated");
                        element[propName] = cell[1].textContent;
                    }
                }
            });
        });
        body.append(tableRow);
    }
    body.append(createTotalsRow(tableID, headers, data.length));
}


/**
 * Function to create project allocation table from the data sent by the server.
 * @param tableID The HTML id of the table element to where the data will be added.
 * @param modules The array of modules available.
 * @param staffData The staff data.
 * @param data The
 * */
function createProjectAllocationTable(tableID, modules, staffData, data) {
    const headers = ['Username', 'ID', 'First Name', 'Last Name', 'Degree Intention', 'Module Code', 'Project Title', 'Supervisor', ' Second Supervisor', ' Second Marker', 'Notes'];
    /*Dynamically add header and body*/
    let header = document.createElement("thead");
    let body = document.createElement("tbody");
    let table = $('#' + tableID);
    table.append(header);
    table.append(body);
    header.append(createHeaders(headers, tableID));

    /*Create a list of staff's full names for autocomplete list.*/
    let staffNames = [];
    /*Create list of staff by full name*/
    for (let index = 0; index < staffData.length; index++) {
        const staff = staffData[index];
        staffNames.push(staff.givenNames + " " + staff.familyName);
    }

    /**
     * @function addTotalRows -add Total row at bottom of the respective table
     * @param {number} tableID - which table is it
     */

    /* Iterate through data array and load data*/
    for (let index = 0; index < data.length; index++) {
        const element = data[index];
        let tableRow = document.createElement("tr");
        $(tableRow).attr('id', element.username);
        $(tableRow).attr('class', tableID + "-row");

        addCell(tableRow, "username", element.username);
        addCell(tableRow, "id", element.id);
        addCell(tableRow, "firstName", element.firstName);
        addCell(tableRow, "lastName", element.lastName);

        /*Get options based on degree intention*/
        let options = modules.find((option) => {
            return option.title === element.degreeIntention;
        });
        // If only one option they can not change the dissertation code
        if (options) {
            addCell(tableRow, "degreeIntention", options.abbreviation);
            if (options.length === 1) {
                addCell(tableRow, "dissCode", element.dissCode);
            } else {
                addAutoCompleteCell(tableRow, "dissCode", element.dissCode, options.dissertationOptions);
            }
        } else {
            throw new Error(element.degreeIntention + " is not a valid module option! Update or check your modules json file!");
        }
        addEditableCell(tableRow, "projectTitle", element.projectTitle);
        addAutoCompleteCell(tableRow, "supervisor", element.supervisor, staffNames);
        addAutoCompleteCell(tableRow, "secondSupervisor", element.secondSupervisor, staffNames);
        addAutoCompleteCell(tableRow, "secondMarker", element.secondMarker, staffNames);
        addEditableCell(tableRow, "notes", element.notes);
        /*Add event listeners.*/
        tableRow.addEventListener('focusout', () => {
            /*Get children and update editable data.*/
            const rowElement = $(tableRow).children();
            Object.entries(rowElement).forEach(cell => {
                if (cell[1].isContentEditable) {
                    /*Attribute name*/
                    const propName = cell[1].id;
                    /*Update table */
                    if (typeof element[propName] !== "undefined") {
                        console.log(propName + ": Updated");
                        element[propName] = cell[1].textContent;
                    }
                }
            });
        });
        body.append(tableRow);
    }
    body.append(createTotalsRow(tableID, headers, data.length));
}


/**
 * Function to remove table data based on id provided.
 * @param tableID The table to clear.
 * */
function removeTableData(tableID) {
    $('#' + tableID).children().remove();
}


/**
 * Function to search tables and filter them.
 * Assigns keyup listener to input form and filters table.
 * Removed from: https://www.w3schools.com/jquery/tryit.asp?filename=tryjquery_filters_table
 * @param searchHtmlElement The HTML element that is responsible for user input
 * @param tableID The HTML id of the table to apply the filter to.
 * */
function enableTableSearch(searchHtmlElement, tableID) {
    searchHtmlElement.val("");
    searchHtmlElement.attr("disabled", false);
    searchHtmlElement.on("keyup", function () {
        let totalCount = 0;
        const value = $(this).val().toLowerCase();
        $("#" + tableID).find("tbody tr").filter(function () {
            /*Lowercase and compare*/
            $(this).toggle(($(this).text().toLowerCase().indexOf(value) > -1) || ($(this).attr("id") === "Totals"));
            if ($(this).is(":visible")) {
                totalCount++;
            }
        });

        /*Update total count*/
        $("#dynamicTotal").text(totalCount - 1);
    });
    /*Show element.*/
    searchHtmlElement.show();
}


/*Exports*/
export {createStaffTable, createProjectAllocationTable, removeTableData, enableTableSearch};