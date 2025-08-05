import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

// Scramble generation function
function generateWCAScramble(length = 20) {
    const faces = ['U', 'D', 'R', 'L', 'F', 'B'];
    const suffixes = ['', '2', "'"];
    
    // Group faces by axis
    const axes = [
        ['U', 'D'],  // y-axis
        ['R', 'L'],  // x-axis
        ['F', 'B']   // z-axis
    ];
    
    let scramble = [];
    let lastAxis = -1;
    let lastFace = '';
    
    while (scramble.length < length) {
        // Choose a random axis (but not the same as the last one if possible)
        let axisIndex;
        do {
            axisIndex = Math.floor(Math.random() * axes.length);
        } while (axisIndex === lastAxis && scramble.length > 0 && Math.random() > 0.1);
        
        // Choose a random face from this axis
        const axis = axes[axisIndex];
        let face = axis[Math.floor(Math.random() * axis.length)];
        
        // If we're on the same axis as last move, ensure we don't use the same face
        if (axisIndex === lastAxis && face === lastFace) {
            face = axis[1 - axis.indexOf(face)];
        }
        
        // Choose a random suffix
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        
        scramble.push(face + suffix);
        lastAxis = axisIndex;
        lastFace = face;
    }
    
    return scramble.join(' ');
}

// Middleware
app.use(express.json());

// Enable CORS for all origins
app.use(cors());

// OR configure CORS with specific options
app.use(cors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
}));

// GET endpoint for scramble
app.get('/api/scramble', (req, res) => {
    try {
        // Get length from query parameter, default to 20
        const length = parseInt(req.query.length) || 20;
        
        // Validate     
        if (length < 1 || length > 100) {
            return res.status(400).json({
                error: 'Invalid length. Please provide a length between 1 and 100.'
            });
        }
        
        const scramble = generateWCAScramble(length);
        
        res.json({
            scramble: scramble,
            length: length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to generate scramble',
            message: error.message
        });
    }
});

// GET endpoint for multiple scrambles
app.get('/api/scrambles', (req, res) => {
    try {
        const count = parseInt(req.query.count) || 5;
        const length = parseInt(req.query.length) || 20;
        
        // Validate parameters
        if (count < 1 || count > 50) {
            return res.status(400).json({
                error: 'Invalid count. Please provide a count between 1 and 50.'
            });
        }
        
        if (length < 1 || length > 100) {
            return res.status(400).json({
                error: 'Invalid length. Please provide a length between 1 and 100.'
            });
        }
        
        const scrambles = [];
        for (let i = 0; i < count; i++) {
            scrambles.push(generateWCAScramble(length));
        }
        
        res.json({
            scrambles: scrambles,
            count: count,
            length: length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to generate scrambles',
            message: error.message
        });
    }
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Rubik\'s Cube Scramble API',
        endpoints: {
            'GET /api/scramble': 'Get a single scramble',
            'GET /api/scramble?length=25': 'Get a scramble with custom length',
            'GET /api/scrambles': 'Get multiple scrambles (default: 5)',
            'GET /api/scrambles?count=10&length=25': 'Get custom number of scrambles with custom length'
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Scramble API server running on http://localhost:${PORT}`);
});