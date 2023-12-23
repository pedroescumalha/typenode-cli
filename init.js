const { spawn, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

/**
 * Initializes the project.
 * @param {boolean} useYarn - If the user wants to use yarn as the package manager.
 * @param {boolean} setupCI - If the CI files should be included.
 */
function initProject(useYarn, setupCI) {
    const packageManager = useYarn ? "yarn" : "npm";    
    console.log(`Initializing project with ${packageManager}.`);
    runPackageManagerInit(packageManager);

    installTypescript(useYarn);
    installLint(useYarn);
    installTests(useYarn);

    createSrcFolder();

    if (setupCI) {
        copyCIFiles();
    }

    console.log("Project created.");
}

/**
 *
 * @param packageManager
 */
function runPackageManagerInit(packageManager) {
    spawnSync(packageManager, ["init", "-y"], { stdio: "inherit" });
}

/**
 *
 * @param useYarn
 */
function installTypescript(useYarn) {
    installDevDependency(useYarn, "typescript");
    installDevDependency(useYarn, "@types/node");
    installDevDependency(useYarn, "ts-node");
    installDevDependency(useYarn, "nodemon");

    createTypescriptFile(useYarn);

    updatePackageFileScripts({
        start: "node dist/index.js",
        build: "tsc",
        dev: "nodemon --watch 'src/**' --ext 'ts,json' --ignore 'src/**/*.spec.ts' --ignore 'src/**/*.test.ts' --exec 'ts-node src/index.ts'",
    });
}

/**
 *
 * @param useYarn
 */
function installLint(useYarn) {
    installDevDependency(useYarn, "eslint");
    installDevDependency(useYarn, "@typescript-eslint/eslint-plugin");
    installDevDependency(useYarn, "@typescript-eslint/parser");
    installDevDependency(useYarn, "@typescript-eslint/parser");
    installDevDependency(useYarn, "eslint-plugin-jsdoc");


    console.log("Creating eslint configurations.");
    fs.copyFileSync(path.resolve(__dirname, ".eslintrc.json"), ".eslintrc.json");
    console.log("Eslint configurations created.");

    updatePackageFileScripts({
        lint: "eslint ./src",
        "lint:fix": "eslint ./src --fix",    
    });

    console.log("ESLint installed.");
}

/**
 *
 * @param useYarn
 */
function installTests(useYarn) {
    installDevDependency(useYarn, "globstar");

    console.log("Configuring tests.");

    updatePackageFileScripts({
        test: "globstar -- node --test --require ts-node/register ./src/**/*.test.ts",
    });

    console.log("Tests configured.");
}

/**
 *
 * @param scripts
 */
function updatePackageFileScripts(scripts) {
    console.log("Updating scripts to the package.json file.");

    const packageFile = JSON.parse(fs.readFileSync("package.json"));

    packageFile.scripts = {...packageFile.scripts, ...scripts};

    fs.writeFileSync("package.json", JSON.stringify(packageFile, null, 2));

    console.log("package.json file updated.");
}

/**
 *
 * @param useYarn
 */
function createTypescriptFile(useYarn) {
    console.log("Setting up typescript.");

    spawnSync(
        useYarn ? "yarn" : "npx",
        [
            "tsc",
            "--init",
            "--rootDir", "src",
            "--outDir", "dist", 
            "--target", "es2022", 
            "--module", "nodenext", 
            "--moduleResolution", "node16",
            "--baseUrl", "./",
            "--resolveJsonModule", "true",
            "--sourceMap", "true",
            "--esModuleInterop", "true",
            "--forceConsistentCasingInFileNames", "true",
            "--noImplicitAny", "true",
            "--noImplicitReturns", "true",
            "--noUncheckedIndexedAccess", "true",
        ],
        { stdio: "inherit" }
    );
}

/**
 *
 * @param useYarn
 * @param dependency
 */
function installDevDependency(useYarn, dependency) {
    console.log(`Installing ${dependency}`);

    const command = useYarn ? ["add", dependency, "--dev"] : ["install", "-D", dependency];
    spawnSync(useYarn ? "yarn" : "npm", command, { stdio: "inherit" });
    console.log(`${dependency} installed.`);
}

/**
 *
 */
function createSrcFolder() {
    fs.mkdirSync("src");
    const file = "console.log(\"hello world\");";
    fs.writeFileSync("src/index.ts", file);
}

/**
 *
 */
function copyCIFiles() {
    console.log("Setting up the CI files");
    fs.cpSync(path.resolve(__dirname, ".github"), ".github", { recursive: true });
    console.log("CI setup completed");
}

module.exports = {
    initProject,
};
