console.log('Start pipeline execution');

const AWS = require('aws-sdk');

async function run() {

    // Init the SDK
    AWS.config.loadFromPath('./config.json');
    const codebuild = new AWS.CodeBuild();
    let buildData = null;

    codebuild.startBuild(
        params = {
            projectName: 'dqlick_ltm_backend'
        }, (err, data) => {
            if (err) {
                console.log(err, err.stack);
                buildData = "ERROR";
            } // an error occurred
            else {
                console.log(data);
                buildData = data.build;
            }
        });
    while (buildData === null) {
        await new Promise(r => setTimeout(r, 2000));
        console.log("waiting for the pipeline to start..")
        console.log(buildData)
    }
    while (buildData && buildData.currentPhase !== 'COMPLETED') {
        codebuild.batchGetBuilds(params = {
                ids: [buildData.id]
            },
            (err, data) => {
                console.log("\n \n Getting Build Status...")
                if (err) console.log(err, err.stack); // an error occurred
                else {
                    buildData = data.builds[0];
                    console.log("Current Phase:", buildData.currentPhase);
                    console.log("Build Status", buildData.buildStatus);
                    console.log("Build Status", buildData.sourceVersion);
                    console.log("Project Name", buildData.projectName);
                }
            });
        await new Promise(r => setTimeout(r, 10000));
    }

    console.log('End pipeline execution');
    if (buildData.buildStatus === "SUCCEEDED") process.exit(0)
    process.exit(1)
}

run();
