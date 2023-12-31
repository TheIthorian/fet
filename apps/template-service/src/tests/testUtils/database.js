const fs = require('fs');
const path = require('path');

function dropTestDatabase() {
    const directory = '../../prisma';
    const filename = process.env.TEMPLATE_SERVICE_DATABASE_URL?.split(':./').pop();

    if (!filename) {
        throw new Error('TEMPLATE_SERVICE_DATABASE_URL is not defined');
    }

    // Get the absolute path of the code file
    const codeFilePath = module.filename;

    // Get the directory path of the code file
    const codeFileDirectory = `${path.dirname(codeFilePath)}../../`;

    // Construct the absolute path of the directory
    const absoluteDirectory = path.resolve(codeFileDirectory, directory);

    // Get the absolute path of the file
    const filePath = path.resolve(absoluteDirectory, filename);

    process.stdout.write(`Dropping test database: ${filePath}\n`);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        process.stdout.write(`${filename} has been removed from ${directory}\n`);
    } else {
        process.stdout.write(`${filename} does not exist in ${directory}\n`);
    }
}

module.exports = { dropTestDatabase };
