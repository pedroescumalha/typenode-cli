const { writeFileSync, existsSync } = require("fs");

const changelogTypes = [
    "added",
    "fixed",
    "improved",
    "deprecated",
    "removed",
];

if (!process.env.CHANGELOG_TITLE || !process.env.CHANGELOG_DESCRIPTION || !process.env.CHANGELOG_ID) {
    console.error('Changelog title, description or id not set');
    process.exit(1);
}

const hasValidPrefix = changelogTypes.some((type) => process.env.CHANGELOG_TITLE.startsWith(`${type}: `));

if (!hasValidPrefix) {
    console.log('Changelog title doesnt start with a valid changelog type. Exiting.');
    process.exit(0);
}

const type = process.env.CHANGELOG_TITLE.split(': ')[0];
const title = process.env.CHANGELOG_TITLE.split(`${type}: `)[1];

const file = `---
title: ${title}
hidden: false
type: ${type}
---
${process.env.CHANGELOG_DESCRIPTION}
`;

const filePath = `changelogs/${process.env.CHANGELOG_ID}.md`;

if (existsSync(filePath)) {
    console.log('Changelog for this PR already exists. Exiting.');
    process.exit(0);
}
 
writeFileSync(filePath, file, 'utf-8');
