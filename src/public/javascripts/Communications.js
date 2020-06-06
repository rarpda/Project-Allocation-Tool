/**
 * This file provides a template for the Jquery Ajax requests required to communicate with the server.
 * @module Communications
 * */
/* eslint-env browser, es6 */

/**
 * Method used for issuing POST request to upload/reupload data.
 * @param dataType The type of data to upload. i.e. studentData
 * @param file The file to upload.
 * @param id The id of the form pressed to display alerts.
 * @param reUpload Flag to check if uploading or reuploading.
 * @return Promise JQuery Promise for POST request.
 * */
const uploadData = function (dataType, file, id, reUpload) {
    /*Create new FormData to send file and the type.*/
    let data = new FormData();
    data.append("dataType", dataType);
    data.append("fileToUpload", file);
    let url;
    if (reUpload) {
        url = "dataReupload";
    } else {
        url = "dataUpload";
    }
    return $.ajax({
        url: url,
        method: "POST",
        data: data,
        processData: false,
        contentType: false
    }).done(() => {
        /* Show success message.*/
        $('#progressMessageInput-' + id).attr("hidden", false);
        $('#progressMessageInput-' + id + '-failure').attr("hidden", true);

    }).fail(() => {
        /* Show failure message.*/
        $('#progressMessageInput-' + id).attr("hidden", true);
        $('#progressMessageInput-' + id + '-failure').attr("hidden", false);
    });
};


/**
 * Method for issuing PUT requests to store data in the server.
 * @param data The name of the file in the form of a url.
 * @param dataType The data to be sent to the server.
 * @return Promise JQuery promise with POST request.
 * */
const saveData = function (data, dataType) {
    let outboundData = JSON.stringify(data);
    let formData = new FormData();
    formData.append("savedData", outboundData);
    formData.append("dataType", dataType);
    return $.ajax({
        url: "dataSave",
        method: "POST",
        data: formData,
        processData: false,
        contentType: false
    });
};


/**
 * Method used to issue GET requests to fetch data from server.
 * @param queryParams The query parameters of the data needed.
 * @return Promise<Any> A promise from the JQuery's AJAX method.
 * */
const getData = function (queryParams) {
    return $.ajax({
        url: "dataDownload",
        method: "GET",
        data: queryParams,
    });
};

export {uploadData, saveData, getData};