module.exports = function (grunt) {

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-jsdoc');

    grunt.loadNpmTasks('grunt-mocha-test');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jsdoc: {
            src: ['src/**/**/**.js', 'README.md'],
            options: {
                destination: 'Reports/jsdoc',
                template: "node_modules/ink-docstrap/template",
                configure: "node_modules/ink-docstrap/template/jsdoc.conf.json"
            }
        },
        mochaTest: {
            unitTest: {
                options: {
                    clearRequireCache: false, // Optionally clear the require cache before running tests (defaults to false)
                    noFail: false // Optionally set to not fail on failed tests (will still fail on other errors)
                },
                src: ['test/**.js']
            },
            firefox: {
                options: {
                    clearRequireCache: false, // Optionally clear the require cache before running tests (defaults to false)
                    noFail: false // Optionally set to not fail on failed tests (will still fail on other errors)
                },
                src: ['test/End-to-End/**.js']
            },
            databaseTest: {
                options: {
                    clearRequireCache: false, // Optionally clear the require cache before running tests (defaults to false)
                    noFail: false // Optionally set to not fail on failed tests (will still fail on other errors)
                },
                src: ['test/DatabaseTests.js']
            },
            chrome: {
                options: {
                    clearRequireCache: false, // Optionally clear the require cache before running tests (defaults to false)
                    noFail: false // Optionally set to not fail on failed tests (will still fail on other errors)
                },
                src: ['test/End-to-End/**.js']
            }
        }
    });


    grunt.registerTask('e2eFirefox', () => {
        process.env.NODE_ENV = 'test';
        process.env.BROWSER = "firefox";
        grunt.task.run("mochaTest:firefox");
    });


    grunt.registerTask('e2eChrome', () => {
        process.env.NODE_ENV = 'test';
        process.env.BROWSER = "chrome";
        grunt.task.run("mochaTest:chrome");
    });


    grunt.registerTask('unitTest', () => {
        process.env.NODE_ENV = 'test';
        grunt.task.run("mochaTest:unitTest");
    });

    grunt.registerTask('databaseTest', () => {
        process.env.NODE_ENV = 'test';
        grunt.task.run("mochaTest:databaseTest");
    });

    // // Default task(s).

    grunt.registerTask('default', ['jsdoc', 'e2eFirefox', 'databaseTest', 'unitTest', 'e2eChrome']);

};