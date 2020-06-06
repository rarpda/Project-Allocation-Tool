/**
 * File that implements the logic for generating CSV files.
 * It also contains methods for emptying directory without deleting the folder and the methods for zipping files.
 * @module CsvGenerator
 * */

const csv = require('fast-csv');
const fs = require('fs');
const path = require("path");
let archiver = require('archiver');


/**
 * Function to create a generate a csv file from the data provided.
 * @param filepath The path to output the file.
 * @param fileName The filename of resulting file.
 * @param headers The headers of the csv.
 * @param data The data in an Array of objects format to save.
 * @return Promise<Any> a promise which will return the error or the output filepath.
 * */
exports.createCsvFile = function (filepath, fileName, headers, data) {
    // console.log("creating file: " + fileName);
    return new Promise((resolve, reject) => {
            let mergedDataHeaders = data.slice();
            mergedDataHeaders.unshift(headers);
            const outputFilepath = path.join(filepath, fileName + ".csv");
            csv.writeToPath(outputFilepath, mergedDataHeaders, {headers: true})
                .on('error', error => {
                    reject(error);
                }).on('finish', () => {
                    resolve(outputFilepath);
                }
            )
        }
    )
};


/**
 * Function to asynchronously remove all files from the directory.
 * Removed from: https://stackoverflow.com/questions/27072866/how-to-remove-all-files-from-directory-without-removing-directory-in-node-js/42182416
 * @param directory The path to the directory to empty.
 * @throws Error when directory does not exists.
 * */
exports.emptyFolder = function (directory) {
    if (!fs.existsSync(directory)) {
        return;
    }
    /*Read files in directory and unlink asynchronously them*/
    fs.readdir(directory, (err, files) => {
        if (err) throw err; /*Throw error ir required.*/
        for (const file of files) {
            fs.unlink(path.join(directory, file), err => {
                if (err) throw err;
            });
        }
    });
};


/**
 * This function is responsible for zipping a directory provided.
 * This code was based on the example provided by: https://www.npmjs.com/package/archiver
 *
 * @param sourceDirectory The path to the source directory.
 * @param outputDirectory The path to the source directory.
 * @param filename The path to the source directory.
 * @return Promise<Any> a promise which outputs the output filepath or the error.

 * */
exports.createZippedFolder = function (sourceDirectory, outputDirectory, filename) {
    return new Promise((resolve, reject) => {
        // create a file to stream archive data to.
        const outputFilepath = path.join(outputDirectory, filename + ".zip");
        const output = fs.createWriteStream(outputFilepath);
        const archive = archiver('zip', {
            zlib: {level: 9} // Sets the compression level.
        });

        output.on('close', function () {
            // console.log(archive.pointer() + ' total bytes zipped.');
            resolve(outputFilepath);
        });

        archive.on('warning', function (error) {
            console.log("Warning found zipping files:" + error.code);
            reject(error);
        });

        archive.on('error', function (error) {
            console.log("Warning found zipping files:" + error.code);
            reject(error);
        });

        /*Direct output of filestream.*/
        archive.pipe(output);
        archive.directory(sourceDirectory, "");
        archive.finalize();
    });
};



