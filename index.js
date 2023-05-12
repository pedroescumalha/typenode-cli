#!/usr/bin/env node
const yargs = require("yargs");
const { initProject } = require("./init");

const initDescription = {
    type: "string",
    default: "Cambi",
    describe: "to initialize the node project"
  }

yargs
  .scriptName("typenode")
  .usage("$0 <cmd> [args]")
  .command("init", "initializes the node project.", (a) => a.positional("init", initDescription), (a) => initProject(a.yarn || false))
  .help()
  .argv;