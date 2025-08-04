// server.js
import cors from 'cors'; // Import the cors middleware
import express from 'express';
import { spawn } from 'child_process'; // Node.js module for spawning processes
import path from 'path';
import { fileURLToPath } from 'url';

// --- Setup ---
const app = express();
const port = process.env.PORT || 3000;

// Get current directory for resolving Python script path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pythonScriptPath = path.resolve(__dirname, 'scrambler.py'); // Path to your Python script

// --- Middleware ---
app.use(express.json()); // For parsing JSON request bodies

const corsOptions = {
  origin: 'http://localhost:1234',
  optionsSuccessStatus: 200 // For legacy browser support
};
app.use(cors(corsOptions));

// To allow multiple specific origins
const allowedOrigins = [
  'http://localhost:1234',
  'http://localhost:8080', // Another frontend origin
  'https://your-frontend-domain.com' // Production frontend
];
app.use(cors({
    origin: function (ctxOrigin, callback) {
        // allow requests with no origin (like Node.js)
        if (!ctxOrigin) return callback(null, true);
        if (allowedOrigins.indexOf(ctxOrigin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    optionsSuccessStatus: 200
}));



// --- Endpoint ---
app.get('/api/scramble', (req, res) => {
    const length = req.query.length || 20; // Default length is 20, get from query param

    // Spawn the Python script as a child process
    // 'python' or 'python3' depends on your system's setup
    const pythonProcess = spawn('python', [pythonScriptPath, length]); 

    let scrambleOutput = '';
    let errorOutput = '';

    // Handle standard output from the Python script
    pythonProcess.stdout.on('data', (data) => {
        scrambleOutput += data.toString();
    });

    // Handle standard error from the Python script
    pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
    });

    // Handle when the Python script process exits
    pythonProcess.on('close', (code) => {
        if (code === 0) {
            // Python script exited successfully
            res.json({
                scramble: scrambleOutput.trim(), // Trim whitespace from output
                length: parseInt(length),
                message: 'Scramble generated successfully.'
            });
        } else {
            // Python script exited with an error
            console.error(`Python script exited with code ${code}`);
            console.error(`Python stderr: ${errorOutput}`);
            res.status(500).json({
                message: 'Failed to generate scramble.',
                error: errorOutput || 'An unknown error occurred in the Python script.'
            });
        }
    });

    // Handle errors during process spawning (e.g., python not found)
    pythonProcess.on('error', (err) => {
        console.error('Failed to start Python process:', err);
        res.status(500).json({
            message: 'Failed to start Python process.',
            error: err.message
        });
    });
});

// --- Start Server ---
app.listen(port, () => {
    console.log(`Express server running on port ${port}`);
    console.log(`Python script path: ${pythonScriptPath}`);
    console.log(`To get a scramble, visit: http://localhost:${port}/api/scramble`);
});