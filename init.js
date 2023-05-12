const { spawn, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

/**
 * Initializes the project.
 * @param {Boolean} useYarn - If the user wants to use yarn as the package manager.
 */
function initProject(useYarn) {
    const packageManager = useYarn ? "yarn" : "npm";    
    console.log(`Initializing project with ${packageManager}.`);
    runPackageManagerInit(packageManager);

    installTypescript(useYarn);
    installLint(useYarn);

    createSrcFolder();

    console.log("Project created.");
}

function runPackageManagerInit(packageManager) {
    spawnSync(packageManager, ["init", "-y"], { stdio: "inherit" });
}
function installTypescript(useYarn) {
    installDevDependency(useYarn, "typescript");
    installDevDependency(useYarn, "@types/node");
    installDevDependency(useYarn, "ts-node");
    installDevDependency(useYarn, "nodemon");

    createTypescriptFile(useYarn);

    updatePackageFileScripts({
        start: "node dist/index.js",
        build: "tsc",
        dev: "nodemon --watch 'src/**' --ext 'ts,json' --ignore 'src/**/*.spec.ts' --ignore 'src/**/*.test.ts' --exec 'ts-node src/index.ts'"
    });
}

function installLint(useYarn) {
    installDevDependency(useYarn, "eslint");
    installDevDependency(useYarn, "@typescript-eslint/eslint-plugin");
    installDevDependency(useYarn, "@typescript-eslint/parser");

    console.log("Creating eslint configurations.");
    fs.copyFileSync(path.resolve(__dirname, ".eslintrc.json"), ".eslintrc.json");
    console.log("Eslint configurations created.");

    updatePackageFileScripts({
        lint: "eslint . --ext .ts",
        "lint:fix": "eslint . --ext .ts --fix",
    });

    console.log("ESLint installed.");
}

function updatePackageFileScripts(scripts) {
    console.log("Updating scripts to the package.json file.");

    const packageFile = JSON.parse(fs.readFileSync("package.json"));

    packageFile.scripts = {...packageFile.scripts, ...scripts};

    fs.writeFileSync("package.json", JSON.stringify(packageFile, null, 2));

    console.log("package.json file updated.")
}

function createTypescriptFile(useYarn) {
    console.log("Setting up typescript.");

    spawnSync(
        useYarn ? "yarn" : "npx",
        [
            "tsc",
            "--init",
            "--rootDir", "src",
            "--outDir", "dist", 
            "--moduleResolution", "node16",
            "--baseUrl", "./",
            "--resolveJsonModule", "true",
            "--sourceMap", "true",
            "--esModuleInterop", "true",
            "--forceConsistentCasingInFileNames", "true",
            "--noImplicitAny", "true",
            "--noImplicitReturns", "true",
            "--noUncheckedIndexedAccess", "true"
        ],
        { stdio: "inherit" });
}

function installDevDependency(useYarn, dependency) {
    console.log(`Installing ${dependency}`);

    const command = useYarn ? ["add", dependency, "--dev"] : ["install", "-D", dependency];
    spawnSync(useYarn ? "yarn" : "npm", command, { stdio: "inherit" });
    console.log(`${dependency} installed.`);
}

function createSrcFolder() {
    fs.mkdirSync("src");
    const file = "console.log(\"hello world\");";
    fs.writeFileSync("src/index.ts", file);
}

module.exports = {
    initProject
};