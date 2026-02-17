"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongo_1 = require("./mongo");
const auth_1 = __importDefault(require("./routes/auth"));
const profiles_1 = __importDefault(require("./routes/profiles"));
const students_1 = __importDefault(require("./routes/students"));
const attendance_1 = __importDefault(require("./routes/attendance"));
const subjects_1 = __importDefault(require("./routes/subjects"));
const stats_1 = __importDefault(require("./routes/stats"));
const marks_1 = __importDefault(require("./routes/marks"));
const schemes_1 = __importDefault(require("./routes/schemes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Connect to DB
async function startServer() {
    await (0, mongo_1.connectToDb)();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`✅ Server running on http://localhost:${PORT}`);
    });
}
startServer();
// Register routes
app.use('/api/auth', auth_1.default);
app.use('/api/profiles', profiles_1.default);
app.use('/api/students', students_1.default);
app.use('/api/attendance', attendance_1.default);
app.use('/api/subjects', subjects_1.default);
app.use('/api/stats', stats_1.default);
app.use('/api/marks', marks_1.default);
app.use('/api/schemes', schemes_1.default);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});
