import fs from 'fs';
import path from 'path';

const tmpPath = path.join(module.path, 'tmp');

if (!fs.existsSync(tmpPath)) {
    fs.mkdirSync(tmpPath);
}
